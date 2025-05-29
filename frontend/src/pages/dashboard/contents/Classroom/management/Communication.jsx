import React, { useEffect, useState } from "react";

const Communication = ({ classroomId, isTeacher }) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${apiURL}/api/classrooms/${classroomId}/announcements`,
        {
          method: "GET",
          headers: header,
        }
      );
      if (!res.ok) throw new Error("Failed to fetch announcements");
      const data = await res.json();
      setMessages(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classroomId) fetchMessages();
    // eslint-disable-next-line
  }, [classroomId]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(
        `${apiURL}/api/classrooms/${classroomId}/announcements`,
        {
          method: "POST",
          headers: header,
          body: JSON.stringify({ content }),
        }
      );
      if (!res.ok) throw new Error("Failed to post announcement");
      setContent("");
      fetchMessages();
    } catch (e) {
      alert(e.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        Announcements
      </h2>
      {isTeacher && (
        <form onSubmit={handlePost} className="mb-6 flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write an announcement..."
            className="flex-1 border rounded px-3 py-2"
            disabled={posting}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={posting || !content.trim()}
          >
            Post
          </button>
        </form>
      )}
      {loading ? (
        <p className="text-gray-500">Loading announcements...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : messages.length === 0 ? (
        <p className="text-gray-500">No announcements yet.</p>
      ) : (
        <ul className="space-y-4">
          {messages.map((msg) => (
            <li key={msg.id} className="border rounded p-4 bg-white shadow-sm">
              <div className="text-gray-800 mb-1">{msg.content}</div>
              <div className="text-xs text-gray-500">
                {msg.teacherName || "Teacher"} •{" "}
                {new Date(msg.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Communication;
