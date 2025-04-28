import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FiFileText, FiAlertTriangle } from "react-icons/fi";
import { AiOutlineUser } from "react-icons/ai";
import MarkdownRenderer from "../../../components/markdown-renderer";

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
      <header className="flex items-center p-4 bg-white fixed w-full top-0 z-10 border-b">
        <img src="/rect19.png" alt="Logo" className="w-10 mr-3" />
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <FiFileText /> Notes
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
              <div className="border-b-2 p-2">
                <h2 className="text-lg font-bold flex items-center gap-2 pb-2">
                  {/* <FaRegStickyNote className="text-gray-500" /> */}
                  {note.title}
                </h2>
                <div className="flex flex-row gap-1 items-center justify-between">
                  <p className="font-bold text-gray-500 flex items-center gap-2">
                    <AiOutlineUser />
                    {note.user.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(note.createdAt).toDateString()}
                  </p>
                </div>
              </div>
              <MarkdownRenderer content={note.content} />
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
