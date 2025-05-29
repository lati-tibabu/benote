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
    <div className="mt-12 flex flex-col md:flex-row gap-10 max-w-6xl mx-auto">
      {/* Submissions Sidebar */}
      <aside className="md:w-1/2 lg:w-2/5 xl:w-1/3 bg-white/80 rounded-2xl border border-gray-100 shadow-lg p-6 flex flex-col min-h-[500px]">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight flex items-center gap-2">
          <span className="inline-block w-2 h-6 bg-blue-500 rounded-full mr-2"></span>
          Submissions
        </h2>
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-lg font-medium">
            Loading submissions...
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-red-500 text-lg font-medium">
            {error}
          </div>
        ) : (
          <ul className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {submissions.length === 0 && (
              <li className="text-gray-400 text-center py-8">
                No submissions yet.
              </li>
            )}
            {submissions.map((submission) => (
              <li
                key={submission.id}
                className={`group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer select-none shadow-sm hover:shadow-md hover:border-blue-300/70 bg-white/90 hover:bg-blue-50/60 ${
                  selectedSubmission && selectedSubmission.id === submission.id
                    ? "ring-2 ring-blue-500 border-blue-400 bg-blue-50/80"
                    : "border-gray-100"
                }`}
                onClick={() => setSelectedSubmission(submission)}
              >
                {/* Avatar/Initials */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg shadow-sm border border-blue-200">
                  {submission?.student?.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-gray-900 truncate group-hover:text-blue-700 transition">
                    {submission?.student?.name}
                  </p>
                  <div className="mt-1 text-xs text-gray-500 flex flex-wrap gap-2">
                    <span>
                      Submitted:{" "}
                      {new Date(submission.submitted_at).toLocaleString()}
                    </span>
                    {new Date(submission.updatedAt).toTimeString() !==
                      new Date(submission.submitted_at).toTimeString() && (
                      <span className="text-blue-500">
                        · Updated:{" "}
                        {new Date(submission.updatedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </li>
            ))}
          </ul>
        )}
      </aside>
      {/* Submission detail panel */}
      <main className="flex-1 flex items-start">
        {selectedSubmission ? (
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 p-10 animate-fade-in flex flex-col relative min-h-[400px]">
            <button
              className="absolute left-6 top-6 text-gray-400 hover:text-blue-600 transition text-sm font-medium flex items-center gap-1"
              onClick={() => setSelectedSubmission(null)}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
            <div className="mb-6 pt-2">
              <h3 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight flex items-center gap-2">
                <span className="inline-block w-2 h-6 bg-blue-500 rounded-full"></span>
                Submission Detail
              </h3>
              <p className="text-gray-700 font-medium text-lg flex items-center gap-2 mt-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-base border border-blue-200">
                  {selectedSubmission.student?.name?.[0]?.toUpperCase() || "?"}
                </span>
                {selectedSubmission.student?.name}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                Submitted:{" "}
                {new Date(selectedSubmission.submitted_at).toLocaleString()}
                {new Date(selectedSubmission.updatedAt).toTimeString() !==
                  new Date(selectedSubmission.submitted_at).toTimeString() && (
                  <span className="ml-2 text-blue-500">
                    · Updated:{" "}
                    {new Date(selectedSubmission.updatedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <div className="prose max-w-none text-gray-800 bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-inner min-h-[180px]">
              <MarkdownRenderer
                content={
                  selectedSubmission.description || selectedSubmission.content
                }
              />
            </div>
          </div>
        ) : (
          <div className="w-full max-w-xl flex flex-col items-center justify-center min-h-[400px] text-gray-400 text-lg font-medium select-none">
            <svg
              className="w-16 h-16 mb-4 text-gray-200"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m0 0H3"
              />
            </svg>
            Select a submission to view details
          </div>
        )}
      </main>
    </div>
  );
};

export default Submission;
