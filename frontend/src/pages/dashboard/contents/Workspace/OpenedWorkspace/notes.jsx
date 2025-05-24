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
    <div className="bg-gradient-to-br from-gray-50 to-white min-h-screen p-4">
      <ToastContainer />
      {/* Header */}
      <div className="flex flex-row items-center justify-between border-b border-gray-200 pb-4 mb-6 bg-white/80 rounded-2xl shadow-sm px-4">
        <h1 className="font-extrabold text-2xl tracking-tight text-gray-900">
          Notes
        </h1>
        <div className="flex items-center gap-3">
          {useGemini && (
            <div
              className="btn transition-all duration-300 shadow-md bg-gradient-to-tr from-pink-100 to-blue-100 hover:from-pink-200 hover:to-blue-200 text-gray-700 border-white btn-soft rounded-full flex items-center gap-2 px-4 py-2"
              onClick={() => document.getElementById("ai_gen_note").showModal()}
            >
              <GeminiIcon size={20} />
              <span className="font-semibold">Generate Note</span>
            </div>
          )}
          <button
            className="btn bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-4 py-2 shadow-md transition flex items-center gap-2"
            onClick={handleAddNewNote}
          >
            <AiOutlinePlus /> Add new
          </button>
        </div>
      </div>
      {/* Notes Table */}
      <div className="flex flex-col p-2 gap-2">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse flex items-center space-x-4">
                <div className="h-6 w-6 bg-gray-300 rounded"></div>
                <div className="h-6 w-1/3 bg-gray-300 rounded"></div>
                <div className="h-6 w-1/4 bg-gray-300 rounded"></div>
                <div className="h-6 w-1/5 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="list-none flex flex-col overflow-auto scrollbar-hide">
            {Array.isArray(notes) ? (
              notes.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No notes found.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl shadow-md bg-white/90">
                  <table className="table w-full">
                    <thead>
                      <tr className="text-gray-700 text-sm bg-gray-50">
                        <th></th>
                        <th>Title</th>
                        <th>Created At</th>
                        <th>Updated At</th>
                        <th>Owner</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {notes.map((note, index) => (
                        <tr key={note.id} className="hover:bg-blue-50 transition">
                          <td className="text-gray-400 font-semibold">{index + 1}</td>
                          <td
                            className="flex items-center gap-2 hover:underline cursor-pointer text-blue-700 font-medium"
                            onClick={() => selectNote(note.id)}
                          >
                            <AiOutlineFile size={20} />
                            <span className="truncate max-w-[180px]">{note.title}</span>
                          </td>
                          <td className="text-xs text-gray-500">{new Date(note.createdAt).toDateString()}</td>
                          <td className="text-xs text-gray-500">{new Date(note.updatedAt).toDateString()}</td>
                          <td className="text-xs text-gray-600">{note.user.name}</td>
                          <td>
                            <div className="dropdown flex justify-end cursor-pointer">
                              <div role="button" tabIndex={0}>
                                <AiOutlineMore size={22} className="text-gray-400 hover:text-blue-600 transition" />
                              </div>
                              <ul
                                tabIndex={0}
                                className="dropdown-content menu bg-white border border-gray-200 rounded-xl w-36 p-2 shadow-xl text-left absolute right-0 mt-2 z-20"
                              >
                                <li>
                                  <button
                                    className="flex items-center gap-2 p-2 text-red-600 hover:text-red-700 rounded-md hover:bg-red-50 transition w-full"
                                    onClick={() => handleDeleteNote(note.id)}
                                  >
                                    <FaTrash />
                                    Delete
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <p className="bg-red-100 text-red-500 p-5">Notes is not an array.</p>
            )}
          </div>
        )}
      </div>
      {/* File Upload Section */}
      <div className="mt-8 p-6 border rounded-2xl bg-white/90 shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Upload File to Create Note
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Supported formats: <span className="font-medium text-gray-700">.doc</span>, <span className="font-medium text-gray-700">.docx</span>, <span className="font-medium text-gray-700">.txt</span>
        </p>
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4">
          <FileToNoteUploader />
        </div>
      </div>
      {/* AI Note Modal */}
      <dialog id="ai_gen_note" className="modal overflow-x-scroll">
        <div className="modal-box bg-white p-4 rounded-md shadow-md sm:w-fit lg:w-1/2 mx-auto mt-10">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <AiGeneratedNote />
        </div>
      </dialog>
    </div>
  );
};

export default Notes;
