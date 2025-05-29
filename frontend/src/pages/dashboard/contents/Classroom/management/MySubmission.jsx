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
    setEditContent(submission.content || "");
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
        body: JSON.stringify({ content: editContent }),
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
    <div className="max-w-2xl mx-auto mb-10 p-8 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border border-blue-100">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 tracking-tight flex items-center gap-2">
        <span>My Submissions</span>
      </h3>
      <p className="mb-6 text-gray-600 text-base leading-relaxed">
        First select an assignment in <strong>Assignment</strong> tab to view
        submissions.
        <br />
        Here you can view, edit, and delete your submissions for this
        assignment.
        {isTeacher && (
          <span> As a teacher, you can also manage student submissions.</span>
        )}
      </p>
      {loading ? (
        <div className="text-center text-gray-400 py-8 text-lg font-medium">
          Loading...
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-8 text-lg font-medium">
          {error}
        </div>
      ) : (
        <ul className="space-y-6">
          {mySubmissions.length === 0 && (
            <li className="text-gray-400 text-center py-8 text-lg font-medium bg-white/70 rounded-xl border border-gray-100">
              No submissions yet.
            </li>
          )}
          {mySubmissions.map((submission) => (
            <li className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 group hover:shadow-md hover:border-blue-200 transition flex flex-col gap-2">
              {editId === submission.id ? (
                <>
                  <textarea
                    className="textarea textarea-bordered w-full min-h-[80px] focus:ring-2 focus:ring-blue-400 transition mb-3"
                    rows={4}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition"
                      onClick={handleSave}
                    >
                      Save
                    </button>
                    <button
                      className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold shadow hover:bg-gray-300 transition"
                      onClick={() => setEditId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-2 whitespace-pre-line prose max-w-none">
                    <MarkdownRenderer
                      content={submission.description || submission.content}
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      Submitted at:{" "}
                      {new Date(submission.submitted_at).toLocaleString()}
                      {submission.updatedAt !== submission.submitted_at && (
                        <span className="ml-2">
                          · Updated at:{" "}
                          {new Date(submission.updatedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end mt-2">
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
