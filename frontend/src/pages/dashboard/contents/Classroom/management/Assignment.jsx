import React, { useEffect, useState } from "react";
import MarkdownRenderer from "../../../../../components/markdown-renderer";

const apiURL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("jwt");
const header = {
  authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

const Assignment = ({ classroomId, isTeacher, onAssignmentClick }) => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    due_date: "",
  });
  const [submissionForm, setSubmissionForm] = useState({
    description: "",
    file_path: "", // You might want to handle file uploads differently
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchAssignments = async () => {
    try {
      const response = await fetch(
        `${apiURL}/api/assignments?classroomId=${classroomId}&page=${currentPage}&search=${search}`,
        {
          headers: header,
        }
      );
      const data = await response.json();
      setAssignments(data.assignments);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch assignments", error);
    }
  };

  const fetchAssignmentById = async (id) => {
    try {
      const response = await fetch(`${apiURL}/api/assignments/${id}`, {
        headers: header,
      });
      const data = await response.json();
      setSelectedAssignment(data);
      onAssignmentClick(id, data.title); // Pass both id and name
    } catch (error) {
      console.error("Failed to fetch assignment detail", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      classroom_id: classroomId,
    };

    try {
      const response = await fetch(
        `${apiURL}/api/assignments?classroomId=${classroomId}`,
        {
          method: "POST",
          headers: header,
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        setForm({ title: "", description: "", due_date: "" });
        fetchAssignments();
      } else {
        console.error("Failed to post assignment");
      }
    } catch (error) {
      console.error("Error submitting assignment", error);
    }
  };

  const handleSubmissionChange = (e) => {
    setSubmissionForm({ ...submissionForm, [e.target.name]: e.target.value });
  };

  const handleSubmitSubmission = async (e) => {
    e.preventDefault();

    if (!selectedAssignment) {
      console.error("No assignment selected for submission.");
      return;
    }

    const payload = {
      assignment_id: selectedAssignment.id,
      description: submissionForm.description,
      submitted_at: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${apiURL}/api/submissions`, {
        method: "POST",
        headers: header,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSubmissionForm({ description: "", file_path: "" });
        alert("Submission successful!");
      } else {
        console.error("Failed to submit assignment:", response);
        alert("Submission failed. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting assignment", error);
      alert("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [classroomId, currentPage, search]);

  const isOverdue = (due_date) => {
    return new Date(due_date) < new Date();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-white to-gray-50 rounded-sm shadow-sm border border-gray-200">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 tracking-tight">
        Assignments
      </h2>

      {/* Assignment Creation Form (Teacher Only) */}
      {isTeacher && (
        <form
          onSubmit={handleSubmit}
          className="mb-10 bg-white/80 rounded-sm shadow p-6 flex flex-col gap-4 border border-gray-100"
        >
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Title</label>
            <input
              type="text"
              placeholder="Assignment Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="input bg-white text-black input-bordered w-full focus:ring-2 focus:ring-gray-400 transition"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Description</label>
            <textarea
              placeholder="Description (Markdown supported)"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
              className="textarea bg-white text-black textarea-bordered w-full min-h-[80px] focus:ring-2 focus:ring-gray-400 transition"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              required
              className="input bg-white text-black input-bordered w-full focus:ring-2 focus:ring-gray-400 transition"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 rounded-sm bg-gray-600 text-white font-semibold shadow hover:bg-gray-700 transition"
            >
              Post Assignment
            </button>
          </div>
        </form>
      )}

      {/* Assignment List & Search */}
      <div className="flex flex-col gap-6">
        {/* Assignments List */}
        {assignments?.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-lg font-medium">
            No assignments available at the moment.
          </div>
        ) : (
          <div className="grid gap-6">
            {assignments?.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between bg-white rounded-sm border border-gray-100 shadow-sm p-5 group hover:shadow-sm hover:border-gray-200 transition"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-gray-800 group-hover:text-gray-700 truncate">
                    {assignment.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">
                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-sm ml-2 ${
                        isOverdue(assignment.due_date)
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {isOverdue(assignment.due_date) ? "Overdue" : "Upcoming"}
                    </span>
                  </div>
                  <p className="text-gray-500 mt-2 line-clamp-2 text-sm">
                    {assignment.description}
                  </p>
                </div>
                <div className="flex flex-col gap-2 ml-6">
                  <button
                    onClick={() => fetchAssignmentById(assignment.id)}
                    className="px-4 py-1 rounded-sm bg-gray-500 text-white font-medium shadow hover:bg-gray-600 transition"
                  >
                    View
                  </button>
                  <button
                    onClick={() =>
                      onAssignmentClick(assignment.id, assignment.title)
                    }
                    className="px-4 py-1 rounded-sm bg-gray-100 text-gray-700 font-medium shadow hover:bg-gray-200 transition"
                  >
                    Select
                  </button>
                  {isTeacher && (
                    <button className="px-4 py-1 rounded-sm bg-red-50 text-red-600 font-medium border border-red-100 hover:bg-red-100 transition">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-10">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-sm bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 disabled:opacity-50 transition"
        >
          Previous
        </button>
        <span className="text-gray-700 font-semibold">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-sm bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 disabled:opacity-50 transition"
        >
          Next
        </button>
      </div>

      {/* Assignment Detail Drawer/Panel */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white rounded-sm shadow-sm p-8 border border-gray-100 animate-fade-in">
            <button
              onClick={() => setSelectedAssignment(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold focus:outline-none"
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {selectedAssignment.title}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Due: {new Date(selectedAssignment.due_date).toLocaleDateString()}
            </p>
            <div className="prose max-w-none mb-6">
              <MarkdownRenderer content={selectedAssignment.description} />
            </div>
            {!isTeacher && (
              <form
                onSubmit={handleSubmitSubmission}
                className="space-y-4 mt-6"
              >
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Answer
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={submissionForm.description}
                    onChange={handleSubmissionChange}
                    rows="4"
                    className="textarea bg-white text-black textarea-bordered w-full min-h-[80px] focus:ring-2 focus:ring-gray-400 transition"
                    placeholder="Write your answer here..."
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-sm bg-gray-600 text-white font-semibold shadow hover:bg-gray-700 transition"
                  >
                    Submit Assignment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignment;
