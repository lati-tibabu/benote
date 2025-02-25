import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MarkDown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiFileText, FiAlertTriangle } from "react-icons/fi";
import { FaRegStickyNote } from "react-icons/fa";
import CodeHighlighter from "../../../components/_notes/code-highlighter";

const SharedNotes = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const { note_id } = useParams();
  const [note, setNote] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(
          `${apiURL}/api/notes/public/${note_id}/note`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch the note");
        }
        const data = await response.json();
        setNote(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchNote();
  }, [note_id, apiURL]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="flex items-center p-4 bg-white shadow-md fixed w-full top-0 z-10 border-b">
        <img src="/rect19.png" alt="Logo" className="w-10 mr-3" />
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <FiFileText /> Student Productivity Hub
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 mt-16">
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6 overflow-auto border border-gray-200">
          {error ? (
            <div className="flex items-center gap-2 text-red-500 bg-red-100 p-3 rounded-md">
              <FiAlertTriangle className="text-xl" />
              <p>Error: {error}</p>
            </div>
          ) : note ? (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
                <FaRegStickyNote className="text-blue-500" /> {note.title}
              </h2>
              <div className="flex flex-col gap-1">
                <p className="font-bold text-gray-500">By: {note.user.name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(note.createdAt).toDateString()}
                </p>
              </div>
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
                  img: ({ node, ...props }) => (
                    <img {...props} className="max-w-full rounded-box" />
                  ),
                }}
              >
                {note.content}
              </MarkDown>
            </div>
          ) : (
            <p className="text-gray-500">Loading note...</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default SharedNotes;
