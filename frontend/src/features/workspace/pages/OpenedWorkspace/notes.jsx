import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { AiOutlineFile, AiOutlinePlus } from "react-icons/ai";
import {
  PiCaretLeftBold,
  PiCaretRightBold,
  PiGridFour,
  PiList,
  PiUploadSimple,
} from "react-icons/pi";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { clearNotes, setNotes } from "@redux/slices/notesSlice";
import AiGeneratedNote from "./Notes/ai-generated-note";
import GeminiIcon from "@features/ai/components/geminiIcon";
import FileToNoteUploader from "@features/notes/components/FileToNoteUploader";

const Notes = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const { workspaceId } = useParams();
  const useGemini = localStorage.getItem("useGemini") === "true";
  const notes = useSelector((state) => state.notes.notes) || [];
  const [loading, setLoading] = useState(false);
  const userData = useSelector((state) => state.auth.user) || {};
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Default page size
  const [totalItems, setTotalItems] = useState(0);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // adding new note
  const handleAddNewNote = async () => {
    const newTitle = `Note_${new Date()
      .toISOString()
      .replace(/\..+/, "")
      .replace(/:/g, "-")
      .replace(/T/g, "_")}`;

    const userId = userData.id;

    const newNoteData = {
      workspace_id: workspaceId,
      owned_by: userId,
      title: newTitle,
      content: "",
    };

    try {
      const response = await fetch(`${apiURL}/api/notes`, {
        method: "POST",
        headers: header,
        body: JSON.stringify(newNoteData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Note created successfully");
        fetchNotes(currentPage, pageSize); // Re-fetch notes to include the new one
        navigate(data.id); // Navigate to the newly created note
      } else {
        const errorData = await response.text();
        toast.error("Error creating the note");
        console.error("Error creating note:", errorData);
      }
    } catch (error) {
      console.error("Network error creating note:", error);
      toast.error("Network error or server unavailable.");
    }
  };

  //fetching all notes for the given workspace with pagination
  const fetchNotes = async (page, size) => {
    !notes.length && setLoading(true); // Show loading only if no notes are currently loaded
    try {
      const response = await fetch(
        `${apiURL}/api/notes/${workspaceId}?page=${page}&pageSize=${size}`,
        {
          method: "GET",
          headers: header,
        }
      );

      if (!response.ok) {
        dispatch(clearNotes());
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to fetch notes.");
      } else {
        const data = await response.json();
        dispatch(setNotes(data.notes));
        setTotalItems(data.totalItems);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        setPageSize(data.pageSize);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Network error or server unavailable.");
    } finally {
      setLoading(false);
    }
  };

  //fetching all notes for the given workspace upon mounting the component
  useEffect(() => {
    fetchNotes(currentPage, pageSize);
  }, [workspaceId, currentPage, pageSize]);

  //deleting note
  const handleDeleteNote = async (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this note?")) {
        const response = await fetch(`${apiURL}/api/notes/${id}`, {
          method: "DELETE",
          headers: header,
        });
        if (response.ok) {
          toast.success("Note deleted successfully!");
          fetchNotes(currentPage, pageSize); // Re-fetch notes after deletion
        } else {
          toast.error("Error deleting the note!");
          console.error("Error deleting note:", await response.text());
        }
      }
    } catch (error) {
      toast.error("Error deleting the note!");
      console.error("Network error deleting note:", error);
    }
  };

  const selectNote = (id) => {
    navigate(id);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between pb-4 mb-8 bg-white rounded-sm shadow-sm px-6 py-4 border border-gray-100">
        <h1 className="font-semibold text-2xl text-gray-800 flex items-center gap-3 mb-4 sm:mb-0">
          <AiOutlineFile className="text-gray-500" size={24} />
          Notes
        </h1>
        <div className="flex items-center gap-3">
          {useGemini && (
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-sm bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium text-sm shadow-sm hover:from-gray-700 hover:to-gray-800 transition transform hover:-translate-y-0.5"
              onClick={() => document.getElementById("ai_gen_note").showModal()}
            >
              <GeminiIcon size={18} />
              AI Note
            </button>
          )}
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-sm bg-white text-gray-600 border border-gray-200 font-medium text-sm shadow-sm hover:bg-gray-50 hover:border-gray-300 transition transform hover:-translate-y-0.5"
            onClick={() =>
              document.getElementById("upload_note_modal").showModal()
            }
          >
            <PiUploadSimple size={18} /> Upload
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-sm bg-gray-600 text-white font-medium text-sm shadow-sm hover:bg-gray-700 transition transform hover:-translate-y-0.5"
            onClick={handleAddNewNote}
          >
            <AiOutlinePlus size={18} /> New Note
          </button>
        </div>
      </div>

      {/* View Controls */}
      <div className="flex justify-end mb-6">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-sm">
          <button
            className={`p-2 rounded-sm transition ${
              viewMode === "list"
                ? "bg-white text-gray-600 shadow-sm"
                : "text-gray-500 hover:bg-gray-200"
            }`}
            title="List view"
            onClick={() => setViewMode("list")}
          >
            <PiList size={20} />
          </button>
          <button
            className={`p-2 rounded-sm transition ${
              viewMode === "grid"
                ? "bg-white text-gray-600 shadow-sm"
                : "text-gray-500 hover:bg-gray-200"
            }`}
            title="Grid view"
            onClick={() => setViewMode("grid")}
          >
            <PiGridFour size={20} />
          </button>
        </div>
      </div>

      {/* Notes Display Area */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(pageSize)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-sm shadow-sm p-5 h-32 flex flex-col justify-between animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white rounded-sm shadow-sm py-16 px-6 text-gray-500">
          <AiOutlineFile size={48} className="text-gray-300 mb-4" />
          <p className="text-lg font-medium">No notes found.</p>
          <p className="text-sm mt-2 text-center max-w-sm">
            Start by creating a new note or uploading an existing file to get
            started.
          </p>
          <button
            onClick={handleAddNewNote}
            className="mt-6 flex items-center gap-2 px-6 py-3 rounded-sm bg-gray-600 text-white font-semibold shadow-sm hover:bg-gray-700 transition transform hover:-translate-y-1"
          >
            <AiOutlinePlus size={20} /> Create Your First Note
          </button>
        </div>
      ) : viewMode === "list" ? (
        <div className="overflow-x-auto rounded-sm shadow-sm bg-white border border-gray-100">
          <table className="min-w-full text-md text-left text-gray-700">
            <caption className="p-4 text-sm text-gray-500 text-right">
              <span className="font-semibold">Total Notes:</span> {totalItems}
            </caption>
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="py-3 px-6 font-semibold text-gray-600 w-12">
                  #
                </th>
                <th className="py-3 px-6 font-semibold text-gray-600">Title</th>
                <th className="py-3 px-6 font-semibold text-gray-600 whitespace-nowrap">
                  Created On
                </th>
                <th className="py-3 px-6 font-semibold text-gray-600 whitespace-nowrap">
                  Last Updated
                </th>
                <th className="py-3 px-6 font-semibold text-gray-600">Owner</th>
                <th className="py-3 px-6 font-semibold text-gray-600 text-right w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note, index) => (
                <tr
                  key={note.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition even:bg-white odd:bg-gray-50/50"
                >
                  <td className="py-3 px-6 text-gray-400">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td
                    className="py-3 px-6 flex items-center gap-2 cursor-pointer text-gray-700 font-medium hover:underline"
                    onClick={() => selectNote(note.id)}
                  >
                    <AiOutlineFile size={18} className="text-gray-400" />
                    <span className="truncate max-w-[200px]">{note.title}</span>
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-600 whitespace-nowrap">
                    {new Date(note.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-600 whitespace-nowrap">
                    {new Date(note.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-700">
                    {note.user.name}
                  </td>
                  <td className="py-3 px-6 text-right">
                    <button
                      className="p-2 rounded-sm text-red-500 hover:bg-red-100 transition"
                      title="Delete"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <FaTrash size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white border border-gray-100 rounded-sm shadow-sm p-5 flex flex-col gap-3 hover:shadow-sm transition cursor-pointer group relative"
              onClick={() => selectNote(note.id)}
            >
              <div className="flex items-center gap-3 mb-2">
                <AiOutlineFile size={22} className="text-gray-500" />
                <span className="font-semibold text-lg text-gray-800 truncate">
                  {note.title}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-sm text-gray-600">
                <span>
                  **Created:**{" "}
                  {new Date(note.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span>
                  **Updated:**{" "}
                  {new Date(note.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span>
                  **Owner:**{" "}
                  <span className="font-medium">{note.user.name}</span>
                </span>
              </div>
              <button
                className="absolute top-4 right-4 p-2 rounded-sm text-red-500 opacity-0 group-hover:opacity-100 bg-white shadow-sm hover:bg-red-100 transition"
                title="Delete"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click when deleting
                  handleDeleteNote(note.id);
                }}
              >
                <FaTrash size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 py-3 bg-white rounded-sm shadow-sm border border-gray-100">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-sm bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <PiCaretLeftBold size={18} />
          </button>
          <span className="text-gray-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-sm bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <PiCaretRightBold size={18} />
          </button>
        </div>
      )}

      {/* Upload Note Modal */}
      <dialog id="upload_note_modal" className="modal backdrop:bg-gray-900/50">
        <div className="modal-box bg-white p-8 rounded-sm shadow-sm w-11/12 max-w-lg relative">
          <form method="dialog" className="absolute top-4 right-4">
            <button className="btn btn-sm btn-circle btn-ghost text-gray-500 hover:bg-gray-100">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-3">
            <PiUploadSimple className="text-gray-600" size={24} />
            Upload File to Create Note
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Supported file types: <span className="font-semibold">.doc</span>,{" "}
            <span className="font-semibold">.docx</span>,{" "}
            <span className="font-semibold">.txt</span>
          </p>
          <FileToNoteUploader />
        </div>
      </dialog>

      {/* AI Note Modal */}
      <dialog id="ai_gen_note" className="modal backdrop:bg-gray-900/50">
        <div className="modal-box bg-transparent p-0 rounded-sm shadow-sm w-11/12 max-w-none h-[90vh] overflow-hidden">
          <form method="dialog" className="absolute top-4 right-4 z-10">
            <button className="btn btn-sm btn-circle btn-ghost text-white bg-black/30 hover:bg-black/50">
              ✕
            </button>
          </form>
          {/* Ensure AiGeneratedNote itself has proper styling or is contained */}
          <AiGeneratedNote />
        </div>
      </dialog>
    </div>
  );
};

export default Notes;
