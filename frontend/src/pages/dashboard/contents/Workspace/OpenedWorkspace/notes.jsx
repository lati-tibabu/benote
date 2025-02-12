import React, { useState } from "react";
import MarkDown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeHighlighter from "../../../../../components/_notes/code-highlighter";
import { FaBeer, FaBookOpen, FaEye, FaPencilAlt } from "react-icons/fa";
import { AiOutlineBook, AiOutlineMore } from "react-icons/ai";

const Notes = () => {
  const [editMode, setEditMode] = useState(true);

  const handleChangeMode = () => {
    // alert("Chan");
    setEditMode((prev) => !prev);
  };

  const [noteInput, setNoteInput] = useState("");
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between border-b-1">
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-2xl">Notes</h1>
          <div className="flex items-center gap-2">
            <span className="border-2 pr-2 flex items-center gap-2 p-2 rounded w-fit">
              <input
                type="text"
                value={"The history of ethiopia and the constitutionalism"}
                className="outline-none w-fit bg-transparent"
              />
            </span>
            <button className="btn">Save</button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="border-r-2 pr-2 flex items-center gap-2">
            <input type="checkbox" className="toggle" defaultChecked />
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
                title="View Mode "
              />
            )}
          </span>
          <AiOutlineMore />
        </div>
      </div>
      <div className="flex h-full">
        {/* sidebar */}
        <div className="p-4">
          <p className="font-bold">Notes</p>
          <hr />
          <ul className="list-none flex flex-col gap-2 mt-2">
            <li className="mb-2 p-2 bg-gray-100 rounded">
              <a href="/">Note1</a>
            </li>
            <li className="mb-2 p-2 bg-gray-100 rounded">
              <a href="/">Note2</a>
            </li>
            <li className="mb-2 p-2 bg-gray-100 rounded">
              <a href="/">Note3</a>
            </li>
          </ul>
        </div>
        {/* body section */}
        <div className="flex p-2 gap-3 min-h-full grow w-full">
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
                      .toString()
                      .trim()
                      .charAt(0);
                    return (
                      <p
                        className={`text-sm ${
                          firstChar === "#" &&
                          "font-bold bg-blue-200 w-fit p-1 rounded-full text-blue-700"
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
                    <table className="table-auto border-collapse" {...props} />
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
                }}
              >
                {noteInput}
                {/* <CodeHighlighter /> */}
              </MarkDown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
