import React, { useEffect, useState } from "react";
import MarkDown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeHighlighter from "../../../../../components/_notes/code-highlighter";
import {
  FaArchive,
  FaBars,
  FaBookOpen,
  FaPencilAlt,
  FaTrash,
} from "react-icons/fa";
import { AiOutlineMore, AiOutlinePlus } from "react-icons/ai";
import { useLocation } from "react-router-dom";
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

  // for holding the workspace data that was passed from the previous page
  const location2 = useLocation();
  // const workspace = location2.state?.workspace || {};
  const workspace = useSelector((state) => state.workspace.workspace);

  // console.log("workspace", workspace);

  // for handling the edit mode and preview mode for note editing and viewing
  const [editMode, setEditMode] = useState(true);
  const [previewMode, setPreviewMode] = useState(true);

  // for holding the notes data
  const [notes, setNotes] = useState([]);

  // for holding the currently loggedin user data
  const [userData, setUserData] = useState(null);

  // for holding the selected note data
  const [selectedNoteId, setSelectedNoteId] = useState(null);

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

  // for holding a switch for drawing notes from side
  const [noteDrawerOpened, setNoteDrawerOpened] = useState(false);

  // storing the logged in user data in the userData
  useEffect(() => {
    try {
      const data = jwtDecode(token);
      setUserData(data);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  //managing the edit mode and preview mode
  const handleChangeMode = () => {
    setEditMode((prev) => !prev);
  };

  // adding new note
  const handleAddNewNote = async () => {
    const newTitle = "Untitled note " + new Date().getTime();
    const workspaceId = workspace.id;
    const userId = userData.id;

    const newNoteData = {
      workspace_id: workspaceId,
      owned_by: userId,
      title: newTitle,
      content: "", //Start with empty content
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
        setSelectedNoteId(data.id);
        setNoteData(data);
        setNoteInput(data.content || "");
      } else {
        alert("Error creating the note");
        console.log(await response.text());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangePreview = () => {
    setPreviewMode((prev) => !prev);
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

  const fetchSelectedNote = async () => {
    try {
      const response = await fetch(
        `${apiURL}/api/notes/${workspace.id}/${selectedNoteId}`,
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
        alert("Error fetching the note");
        console.log(await response.text());
      }
    } catch (error) {
      console.error(error);
    }
  };

  //fetching all notes for the given workspace
  useEffect(() => {
    fetchNotes();
  }, [workspace, noteCreated]);

  //fetching a selected note in detail
  useEffect(() => {
    if (selectedNoteId) {
      fetchSelectedNote();
    }
  }, [selectedNoteId, noteCreated]);

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

  const selectNote = (id) => {
    setSelectedNoteId(id);
    //cosing back the drawer
    setNoteDrawerOpened(false);
  };

  const handleSaveChanges = async () => {
    const dataToSave = {
      ...noteData,
      content: noteInput, // Content from the editor state
    };

    try {
      let response;
      if (selectedNoteId) {
        // Update existing note (PUT)
        response = await fetch(`${apiURL}/api/notes/${selectedNoteId}`, {
          method: "PUT",
          headers: header,
          body: JSON.stringify(dataToSave),
        });
      } else {
        // Create a new note (POST)
        response = await fetch(`${apiURL}/api/notes`, {
          //Create a new note
          method: "POST",
          headers: header,
          body: JSON.stringify(dataToSave),
        });
      }

      if (response.ok) {
        const responseData = await response.json();
        toast.success("Note saved successfully!");
        fetchNotes(); // Refresh notes list
        setSelectedNoteId(responseData.id); // set the new note to selected note.
      } else {
        toast.error("Failed to save the note.");
        console.log(await response.text());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleNoteDrawerOpen = async () => {
    setNoteDrawerOpened(true);
  };

  const handleTitleChange = (e) => {
    setNoteData({ ...noteData, title: e.target.value });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <ToastContainer />
      <div className="flex flex-col md:flex-row lg:flex-row justify-between border-b-1">
        <div className="flex items-center gap-2 justify-between">
          <h1 className="font-bold text-2xl">Notes</h1>
          <div className="flex items-center gap-2">
            <span className="border-2 pr-2 flex items-center gap-2 p-2 rounded w-fit">
              <input
                type="text"
                value={noteData?.title || ""}
                onChange={handleTitleChange}
                className="outline-none w-fit bg-transparent"
              />
            </span>
            <button className="btn" onClick={handleSaveChanges}>
              Save
            </button>
          </div>
        </div>
        {/* viewport manage */}
        <div className="flex items-center justify-end gap-2 p-2">
          <div className="border-r-2 pr-2 flex items-center gap-2">
            <input
              type="checkbox"
              className={`toggle ${
                previewMode ? "bg-blue-500 text-white" : ""
              }`}
              checked={previewMode}
              onChange={handleChangePreview}
            />
            <p>Preview</p>
          </div>
          <span className="flex items-center gap-2" onClick={handleChangeMode}>
            {editMode ? (
              <FaBookOpen
                size={24}
                className="cursor-pointer"
                title="View Mode "
              />
            ) : (
              <FaPencilAlt
                size={24}
                className="cursor-pointer"
                title="Edit Mode"
              />
            )}
          </span>
          <AiOutlineMore />
        </div>
      </div>

      <div className="flex h-full">
        {/* sidebar */}
        <div
          className="absolute p-4 block md:hidden bg-gray-200 left-0 rounded-r-full z-10"
          onClick={handleNoteDrawerOpen}
        >
          <FaBars />
        </div>

        <div
          className={`p-4 ${
            noteDrawerOpened ? "block" : "hidden"
          } lg:block md:block bg-white shadow-xl ${
            noteDrawerOpened
              ? "absolute left-0 md:relative lg:relative w-full md:w-fit lg:w-fit z-20 md:z-auto lg:z-auto"
              : ""
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-between w-full">
              <p className="font-bold">Notes</p>
              <div
                className="p-2 cursor-pointer hover:bg-gray-100 rounded"
                onClick={handleAddNewNote}
              >
                <AiOutlinePlus />
              </div>
            </div>
          </div>
          <hr />
          {/* list of notes */}
          <ul className="list-none flex flex-col gap-2 mt-2">
            {notes.length === 0 ? (
              <p>No notes found.</p>
            ) : (
              notes.map((note) => (
                <li
                  className={`mb-2 p-2 bg-gray-100 rounded flex justify-between cursor-pointer ${
                    selectedNoteId === note.id ? "outline outline-blue-500" : ""
                  } group`}
                  key={note.id}
                  onClick={() => selectNote(note.id)}
                >
                  <span
                    className="whitespace-nowrap w-32 text-ellipsis relative"
                    style={{
                      maskImage:
                        "linear-gradient(to right, black 80%, transparent)",
                      WebkitMaskImage:
                        "linear-gradient(to right, black 80%, transparent)", // For Safari support
                    }}
                  >
                    {note.title}
                  </span>
                  <div className="dropdown flex justify-end cursor-pointer">
                    <div
                      role="button"
                      tabIndex={0}
                      className="hidden group-hover:flex"
                    >
                      <AiOutlineMore size={24} />
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      className="flex group-hover:hidden"
                    >
                      <AiOutlineMore size={24} className="text-transparent" />
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu bg-gray-50 rounded z-[1] w-fit p-2 shadow flex flex-col gap-2"
                    >
                      {/* <div className="flex flex-row gap-2 items-center px-3 py-2 hover:bg-gray-100">
                      <div>
                        <FaArchive />
                      </div>
                      <span>Archive</span>
                    </div> */}

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
                </li>
              ))
            )}
          </ul>
        </div>

        {/* body section */}
        <div className="flex flex-col md:flex-row p-2 gap-3 min-h-full grow w-full">
          {/* editing area */}
          {editMode && (
            <div className="flex-1 shadow-md p-2 text-wrap">
              <p className="font-bold">Editing Area</p>
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
            <div className="flex-1 shadow-md p-2 text-wrap overflow-auto">
              <p className="font-bold">Viewing Area</p>
              {/* <Markdown /> will be staying here */}
              <div className="flex flex-col gap-4 hover:[&>*]:bg-gray-100 hover:[&>*]:cursor-pointer">
                <MarkDown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: CodeHighlighter,
                    // code: CodeHighlighter,
                    a: ({ node, ...props }) => (
                      <a className="text-blue-500 underline" {...props} />
                    ),
                    p: ({ node, ...props }) => {
                      // if the first character is # or not
                      const firstChar = props.children[0]
                        ?.toString()
                        .trim()
                        .charAt(0);
                      return (
                        <p
                          className={`text-sm ${
                            firstChar === "#"
                              ? "font-bold bg-blue-200 w-fit p-1 rounded-full text-blue-700"
                              : ""
                          }`}
                          {...props}
                        />
                      );
                    },

                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-5 space-y-2" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal pl-5 space-y-2" {...props} />
                    ),
                    input: ({ node, ...props }) => {
                      if (props.type === "checkbox") {
                        return (
                          <input
                            type="checkbox"
                            className="bg-white cursor-pointer bg-transparent focus:ring-0 rounded items-center"
                            {...props}
                          />
                        );
                      }
                      return <input {...props} />;
                    },
                    h1: ({ node, ...props }) => (
                      <h1 className="text-3xl font-bold" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="text-2xl font-bold" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h2 className="text-xl font-bold" {...props} />
                    ),
                    h4: ({ node, ...props }) => (
                      <h2 className="text-lg font-bold" {...props} />
                    ),
                    h5: ({ node, ...props }) => (
                      <h2 className="text-md font-bold" {...props} />
                    ),
                    h6: ({ node, ...props }) => (
                      <h2 className="text-sm font-bold" {...props} />
                    ),

                    table: ({ node, ...props }) => (
                      <table
                        className="table-auto border-collapse"
                        {...props}
                      />
                    ),
                    th: ({ node, ...props }) => (
                      <th className="border px-4 py-2 bg-gray-200" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="border px-4 py-2" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote className="border-l-4 pl-4" {...props} />
                    ),
                    img: ({ node, ...props }) => (
                      <img {...props} className="max-w-full rounded-box" />
                    ),
                  }}
                >
                  {noteInput}
                </MarkDown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
