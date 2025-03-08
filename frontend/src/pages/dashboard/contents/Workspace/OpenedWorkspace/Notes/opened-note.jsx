import React, { useEffect, useRef, useState } from "react";
import MarkDown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeHighlighter from "../../../../../../components/_notes/code-highlighter";
import {
  FaBook,
  FaBookOpen,
  FaBookReader,
  FaListUl,
  FaPencilAlt,
  FaRegCopy,
  FaSave,
} from "react-icons/fa";

import {
  AiOutlineBook,
  AiOutlineEdit,
  AiOutlineFolderView,
} from "react-icons/ai";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";

const OpenedNote = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const { note_id } = useParams();

  // const workspace = location2.state?.workspace || {};
  const workspace = useSelector((state) => state.workspace.workspace);

  // for handling the edit mode and preview mode for note editing and viewing
  const [editMode, setEditMode] = useState(true);

  const [previewMode, setPreviewMode] = useState(true);

  // for holding the currently loggedin user data
  const [userData, setUserData] = useState(null);

  // Use a single `noteData` state for title, content, and other note information
  const [noteData, setNoteData] = useState({
    title: "",
    content: "",
    workspace_id: workspace.id, // Initialize from workspace
    owned_by: userData?.id, // Initialize from user data
  });

  // Use separate `noteInput` state to store only the editor content
  const [noteInput, setNoteInput] = useState("");

  const [loading, setLoading] = useState(false);

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
              {/* <h1 className="font-bold text-2xl">Notes</h1> */}
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
                <div className="flex-1 shadow-md p-2 text-wrap overflow-auto border-1 rounded">
                  <p className="font-bold text-gray-400 px-2 rounded-t-md border-b-2">
                    Viewing Area
                  </p>
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
                              className={`${
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
                          <ol
                            className="list-decimal pl-5 space-y-2"
                            {...props}
                          />
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
                          <th
                            className="border px-4 py-2 bg-gray-200"
                            {...props}
                          />
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
        </>
      )}
    </div>
  );
};

export default OpenedNote;
