import React, { useEffect, useRef, useState } from "react";
import { FaFile, FaFileCsv, FaNotesMedical, FaTrash } from "react-icons/fa";
import { AiOutlineFile, AiOutlineMore, AiOutlinePlus } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";

const Notes = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // const workspace = location2.state?.workspace || {};
  const workspace = useSelector((state) => state.workspace.workspace);

  // console.log("workspace", workspace);

  // for holding the notes data
  const [notes, setNotes] = useState([]);

  // for holding the currently loggedin user data
  const [userData, setUserData] = useState(null);

  // for holding the selected note data

  // Use a single `noteData` state for title, content, and other note information
  const [noteData, setNoteData] = useState({
    title: "",
    content: "",
    workspace_id: workspace.id, // Initialize from workspace
    owned_by: userData?.id, // Initialize from user data
  });

  // Use separate `noteInput` state to store only the editor content
  const [noteInput, setNoteInput] = useState("");

  const [noteCreated, setNoteCreated] = useState(false);

  // storing the logged in user data in the userData
  useEffect(() => {
    try {
      const data = jwtDecode(token);
      setUserData(data);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  // adding new note
  const handleAddNewNote = async () => {
    const newTitle = "Untitled note " + new Date().getTime();
    const workspaceId = workspace.id;
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
        setNoteCreated((prev) => !prev);
        setNoteData(data);
        setNoteInput(data.content || "");
      } else {
        // alert("Error creating the note");
        toast.error("Error creating the note");
        console.log(await response.text());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${apiURL}/api/notes/${workspace.id}`, {
        method: "GET",
        headers: header,
      });

      if (!response.ok) {
        setNotes([]);
      }
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("error happening", error);
    }
  };

  // const fetchSelectedNote = async () => {
  //   try {
  //     const response = await fetch(
  //       `${apiURL}/api/notes/${workspace.id}/${selectedNoteId}`,
  //       {
  //         method: "GET",
  //         headers: header,
  //       }
  //     );

  //     if (response.ok) {
  //       const data = await response.json();
  //       setNoteData(data);
  //       setNoteInput(data.content || "");
  //     } else {
  //       alert("Error fetching the note");
  //       console.log(await response.text());
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  //fetching all notes for the given workspace
  useEffect(() => {
    fetchNotes();
  }, [workspace, noteCreated]);

  //fetching a selected note in detail
  // useEffect(() => {
  //   if (selectedNoteId) {
  //     fetchSelectedNote();
  //     // console.log(noteData);
  //   }
  // }, [selectedNoteId, noteCreated]);

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
      console.error(error);
    }
  };

  const navigate = useNavigate();

  const selectNote = (id) => {
    // toast.success(`opening ${id}`);
    navigate(id);
    // setSelectedNoteId(id);
  };

  console.log(notes);

  return (
    <div className="flex flex-col h-full bg-white">
      <ToastContainer />
      <div className="flex flex-row items-center justify-between border-b-1 pb-2">
        <h1 className="font-bold text-2xl">Notes</h1>
        <div className="flex items-center justify-between">
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
        <div className="list-none flex flex-col overflow-auto scrollbar-hide">
          {
            notes.length === 0 ? (
              <p>No notes found.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
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
            )
            // (
            //   notes.map((note) => (
            //     <li
            //       className={`mb-2 p-2 bg-gray-100 rounded flex justify-between cursor-pointer w-fit${
            //         selectedNoteId === note.id ? "outline outline-blue-500" : ""
            //       } group`}
            //       key={note.id}
            //       onClick={() => selectNote(note.id)}
            //     >
            //       <span className="flex items-center gap-2 relative">
            //         <FaFile />
            //         {note.title}
            //       </span>
            //       <div className="dropdown flex justify-end cursor-pointer">
            //         <div
            //           role="button"
            //           tabIndex={0}
            //           className="hidden group-hover:flex"
            //         >
            //           <AiOutlineMore size={24} />
            //         </div>
            //         <div
            //           role="button"
            //           tabIndex={0}
            //           className="flex group-hover:hidden"
            //         >
            //           <AiOutlineMore size={24} className="text-transparent" />
            //         </div>
            //         <ul
            //           tabIndex={0}
            //           className="dropdown-content menu bg-gray-50 rounded z-[1] w-fit p-2 shadow flex flex-col gap-2"
            //         >
            //           <div
            //             className="flex flex-row gap-2 items-center px-3 py-2 hover:bg-gray-100"
            //             onClick={() => handleDeleteNote(note.id)}
            //           >
            //             <div>
            //               <FaTrash />
            //             </div>
            //             <span>Delete</span>
            //           </div>
            //         </ul>
            //       </div>
            //     </li>
            //   ))
            // )
          }
        </div>
      </div>
    </div>
  );
};

export default Notes;
