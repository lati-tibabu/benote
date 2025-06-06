import React, { useEffect, useState } from "react";
import { FaBolt, FaTrash } from "react-icons/fa";
import { AiOutlineFile, AiOutlineMore, AiOutlinePlus } from "react-icons/ai";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { clearNotes, setNotes } from "../../../../../redux/slices/notesSlice";
import AiGeneratedNote from "./Notes/ai-generated-note";
import GeminiIcon from "../../../../../components/geminiIcon";
import FileToNoteUploader from "../../../../../components/FileToNoteUploader";
// import FileToNoteUploader from "../../../../components/FileToNoteUploader"; // Adjust the import path as needed

const Notes = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const { workspaceId } = useParams();
  const useGemini = localStorage.getItem("useGemini") === "true" ? true : false;
  const notes = useSelector((state) => state.notes.notes) || [];
  const [loading, setLoading] = useState(false);
  const userData = useSelector((state) => state.auth.user) || {};
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'

  // Filter notes by search term
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // adding new note
  const handleAddNewNote = async () => {
    const newTitle = `Note_${new Date()
      .toISOString()
      .replace(/\..+/, "")
      .replace(/:/g, "-")
      .replace(/T/g, "_")}`;

    // const workspaceId = workspace.id;
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
        toast.success("Note created succesfully");
        fetchNotes();
      } else {
        toast.error("Error creating the note");
        console.log(await response.text());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const dispatch = useDispatch();

  //fetching all notes for the given workspace
  const fetchNotes = async () => {
    !notes.length && setLoading(true);
    try {
      const response = await fetch(`${apiURL}/api/notes/${workspaceId}`, {
        method: "GET",
        headers: header,
      });

      if (!response.ok) {
        dispatch(clearNotes());
      }
      const data = await response.json();
      dispatch(setNotes(data));
    } catch (error) {
      console.error("error happening", error);
    } finally {
      setLoading(false);
    }
  };

  //fetching all notes for the given workspace up on mounting the component

  useEffect(() => {
    fetchNotes();
  }, []);

  //deleting note
  const handleDeleteNote = async (id) => {
    try {
      if (window.confirm("Are  you sure you want to delete this note?")) {
        const response = await fetch(`${apiURL}/api/notes/${id}`, {
          method: "DELETE",
          headers: header,
        });
        if (response.ok) {
          toast.success("Note deleted successfully!");
          fetchNotes();
        }
      }
    } catch (error) {
      toast.error("Error deleting the note!");
      console.error(error);
    }
  };

  const navigate = useNavigate();

  const selectNote = (id) => {
    navigate(id);
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <ToastContainer />
      {/* Header */}
      <div className="flex flex-row items-center justify-between border-b border-gray-100 pb-3 mb-6 bg-white rounded-xl shadow-sm px-2">
        <h1 className="font-bold text-xl tracking-tight text-gray-900 flex items-center gap-2">
          <AiOutlineFile className="text-blue-500" size={22} />
          Notes
        </h1>
        <div className="flex items-center gap-2">
          {useGemini && (
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-tr from-blue-50 to-pink-50 hover:from-blue-100 hover:to-pink-100 text-gray-700 border border-gray-100 shadow-sm transition"
              onClick={() => document.getElementById("ai_gen_note").showModal()}
            >
              <GeminiIcon size={18} />
              <span className="font-medium text-sm">AI Note</span>
            </button>
          )}
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition"
            onClick={handleAddNewNote}
          >
            <AiOutlinePlus size={18} /> New
          </button>
        </div>
      </div>
      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <input
          type="text"
          placeholder="Search notes..."
          className="w-full sm:w-64 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm bg-gray-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex gap-1 items-center justify-end mt-2 sm:mt-0">
          <button
            className={`p-2 rounded-lg ${
              viewMode === "list"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-400"
            }`}
            title="List view"
            onClick={() => setViewMode("list")}
          >
            <AiOutlineFile size={18} />
          </button>
          <button
            className={`p-2 rounded-lg ${
              viewMode === "grid"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-400"
            }`}
            title="Grid view"
            onClick={() => setViewMode("grid")}
          >
            <AiOutlineMore size={18} />
          </button>
        </div>
      </div>
      {/* Notes Table or Grid */}
      <div className="flex flex-col p-1 gap-2">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse flex items-center space-x-3"
              >
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
                <div className="h-5 w-1/4 bg-gray-200 rounded"></div>
                <div className="h-5 w-1/6 bg-gray-200 rounded"></div>
                <div className="h-5 w-1/6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : viewMode === "list" ? (
          <div className="flex flex-col overflow-auto scrollbar-hide">
            {Array.isArray(filteredNotes) ? (
              filteredNotes.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No notes found.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg shadow bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-600 bg-gray-50 border-b border-gray-100">
                        <th className="w-8"></th>
                        <th className="text-left font-medium">Title</th>
                        <th className="text-left font-medium">Created</th>
                        <th className="text-left font-medium">Updated</th>
                        <th className="text-left font-medium">Owner</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNotes.map((note, index) => (
                        <tr
                          key={note.id}
                          className="hover:bg-blue-50/60 transition group border-b border-gray-50"
                        >
                          <td className="text-gray-300 text-xs pl-2">
                            {index + 1}
                          </td>
                          <td
                            className="flex items-center gap-2 cursor-pointer text-blue-700 font-medium hover:underline"
                            onClick={() => selectNote(note.id)}
                          >
                            <AiOutlineFile
                              size={18}
                              className="text-blue-400"
                            />
                            <span className="truncate max-w-[140px]">
                              {note.title}
                            </span>
                          </td>
                          <td className="text-xs text-gray-500">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </td>
                          <td className="text-xs text-gray-500">
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="text-xs text-gray-600">
                            {note.user.name}
                          </td>
                          <td className="pr-2">
                            <button
                              className="p-1 rounded hover:bg-red-50 transition text-red-500"
                              title="Delete"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <FaTrash size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <p className="bg-red-100 text-red-500 p-5">
                Notes is not an array.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredNotes.length === 0 ? (
              <p className="text-gray-400 text-center py-8 col-span-full">
                No notes found.
              </p>
            ) : (
              filteredNotes.map((note, index) => (
                <div
                  key={note.id}
                  className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex flex-col gap-2 hover:shadow-md transition cursor-pointer group"
                  onClick={() => selectNote(note.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <AiOutlineFile size={20} className="text-blue-400" />
                    <span className="font-semibold text-blue-700 truncate max-w-[120px]">
                      {note.title}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 text-xs text-gray-500">
                    <span>
                      Created: {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    <span>
                      Updated: {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                    <span>
                      Owner:{" "}
                      <span className="text-gray-700">{note.user.name}</span>
                    </span>
                  </div>
                  <button
                    className="self-end p-1 rounded hover:bg-red-50 transition text-red-500 mt-2"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                  >
                    <FaTrash size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {/* File Upload Section */}
      <div className="mt-8 p-5 border rounded-xl bg-gray-50 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <AiOutlinePlus className="text-blue-500" size={18} />
          Upload File to Create Note
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          Supported: <span className="font-medium text-gray-700">.doc</span>,{" "}
          <span className="font-medium text-gray-700">.docx</span>,{" "}
          <span className="font-medium text-gray-700">.txt</span>
        </p>
        <div className="bg-white border border-dashed border-gray-200 rounded-lg p-3">
          <FileToNoteUploader />
        </div>
      </div>
      {/* AI Note Modal */}
      <dialog id="ai_gen_note" className="modal">
        <div className="modal-box bg-transparent p-0 rounded-lg shadow-xl w-11/12 max-w-none h-[95vh] overflow-hidden">
          <form method="dialog" className="absolute top-4 right-4 z-10">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <AiGeneratedNote />
        </div>
      </dialog>
    </div>
  );
};

export default Notes;
