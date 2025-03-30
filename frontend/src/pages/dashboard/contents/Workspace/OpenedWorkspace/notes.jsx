import React, { useEffect, useState } from "react";
import { FaBolt, FaTrash } from "react-icons/fa";
import { AiOutlineFile, AiOutlineMore, AiOutlinePlus } from "react-icons/ai";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { clearNotes, setNotes } from "../../../../../redux/slices/notesSlice";
import AiGeneratedNote from "./Notes/ai-generated-note";

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
    setLoading(true);
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
    <div className="flex flex-col h-full bg-white">
      <ToastContainer />

      <div className="flex flex-row items-center justify-between border-b-1 pb-2">
        <h1 className="font-bold text-2xl">Notes</h1>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {useGemini && (
              <div
                className="btn bg-gradient-to-tr from-pink-500 transition-all duration-300 to-blue-600 text-white border-white hover:border-pink-500 btn-soft rounded-full"
                onClick={() =>
                  document.getElementById("ai_gen_note").showModal()
                }
              >
                <FaBolt />
                Generate Note
              </div>
            )}
          </div>
          <button
            className="btn btn-soft rounded-full"
            onClick={handleAddNewNote}
          >
            <AiOutlinePlus /> Add new
          </button>
        </div>
      </div>

      <div className="flex flex-col p-2 gap-2">
        {/* list of notes */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse flex items-center space-x-4"
              >
                <div className="h-6 w-6 bg-gray-300 rounded"></div>
                <div className="h-6 w-1/3 bg-gray-300 rounded"></div>
                <div className="h-6 w-1/4 bg-gray-300 rounded"></div>
                <div className="h-6 w-1/5 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="list-none flex flex-col overflow-auto scrollbar-hide">
            {notes.length === 0 ? (
              <p>No notes found.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr className="text-black">
                    <th></th>
                    <th>Title</th>
                    <th>Created At</th>
                    <th>Updated At</th>
                    <th>Owner</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {notes?.map((note, index) => (
                    <tr key={note.id}>
                      <td>{index + 1}</td>
                      <td
                        className="flex items-center gap-1 hover:underline cursor-pointer"
                        onClick={() => selectNote(note.id)}
                      >
                        {/* <FaFile  /> */}
                        <AiOutlineFile size={20} />
                        <p className="text-nowrap">{note.title}</p>
                      </td>
                      <td>{new Date(note.createdAt).toDateString()}</td>
                      <td>{new Date(note.updatedAt).toDateString()}</td>
                      <td>{note.user.name}</td>
                      <td>
                        <div className="dropdown flex justify-end cursor-pointer">
                          <div role="button" tabIndex={0}>
                            <AiOutlineMore size={24} />
                          </div>
                          <div
                            role="button"
                            tabIndex={0}
                            className="flex group-hover:hidden"
                          >
                            <AiOutlineMore
                              size={24}
                              className="text-transparent"
                            />
                          </div>
                          <ul
                            tabIndex={0}
                            className="dropdown-content menu bg-gray-50 rounded z-[1] w-fit p-2 shadow flex flex-col gap-2"
                          >
                            <div
                              className="flex flex-row gap-2 items-center px-3 py-2 hover:bg-gray-100"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <div>
                                <FaTrash />
                              </div>
                              <span>Delete</span>
                            </div>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
      <dialog id="ai_gen_note" className="modal overflow-x-scroll">
        <div className="modal-box bg-white p-4 rounded-md shadow-md sm:w-fit lg:w-1/2 mx-auto mt-10">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
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
