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
      onAssignmentClick(id); // Notify the parent component about the clicked assignment
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
      const response = await fetch(`${apiURL}/api/assignments`, {
        method: "POST",
        headers: header,
        body: JSON.stringify(payload),
      });

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
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Assignments</h2>

      {/* Form to post assignment */}

      {isTeacher && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white p-4 rounded shadow mb-6"
        >
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full border rounded p-2"
          />
          <textarea
            placeholder="Description (Markdown supported)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            className="w-full border rounded p-2"
          />
          <input
            type="date"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            required
            className="w-full border rounded p-2"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Post Assignment
          </button>
        </form>
      )}

      {/* Search Input */}
      {/* <input
        type="text"
        placeholder="Search assignments..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1); // Reset to first page on new search
        }}
        className="w-full border rounded p-2 mb-4"
      /> */}

      {/* Assignments list */}
      {assignments.length === 0 ? (
        <p className="text-gray-500">No assignments available at the moment.</p>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              onClick={() => fetchAssignmentById(assignment.id)}
              className="flex justify-between cursor-pointer border p-4 rounded shadow hover:bg-gray-50"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {assignment.title}
                </h3>
                <p className="text-sm text-gray-600">
                  Due: {new Date(assignment.due_date).toLocaleDateString()} -{" "}
                  <span
                    className={
                      isOverdue(assignment.due_date)
                        ? "text-red-500"
                        : "text-green-600"
                    }
                  >
                    {isOverdue(assignment.due_date) ? "Overdue" : "Upcoming"}
                  </span>
                </p>
                <p className="text-gray-500 mt-2 line-clamp-2">
                  {assignment.description}
                </p>
              </div>
              {isTeacher && <button className="btn btn-error">Delete</button>}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        <span>{`Page ${currentPage} of ${totalPages}`}</span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-4 py-2 mx-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Detailed view */}
      {selectedAssignment && (
        <div className="mt-8 bg-white p-4 rounded shadow">
          <div className="mt-8 bg-white p-4 rounded shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {selectedAssignment.title}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Due: {new Date(selectedAssignment.due_date).toLocaleDateString()}
            </p>
            <MarkdownRenderer content={selectedAssignment.description} />
          </div>
          {!isTeacher && (
            <div>
              {/* Form for Assignment Submission */}
              <form onSubmit={handleSubmitSubmission} className="space-y-4">
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Answer:
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={submissionForm.description}
                    onChange={handleSubmissionChange}
                    rows="4"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  ></textarea>
                </div>

                <div>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Submit Assignment
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Assignment;
