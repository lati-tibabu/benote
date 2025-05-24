import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaUserGraduate } from "react-icons/fa";
import { AiOutlineDelete, AiOutlinePlus } from "react-icons/ai";
import Assignment from "../management/Assignment";
import Materials from "../management/Materials";

const OpenedClassroom = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${apiURL}/api/classrooms/${classroomId}`,
          {
            method: "GET",
            headers: header,
          }
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setClassroom(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (classroomId) fetchClassroom();
  }, [classroomId]);

  const handleAddStudent = async () => {
    if (!email) return;
    setActionLoading(true);
    try {
      const response = await fetch(
        `${apiURL}/api/classrooms/${classroomId}/join`,
        {
          method: "POST",
          headers: header,
          body: JSON.stringify({ email }),
        }
      );
      if (!response.ok) throw new Error("Failed to add student.");
      setEmail("");
      const updated = await fetch(`${apiURL}/api/classrooms/${classroomId}`, {
        method: "GET",
        headers: header,
      });
      const data = await updated.json();
      setClassroom(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveStudent = async (emailToRemove) => {
    if (!emailToRemove) return;
    setActionLoading(true);
    try {
      const response = await fetch(
        `${apiURL}/api/classrooms/${classroomId}/leave`,
        {
          method: "POST",
          headers: header,
          body: JSON.stringify({ email: emailToRemove }),
        }
      );
      if (!response.ok) throw new Error("Failed to remove student.");
      const updated = await fetch(`${apiURL}/api/classrooms/${classroomId}`, {
        method: "GET",
        headers: header,
      });
      const data = await updated.json();
      setClassroom(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {loading && (
        <p className="text-center text-gray-500">Loading classroom...</p>
      )}
      {error && <p className="text-center text-red-500">{error}</p>}

      {classroom && (
        <div className="bg-white shadow-xl rounded-2xl p-8 space-y-10 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                {classroom.name}
              </h1>
              <p className="text-gray-500 mt-2">{classroom.description}</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition"
            >
              Back
            </button>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Teacher
            </h2>
            <div className="flex items-center space-x-3">
              <FaUserGraduate className="text-gray-400" />
              <span className="text-gray-800">{classroom.teacher.name}</span>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Students {classroom?.isTeacher && "(Manage)"}
            </h2>
            <p className="text-gray-500 mb-4">
              {classroom.students.length}{" "}
              {classroom.students.length === 1 ? "student" : "students"}{" "}
              enrolled
            </p>

            {classroom?.isTeacher && (
              <div className="mb-6 flex gap-3 flex-wrap items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Student email"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddStudent}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  <AiOutlinePlus /> Add
                </button>
              </div>
            )}

            <ul className="space-y-3">
              {classroom.students.map((student) => (
                <li
                  key={student.id}
                  className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <FaUserGraduate className="text-blue-500" />
                    <div>
                      <p className="text-gray-800">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                  </div>
                  {classroom?.isTeacher && (
                    <button
                      onClick={() => handleRemoveStudent(student.email)}
                      className="flex items-center gap-1 text-sm px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
                    >
                      <AiOutlineDelete /> Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <Assignment
            classroomId={classroomId}
            isTeacher={classroom?.isTeacher}
            onAssignmentClick={(assignmentId) =>
              setSelectedAssignmentId(assignmentId)
            }
          />

          <Materials isTeacher={classroom?.isTeacher || false} />

          {classroom?.isTeacher && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Submissions
              </h2>
              {submissionsLoading ? (
                <p className="text-gray-500">Loading submissions...</p>
              ) : submissions.length === 0 ? (
                <p className="text-gray-500">No submissions available yet.</p>
              ) : (
                <ul className="space-y-2">
                  {submissions.map((submission) => (
                    <li
                      key={submission.id}
                      className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
                    >
                      <p className="text-gray-800 font-medium">
                        ID: {submission.id}
                      </p>
                      <p className="text-gray-600">
                        {submission?.student.name}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OpenedClassroom;
