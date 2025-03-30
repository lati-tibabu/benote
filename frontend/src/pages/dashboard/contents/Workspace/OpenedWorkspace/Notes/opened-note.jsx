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
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
import MarkdownRenderer from "../../../../../../components/markdown-renderer";

const OpenedNote = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const { note_id } = useParams();

  const workspace = useSelector((state) => state.workspace.workspace);

  // for handling the edit mode and preview mode for note editing and viewing
  const [editMode, setEditMode] = useState(true);

  const [previewMode, setPreviewMode] = useState(true);

  // for holding the currently authenticated user data

  const userData = useSelector((state) => state.auth.user);

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
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`<html><head><title>${noteData?.title}</title>`);

    printWindow.document.write(`
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap" rel="stylesheet"></link>`);

    printWindow.document.write(styles);
    printWindow.document.write("</head><body>");
    printWindow.document.write(noteRef.current.innerHTML);
    printWindow.document.write("</body></html>");

    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    };
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
                <div className="flex-1 shadow-md p-2 text-wrap overflow-auto border-1 rounded max-w-3xl mx-auto">
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
                  </div>
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

const styles = `
    <style>
      body {
        font-family: "Nunito", Arial, sans-serif;
        margin: 20px;
        color: #333;
      }
      h1 {
        font-size: 2rem;
        font-weight: bold;
      }
      h2 {
        font-size: 1.5rem;
        font-weight: bold;
      }
      h3 {
        font-size: 1.25rem;
        font-weight: bold;
      }
      h4 {
        font-size: 1.125rem;
        font-weight: bold;
      }
      h5 {
        font-size: 1rem;
        font-weight: bold;
      }
      h6 {
        font-size: 0.875rem;
        font-weight: bold;
      }
      p {
        line-height: 1.6;
      }
      .font-bold {
        font-weight: bold;
      }
      .bg-blue-200 {
        background-color: #bbdefb;
      }
      .bg-gray-200 {
        background-color: #e0e0e0;
      }
      .text-blue-500 {
        color: #3b82f6;
      }
      .text-blue-700 {
        color: #1d4ed8;
      }
      .text-3xl {
        font-size: 1.875rem;
      }
      .text-2xl {
        font-size: 1.5rem;
      }
      .text-xl {
        font-size: 1.25rem;
      }
      .text-lg {
        font-size: 1.125rem;
      }
      .text-md {
        font-size: 1rem;
      }
      .text-sm {
        font-size: 0.875rem;
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
      }
      .border-l-4 {
        border-left: 4px solid #374151;
      }
      .border-collapse {
        border-collapse: collapse;
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
      }
      .underline {
        text-decoration: underline;
      }
    </style>
  `;
