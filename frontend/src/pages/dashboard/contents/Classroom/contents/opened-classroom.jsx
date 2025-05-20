import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaUserGraduate } from "react-icons/fa";
import { MdAssignment } from "react-icons/md";
import { BiBook } from "react-icons/bi";
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
  const [submissionsError, setSubmissionsError] = useState(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

  const fetchClassroom = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiURL}/api/classrooms/${classroomId}`, {
        method: "GET",
        headers: header,
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setClassroom(data);
      console.log(classroom);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      setSubmissionsLoading(true);
      let url = `${apiURL}/api/submissions`;
      if (assignmentId) {
        url += `?assignmentId=${assignmentId}`;
      }
      const response = await fetch(url, {
        method: "GET",
        headers: header,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // console.log(data);

      setSubmissions(data);
    } catch (e) {
      setSubmissionsError(e.message);
    } finally {
      setSubmissionsLoading(false);
    }
  };

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
      fetchClassroom(); // Refresh data
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
      fetchClassroom(); // Refresh data
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (classroomId) fetchClassroom();
  }, [classroomId]);

  useEffect(() => {
    fetchSubmissions(selectedAssignmentId);
  }, [selectedAssignmentId]);

  return (
    <div className="container mx-auto px-6 py-8">
      {loading && <p className="text-center mt-10 text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-500 mt-10">{error}</p>}

      {classroom && (
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              {classroom.name}
            </h1>
            <button
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow hover:scale-105 transition-transform"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
          </div>

          <p className="text-gray-600">{classroom.description}</p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">
              Teacher
            </h2>
            <div className="flex items-center space-x-2">
              <FaUserGraduate className="text-gray-500" />
              <p className="text-gray-800">{classroom.teacher.name}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Students{classroom?.isTeacher && " (You can add or remove)"}
            </h2>
            {classroom?.students.length}{" "}
            {classroom?.students.length > 1 ? "students" : "student"} enrolled
            {classroom?.isTeacher && (
              <div className="flex items-center mb-4 space-x-2">
                <input
                  type="email"
                  value={email}
                  placeholder="Enter student email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddStudent}
                  disabled={actionLoading}
                  className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                >
                  <AiOutlinePlus className="mr-1" /> Add
                </button>
              </div>
            )}
            <ul className="divide-y divide-gray-200">
              {classroom.students.map((student) => (
                <li
                  key={student.id}
                  className="py-3 flex justify-between items-center"
                >
                  <div className="flex items-center space-x-3">
                    <FaUserGraduate className="text-blue-500" />
                    <span className="text-gray-800">{student.name}</span>
                    <span className="text-gray-800">{student.email}</span>
                  </div>
                  {classroom?.isTeacher && (
                    <button
                      onClick={() => handleRemoveStudent(student.email)}
                      className="flex items-center px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
                    >
                      <AiOutlineDelete className="mr-1" />
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section>
            {/* <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Assignments
            </h2>
            
            <p className="text-gray-500">
              No assignments available at the moment.
            </p> */}
            <Assignment
              classroomId={classroomId}
              isTeacher={classroom?.isTeacher}
              onAssignmentClick={(assignmentId) => {
                setSelectedAssignmentId(assignmentId);
              }}
            />
          </section>

          <section>
            <Materials isTeacher={classroom?.isTeacher || false} />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Submissions
            </h2>
            {submissionsLoading && (
              <p className="text-center mt-2 text-gray-500">Loading...</p>
            )}
            {/* {submissionsError && (
              <p className="text-center text-red-500 mt-2">
                {submissionsError}
              </p>
            )} */}
            {!submissionsLoading &&
              !submissionsError &&
              submissions.length === 0 && (
                <p className="text-gray-500">
                  No submissions available at the moment.
                </p>
              )}
            {!submissionsLoading &&
              // !submissionsError &&
              submissions?.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {submissions.map((submission) => (
                    <li
                      key={submission.id}
                      className="py-2 flex flex-col border border-black p-2 rounded-box"
                    >
                      <p>Submission ID: {submission.id}</p>

                      <p>{submission?.student.name}</p>
                      {/* Display other submission details as needed */}
                    </li>
                  ))}
                </ul>
              )}
          </section>
        </div>
      )}
    </div>
  );
};

export default OpenedClassroom;
