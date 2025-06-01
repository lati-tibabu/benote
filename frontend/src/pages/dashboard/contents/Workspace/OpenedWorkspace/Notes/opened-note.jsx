import React, { useEffect, useRef, useState } from "react";
import {
  PiBookOpenDuotone,
  PiCheckCircleDuotone,
  PiCloudDuotone,
  PiListBulletsDuotone,
  PiCopyDuotone,
  PiFloppyDiskDuotone,
  PiDownloadSimpleDuotone,
  PiPencilSimpleDuotone,
  PiEyeDuotone,
  PiShareFatDuotone,
  PiSparkleDuotone,
} from "react-icons/pi";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
import MarkdownRenderer from "../../../../../../components/markdown-renderer";
import NoteChat from "./noteChat";
import GeminiIcon from "../../../../../../components/geminiIcon";

const OpenedNote = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const { note_id } = useParams();

  const workspace = useSelector((state) => state.workspace.workspace);
  const useGemini = localStorage.getItem("useGemini") === "true" ? true : false;

  // for holding the currently authenticated user data
  const userData = useSelector((state) => state.auth.user);

  // for handling the edit mode and preview mode for note editing and viewing
  const [editMode, setEditMode] = useState(true);
  const [previewMode, setPreviewMode] = useState(true);
  const [aiAssistMode, setAiAssistMode] = useState(false);

  // Use a single `noteData` state for title, content, and other note information
  const [noteData, setNoteData] = useState({
    title: "",
    content: "",
    workspace_id: workspace.id,
    owned_by: userData?.id,
  });

  // Use separate `noteInput` state to store only the editor content
  const [noteInput, setNoteInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);

  // Font selection for note preview
  const [noteFont, setNoteFont] = useState("app");
  const fontOptions = [
    { label: "App Default", value: "app" },
    { label: "Sans Serif", value: "sans-serif" },
    { label: "Serif", value: "serif" },
    { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
    { label: "Arial", value: "Arial, Helvetica, sans-serif" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Courier New", value: "'Courier New', Courier, monospace" },
    { label: "Monospace", value: "monospace" },
  ];

  // Managing the edit mode and preview mode
  const handleChangeMode = () => {
    setEditMode((prev) => !prev);
  };

  const fetchNote = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${apiURL}/api/notes/${workspace.id}/${note_id}`,
        {
          method: "GET",
          headers: header,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNoteData(data);
        setNoteInput(data.content || "");
      } else {
        // alert("Error fetching the note");
        toast.error("Error fetching the note");
        console.log(await response.text());
      }
    } catch (error) {
      toast.error("Error loading the note!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  //fetching a selected note in detail
  useEffect(() => {
    if (note_id) {
      fetchNote();
    }
  }, [note_id]);

  const handleSaveChanges = async () => {
    setAutoSaving(true);

    const dataToSave = {
      ...noteData,
      content: noteInput,
    };

    try {
      const response = await fetch(`${apiURL}/api/notes/${note_id}`, {
        method: "PUT",
        headers: header,
        body: JSON.stringify(dataToSave),
      });
      if (response.ok) {
        // const responseData = await response.json();
        toast.success("Note saved successfully!");
      } else {
        toast.error("Failed to save the note.");
        console.log(await response.text());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleTitleChange = (e) => {
    setNoteData({ ...noteData, title: e.target.value });
  };

  const handlePublishNote = async (noteId) => {
    if (!noteId || !workspace.id) {
      alert("Invalid note or workspace ID");
      return;
    }

    try {
      const response = await fetch(
        `${apiURL}/api/notes/${workspace.id}/${noteId}/publish`,
        {
          method: "PATCH",
          headers: header,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to publish the note");
      }

      const publicUrl = `${window.location.origin}/public/notes/${noteId}`;
      alert(`Note published successfully! Access it here: ${publicUrl}`);
      // open the public note in a new tab
      window.open(publicUrl, "_blank");
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const textRef = useRef(null);
  const handleCopy = () => {
    if (textRef.current) {
      navigator.clipboard
        .writeText(textRef.current.innerText)
        .then(() => toast.success("copied"))
        .catch(() => toast.error("Failed to copy"));
    }
  };

  const noteRef = useRef(null);

  const handleSaveNoteAsPDF = () => {
    const includeTitle = confirm(
      "Do you want to include the document title as a header in the PDF?"
    );
    const includePageNumbers = confirm(
      "Do you want to include page numbers in the PDF?"
    );

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`<html><head><title>${noteData?.title}</title>`);

    printWindow.document.write(`
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap" rel="stylesheet"></link>`);

    printWindow.document.write(styles);
    printWindow.document.write(`</head><body>`);

    if (includeTitle) {
      printWindow.document.write(`
          <header style="text-align: center; font-size: 1.5rem; font-weight: bold; margin-bottom: 20px;">
            ${noteData?.title}
          </header>
        `);
    }

    printWindow.document.write(noteRef.current.innerHTML);

    if (includePageNumbers) {
      printWindow.document.write(`
          <footer style="position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 0.875rem;">
            Page <span class="pageNumber"></span>
          </footer>
        `);
    }

    printWindow.document.write(`</body></html>`);

    printWindow.document.close();

    printWindow.onload = () => {
      if (includePageNumbers) {
        const style = document.createElement("style");
        style.innerHTML = `
              @media print {
                @page {
                  counter-increment: page;
                }
                .pageNumber::after {
                  content: counter(page);
                }
              }
            `;
        printWindow.document.head.appendChild(style);
      }

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    };
  };

  const geminiAssistHandle = () => {
    setAiAssistMode((prev) => !prev);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-blue-100 max-w-5xl mx-auto mt-4 mb-4">
      <ToastContainer />
      {loading ? (
        <div className="flex flex-col gap-4 p-8 animate-pulse">
          <div className="h-8 bg-blue-100 rounded w-1/2 mx-auto" />
          <div className="h-48 bg-blue-50 rounded w-full" />
        </div>
      ) : (
        <>
          {/* Header: Title, Save, Publish, Cloud, Mode Switch */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-blue-100 px-6 py-4 bg-white/80">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                className="p-2 rounded-full hover:bg-blue-50 transition"
                onClick={() => window.history.back()}
                title="Back to Notes List"
              >
                <PiListBulletsDuotone size={22} />
              </button>
              <input
                type="text"
                value={noteData?.title || ""}
                onChange={handleTitleChange}
                className="font-semibold text-lg bg-transparent outline-none px-2 py-1 rounded focus:bg-blue-50 transition w-48 md:w-64"
                placeholder="Note Title..."
              />
              <div className="flex items-center gap-2 ml-2">
                <span className="relative flex items-center">
                  <PiCloudDuotone size={22} className="text-blue-400" />
                  {autoSaving ? (
                    <span className="absolute -right-2 -top-2 animate-spin text-blue-300">
                      <PiSparkleDuotone size={14} />
                    </span>
                  ) : (
                    <span className="absolute -right-2 -top-2 text-green-400">
                      <PiCheckCircleDuotone size={14} />
                    </span>
                  )}
                </span>
                <button
                  className="p-2 rounded-full hover:bg-blue-50 transition"
                  onClick={handleSaveChanges}
                  title="Save Note"
                >
                  <PiFloppyDiskDuotone size={22} />
                </button>
                {noteData?.public ? (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-full text-xs text-blue-700 border border-blue-200">
                    <PiShareFatDuotone size={16} />
                    <span>Published</span>
                    <button
                      className="hover:text-blue-900"
                      title="Copy public URL"
                      onClick={handleCopy}
                    >
                      <PiCopyDuotone size={16} />
                    </button>
                    <span ref={textRef} className="hidden">
                      {`${window.location.origin}/public/notes/${noteData.id}`}
                    </span>
                  </div>
                ) : (
                  <button
                    className="p-2 rounded-full hover:bg-blue-50 transition"
                    onClick={() => handlePublishNote(noteData?.id)}
                    title="Publish Note"
                  >
                    <PiShareFatDuotone size={22} />
                  </button>
                )}
              </div>
            </div>
            {/* Mode Switch */}
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-full hover:bg-blue-50 transition"
                onClick={handleChangeMode}
                title={editMode ? "Switch to View Mode" : "Switch to Edit Mode"}
              >
                {editMode ? (
                  <PiEyeDuotone size={22} />
                ) : (
                  <PiPencilSimpleDuotone size={22} />
                )}
              </button>
            </div>
          </div>
          {/* Body: Editor, Preview, AI Assist */}
          <div className="flex flex-col md:flex-row gap-4 flex-1 p-6 bg-white/90">
            {/* Editing Area */}
            {editMode && (
              <div className="flex-1 flex flex-col bg-white border border-blue-100 rounded-lg shadow-sm p-4 min-h-[300px]">
                <div className="font-semibold text-blue-700 mb-2 text-sm flex items-center gap-4">
                  <span>Editing</span>
                  {/* Font selection dropdown */}
                  <label className="flex items-center gap-1 text-xs text-gray-500">
                    Font:
                    <select
                      className="ml-1 px-2 py-1 rounded border border-blue-100 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-200"
                      value={noteFont}
                      onChange={(e) => setNoteFont(e.target.value)}
                    >
                      {fontOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <textarea
                  placeholder="Start typing here..."
                  className="w-full flex-1 min-h-[200px] outline-none resize-none bg-transparent p-2 text-base text-gray-800 rounded"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                />
              </div>
            )}
            {/* Viewing Area */}
            {previewMode && (
              <div className="flex-1 flex flex-col bg-white border border-blue-100 rounded-lg shadow-sm p-4 min-h-[300px] max-w-2xl mx-auto">
                <div className="font-semibold text-blue-700 mb-2 text-sm flex items-center justify-between">
                  <span>Preview</span>
                  {/* Font selection dropdown (duplicate for preview) */}
                  <label className="flex items-center gap-1 text-xs text-gray-500">
                    Font:
                    <select
                      className="ml-1 px-2 py-1 rounded border border-blue-100 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-200"
                      value={noteFont}
                      onChange={(e) => setNoteFont(e.target.value)}
                    >
                      {fontOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 text-blue-700 text-xs"
                    title="Download as PDF"
                    onClick={handleSaveNoteAsPDF}
                  >
                    <PiDownloadSimpleDuotone size={16} /> PDF
                  </button>
                </div>
                <div
                  ref={noteRef}
                  className="prose max-w-full text-gray-900"
                  style={noteFont !== "app" ? { fontFamily: noteFont } : {}}
                >
                  <MarkdownRenderer content={noteInput} />
                </div>
              </div>
            )}
            {/* AI Assist Area */}
            {useGemini && (
              <div
                className={`flex flex-col ${
                  aiAssistMode ? "flex-1" : "w-12"
                } transition-all duration-300 bg-white border border-blue-100 rounded-lg shadow-sm p-2 relative min-h-[300px]`}
              >
                <button
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-blue-50 transition mx-auto mb-2"
                  onClick={geminiAssistHandle}
                  title={aiAssistMode ? "Hide Gemini AI" : "Show Gemini AI"}
                >
                  <GeminiIcon width={28} />
                </button>
                {aiAssistMode && (
                  <div className="flex-1">
                    <div className="font-semibold text-blue-700 mb-2 text-sm text-center">
                      Ask Gemini
                    </div>
                    <NoteChat noteContext={noteInput} />
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OpenedNote;

// Updated styles for a more professional and modern look
const styles = `
    <style>
      body {
        font-family: "Nunito", Arial, sans-serif;
        margin: 20px;
        color: #333;
        background-color: #f9f9f9;
      }
      img {
        margin-left: auto;
        margin-right: auto;
        padding: 0.5rem;
      }
      h1 {
        font-size: 2rem;
        font-weight: bold;
        color: #2c3e50;
      }
      h2 {
        font-size: 1.5rem;
        font-weight: bold;
        color: #34495e;
      }
      h3 {
        font-size: 1.25rem;
        font-weight: bold;
        color: #7f8c8d;
      }
      p {
        line-height: 1.8;
        color: #4d4d4d;
      }
      .font-bold {
        font-weight: bold;
      }
      .bg-blue-200 {
        background-color: #d6eaff;
      }
      .bg-gray-200 {
        background-color: #eaeaea;
      }
      .text-blue-500 {
        color: #3498db;
      }
      .text-blue-700 {
        color: #2980b9;
      }
      .rounded-full {
        border-radius: 9999px;
      }
      .w-fit {
        width: fit-content;
      }
      .p-1 {
        padding: 0.25rem;
      }
      .pl-5 {
        padding-left: 1.25rem;
      }
      .space-y-2 {
        margin-bottom: 0.5rem;
      }
      .list-disc {
        list-style-type: disc;
      }
      .list-decimal {
        list-style-type: decimal;
      }
      .border {
        border: 1px solid #d1d5db;
        border-radius: 8px;
      }
      .border-l-4 {
        border-left: 4px solid #374151;
      }
      .table-auto {
        table-layout: auto;
      }
      .px-4 {
        padding-left: 1rem;
        padding-right: 1rem;
      }
      .py-2 {
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }
      .pl-4 {
        padding-left: 1rem;
      }
      .max-w-full {
        max-width: 100%;
      }
      .rounded-box {
        border-radius: 0.375rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .underline {
        text-decoration: underline;
      }
      .btn {
        background-color: #3498db;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        transition: background-color 0.3s;
      }
      .btn:hover {
        background-color: #2980b9;
      }
      .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.875rem;
      }
      .shadow-md {
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .hover\:bg-gray-100:hover {
        background-color: #f0f0f0;
      }
    </style>
  `;
