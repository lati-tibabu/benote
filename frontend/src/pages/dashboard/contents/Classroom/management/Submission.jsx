import React, { useEffect, useState } from "react";
import MarkdownRenderer from "../../../../../components/markdown-renderer";

const Submission = ({ assignmentId, isTeacher }) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mySubmission, setMySubmission] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    if (!assignmentId) return;
    const fetchSubmissions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all submissions (for teachers) and my submission (for students)
        const allRes = await fetch(
          `${apiURL}/api/submissions?assignmentId=${assignmentId}`,
          { method: "GET", headers: header }
        );
        let allData = [];
        if (allRes.ok) allData = await allRes.json();
        setSubmissions(allData);

        // Fetch my submission
        const myRes = await fetch(
          `${apiURL}/api/submissions/my?assignmentId=${assignmentId}`,
          { method: "GET", headers: header }
        );
        if (myRes.ok) {
          const myData = await myRes.json();
          setMySubmission(myData[0] || null);
          setEditContent(myData[0]?.content || "");
        } else {
          setMySubmission(null);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [assignmentId]);

  const handleEdit = () => {
    setEditMode(true);
    setEditContent(mySubmission?.content || "");
  };

  const handleSave = async () => {
    if (!mySubmission) return;
    try {
      const res = await fetch(`${apiURL}/api/submissions/${mySubmission.id}`, {
        method: "PUT",
        headers: header,
        body: JSON.stringify({ content: editContent }),
      });
      if (!res.ok) throw new Error("Failed to update submission");
      const updated = await res.json();
      setMySubmission(updated);
      setEditMode(false);
    } catch (e) {
      alert(e.message);
    }
  };

  if (!assignmentId) return null;

  return (
    <div className="mt-10 flex gap-10 max-w-6xl mx-auto">
      <div className="flex-1">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 tracking-tight">
          Submissions
        </h2>
        {loading ? (
          <div className="text-center text-gray-400 py-8 text-lg font-medium">
            Loading submissions...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8 text-lg font-medium">
            {error}
          </div>
        ) : (
          <>
            {mySubmission && (
              <div className="mb-8 bg-blue-50/80 rounded-xl border border-blue-100 shadow p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Your Submission
                </h3>
                {editMode ? (
                  <>
                    <textarea
                      className="textarea textarea-bordered w-full min-h-[80px] focus:ring-2 focus:ring-blue-400 transition mb-4"
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
                        onClick={() => setEditMode(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-3 whitespace-pre-line prose max-w-none text-gray-700">
                      <MarkdownRenderer content={mySubmission.content} />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button
                        className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
                        onClick={handleEdit}
                      >
                        Edit
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
            <ul className="space-y-4">
              {submissions.map((submission) => (
                <li
                  key={submission.id}
                  className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-blue-200 transition ${
                    selectedSubmission &&
                    selectedSubmission.id === submission.id
                      ? "ring-2 ring-blue-400"
                      : ""
                  }`}
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-medium text-gray-800 truncate">
                      {submission?.student?.name}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      {/* Submission detail panel */}
      {selectedSubmission && (
        <div className="w-1/3 min-w-[320px] max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 animate-fade-in flex flex-col">
          <h3 className="text-2xl font-bold mb-2 text-gray-800">
            Submission Detail
          </h3>
          <p className="mb-4 text-gray-700 font-medium text-lg">
            {selectedSubmission.student?.name}
          </p>
          <div className="prose max-w-none text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <MarkdownRenderer
              content={
                selectedSubmission.description || selectedSubmission.content
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Submission;
