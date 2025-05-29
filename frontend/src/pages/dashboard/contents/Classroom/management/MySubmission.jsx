import React, { useEffect, useState } from "react";
import MarkdownRenderer from "../../../../../components/markdown-renderer";

const MySubmission = ({ assignmentId, isTeacher }) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!assignmentId) return;
    const fetchMySubmissions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${apiURL}/api/submissions/my?assignmentId=${assignmentId}`,
          { method: "GET", headers: header }
        );
        if (res.ok) {
          const data = await res.json();
          setMySubmissions(data);
          console.log("Fetched my submissions:", data);
        } else {
          setMySubmissions([]);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMySubmissions();
  }, [assignmentId]);

  const handleEdit = (submission) => {
    setEditId(submission.id);
    setEditContent(submission.description || "");
  };

  const handleDelete = (submissionId) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) {
      return;
    }
    fetch(`${apiURL}/api/submissions/${submissionId}`, {
      method: "DELETE",
      headers: header,
    })
      .then((res) => {
        if (res.ok) {
          setMySubmissions((subs) => subs.filter((s) => s.id !== submissionId));
        } else {
          throw new Error("Failed to delete submission");
        }
      })
      .catch((e) => {
        alert(e.message);
      });
  };

  const handleSave = async () => {
    if (!editId) return;
    try {
      const res = await fetch(`${apiURL}/api/submissions/my/${editId}`, {
        method: "PUT",
        headers: header,
        body: JSON.stringify({ description: editContent }),
      });
      if (!res.ok) throw new Error("Failed to update submission");
      const updated = await res.json();
      setMySubmissions((subs) =>
        subs.map((s) => (s.id === editId ? updated : s))
      );
      setEditId(null);
      setEditContent("");
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch(`${apiURL}/api/submissions`, {
        method: "POST",
        headers: header,
        body: JSON.stringify({
          assignment_id: assignmentId,
          content: editContent,
        }),
      });
      if (!res.ok) throw new Error("Failed to create submission");
      const created = await res.json();
      setMySubmissions((subs) => [created, ...subs]);
      setEditContent("");
    } catch (e) {
      alert(e.message);
    } finally {
      setCreating(false);
    }
  };

  if (!assignmentId) return null;

  return (
    <div className="max-w-2xl mx-auto mb-12 p-10 bg-white/90 rounded-3xl shadow-2xl border border-blue-100 flex flex-col gap-8">
      <div>
        <h3 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight flex items-center gap-3">
          <span className="inline-block w-2 h-7 bg-blue-500 rounded-full"></span>
          My Submissions
        </h3>
        <p className="mb-6 text-gray-600 text-base leading-relaxed">
          Select an assignment in the <strong>Assignment</strong> tab to view or
          submit your work.
          <br />
          You can view, edit, or delete your submissions for this assignment
          here.
        </p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center text-gray-400 py-12 text-lg font-medium min-h-[120px]">
          Loading...
        </div>
      ) : error ? (
        <div className="flex items-center justify-center text-red-500 py-12 text-lg font-medium min-h-[120px]">
          {error}
        </div>
      ) : (
        <ul className="space-y-7">
          {mySubmissions.length === 0 && (
            <li className="flex flex-col items-center justify-center text-gray-400 text-center py-12 text-lg font-medium bg-white/80 rounded-2xl border border-gray-100 shadow-inner min-h-[120px]">
              <svg
                className="w-12 h-12 mb-2 text-gray-200"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20h9"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m0 0H3"
                />
              </svg>
              No submissions yet.
            </li>
          )}
          {mySubmissions.map((submission) => (
            <li
              key={submission.id}
              className={`relative bg-white rounded-2xl border border-gray-100 shadow-md p-7 group transition flex flex-col gap-3 ${
                editId === submission.id
                  ? "ring-2 ring-blue-400"
                  : "hover:shadow-lg hover:border-blue-200"
              }`}
            >
              {editId === submission.id ? (
                <>
                  <label
                    htmlFor="edit-content"
                    className="block text-gray-700 font-semibold mb-2"
                  >
                    Edit Submission
                  </label>
                  <textarea
                    id="edit-content"
                    className="w-full min-h-[100px] rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition shadow-sm resize-vertical mb-4"
                    rows={6}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-3 justify-end mt-2">
                    <button
                      className="px-7 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
                      onClick={handleSave}
                    >
                      Save
                    </button>
                    <button
                      className="px-7 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold shadow hover:bg-gray-300 transition"
                      onClick={() => setEditId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="prose max-w-none text-gray-800 bg-gray-50 p-5 rounded-xl border border-gray-100 shadow-inner mb-2">
                    <MarkdownRenderer
                      content={submission.description || submission.content}
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                    <div className="text-xs text-gray-500">
                      Submitted:{" "}
                      {new Date(submission.submitted_at).toLocaleString()}
                      {submission.updatedAt !== submission.submitted_at && (
                        <span className="ml-2 text-blue-500">
                          · Updated:{" "}
                          {new Date(submission.updatedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
                        onClick={() => handleEdit(submission)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition"
                        onClick={() => handleDelete(submission.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MySubmission;
