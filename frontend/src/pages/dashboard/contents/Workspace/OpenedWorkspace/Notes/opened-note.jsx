import React, { useEffect, useRef, useState } from "react";
import {
  FaBookReader,
  FaCheck,
  FaCloud,
  FaListUl,
  FaRegCopy,
  FaSave,
} from "react-icons/fa";

import { AiOutlineDownload, AiOutlineEdit } from "react-icons/ai";
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
    <div className="flex flex-col h-full bg-white">
      <ToastContainer />
      {loading ? (
        <div className="space-y-4">
          <div className="flex space-x-4">
            <div className="h-6 bg-gray-300 rounded w-1/2 animate-pulse"></div>
            <div className="h-6 bg-gray-300 rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="flex space-x-4">
            <div className="h-48 bg-gray-300 rounded w-1/2 animate-pulse"></div>
            <div className="h-48 bg-gray-300 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row lg:flex-row justify-between border-b-1">
            <div className="flex items-center gap-2 justify-between overflow-auto">
              <div className="flex items-center mb-1 gap-3">
                {/* <div> */}
                <FaListUl
                  className="cursor-pointer"
                  onClick={() => {
                    window.history.back();
                  }}
                />
                <span className="border-2 pr-2 flex items-center gap-2 p-2 rounded w-fit">
                  <input
                    type="text"
                    value={noteData?.title || ""}
                    onChange={handleTitleChange}
                    className="outline-none w-fit bg-transparent"
                  />
                </span>
                <div className="flex items-center gap-2">
                  <div className="relative p-1 flex items-center justify-center">
                    <div>
                      <FaCloud size={30} />
                    </div>
                    {autoSaving ? (
                      <span className="absolute z-10 loading spinner text-gray-200 text-xs"></span>
                    ) : (
                      <span className="absolute z-10 text-gray-200 text-md">
                        <FaCheck />
                      </span>
                    )}
                  </div>
                  <button className="btn btn-sm" onClick={handleSaveChanges}>
                    <FaSave />
                    Save
                  </button>
                  {noteData?.public ? (
                    <div className="flex items-center p-1 gap-2 border-1 border-gray-400 rounded-full">
                      <p className="text-sm">Published</p>
                      <FaRegCopy
                        className="cursor-pointer"
                        title="Copy public URL"
                        onClick={handleCopy}
                      />
                      <p ref={textRef} className="hidden ">
                        {/* {publicUrl} */}
                        {`${window.location.origin}/public/notes/${noteData.id}`}
                      </p>
                    </div>
                  ) : (
                    <button
                      className="btn btn-sm"
                      onClick={() => handlePublishNote(noteData?.id)}
                    >
                      Publish
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* viewport manage */}
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-end gap-2 p-2">
                <span
                  className="flex items-center gap-2"
                  onClick={handleChangeMode}
                >
                  {editMode ? (
                    <FaBookReader
                      size={24}
                      className="cursor-pointer"
                      title="View Mode "
                    />
                  ) : (
                    <AiOutlineEdit
                      size={24}
                      className="cursor-pointer"
                      title="Edit Mode"
                    />
                  )}
                </span>
                {/* <AiOutlineMore /> */}
              </div>
            </div>
          </div>
          <div className="flex h-full overflow-auto">
            {/* body section */}
            <div className="flex-1 flex flex-col md:flex-row p-2 gap-3 min-h-full grow w-full">
              {/* editing area */}
              {editMode && (
                <div className="flex-1 shadow-md p-2 text-wrap border-1 rounded overflow-hidden">
                  <p className="font-bold text-gray-400 px-2 rounded-t-md border-b-2">
                    Editing Area
                  </p>
                  <textarea
                    placeholder="Start typing here..."
                    className="w-full min-h-full outline-none resize-none bg-white p-2 scrollbar-hide"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                  ></textarea>
                </div>
              )}
              {/* viewing area */}
              {previewMode && (
                <div className="flex-1 shadow-md p-2 text-wrap overflow-auto border-1 rounded sm:max-w-3xl sm:mx-auto">
                  <div className="flex items-center justify-between border-b-2">
                    <p className="font-bold text-gray-400 px-2 rounded-t-md">
                      Viewing Area
                    </p>
                    <div
                      className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-md cursor-pointer"
                      title="Download note as PDF"
                      onClick={handleSaveNoteAsPDF}
                    >
                      <AiOutlineDownload size={20} /> Save PDF
                    </div>
                  </div>
                  <div ref={noteRef}>
                    <MarkdownRenderer content={noteInput} />
                    {/* <EditableMarkdown /> */}
                  </div>
                </div>
              )}

              {/* AI Assist area */}
              {useGemini && (
                <div
                  className={`${
                    aiAssistMode
                      ? "flex-1 shadow-md p-2 text-wrap border-1 rounded overflow-hidden"
                      : "absolute right-0"
                  } `}
                >
                  <div
                    className={`flex items-center justify-between ${
                      aiAssistMode
                        ? "border-b-2"
                        : "rounded-full border-2 bg-white"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 ${
                        aiAssistMode && "hover:bg-gray-100"
                      } p-2 rounded-md cursor-pointer`}
                      onClick={geminiAssistHandle}
                      title={
                        aiAssistMode
                          ? "Gemini AI Assist; Click to shrink"
                          : "Gemini AI Assist; Click to expand"
                      }
                    >
                      <GeminiIcon width={30} />
                    </div>

                    {aiAssistMode && (
                      <p className="font-bold text-gray-400 px-2 rounded-t-md">
                        Ask Gemini
                      </p>
                    )}
                  </div>
                  {aiAssistMode && <NoteChat noteContext={noteInput} />}
                </div>
              )}
            </div>
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
