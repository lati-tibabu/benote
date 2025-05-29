import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaUserGraduate } from "react-icons/fa";
import { AiOutlineDelete, AiOutlinePlus } from "react-icons/ai";
import { PiSignOutBold } from "react-icons/pi";
import Assignment from "../management/Assignment";
import Materials from "../management/Materials";
import Submission from "../management/Submission";
import MySubmission from "../management/MySubmission";
import Communication from "../management/Communication";
import { toast, ToastContainer } from "react-toastify";

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
  const [userEmail, setUserEmail] = useState("");

  // Tab state
  const [activeTab, setActiveTab] = useState("overview");

  // Tab definitions
  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "students", label: "Students" },
    { key: "assignments", label: "Assignments" },
    { key: "materials", label: "Materials" },
    { key: "submissions", label: "Submissions" },
    // { key: "communication", label: "Communication" }, // Add Communication tab
  ];

  // Assignment name state for global highlight
  const [selectedAssignmentName, setSelectedAssignmentName] = useState("");

  // Helper to update both id and name
  const handleAssignmentClick = (assignmentId, assignmentName) => {
    setSelectedAssignmentId(assignmentId);
    setSelectedAssignmentName(assignmentName);
  };

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
        // Set user email if student
        if (token) {
          try {
            const jwtPayload = JSON.parse(atob(token.split(".")[1]));
            setUserEmail(jwtPayload.email);
          } catch (e) {
            setUserEmail("");
          }
        }
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
      if (!response.ok) {
        // toast.error(
        //   (await response.json().message) || "Failed to add student."
        // );
        const data = await response.json();
        // console.log("Error response:", data);
        // console.log("Failed to add student:", await response.json());
        toast.error(data.message || "Failed to add student.");

        // throw new Error("Failed to add student.");
        return;
      }

      // Clear email input after successful addition
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

  const handleLeaveClassroom = async () => {
    if (!userEmail) return;
    setActionLoading(true);
    try {
      const response = await fetch(
        `${apiURL}/api/classrooms/${classroomId}/leave`,
        {
          method: "POST",
          headers: header,
          body: JSON.stringify({ email: userEmail }),
        }
      );
      if (!response.ok) {
        const data = await response.json();
        toast.error(data.message || "Failed to leave classroom.");
        return;
      }
      toast.success("You have left the classroom.");
      navigate("/app/classrooms");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <ToastContainer />
      {loading && (
        <div className="flex justify-center items-center h-40">
          <span className="text-lg text-gray-400 animate-pulse">
            Loading classroom...
          </span>
        </div>
      )}
      {error && (
        <div className="text-center text-red-500 font-medium py-4">{error}</div>
      )}

      {classroom && (
        <div className="bg-white/90 shadow-2xl rounded-3xl p-10 space-y-10 border border-gray-100 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b pb-6">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                {classroom?.name}
              </h1>
              <p className="text-gray-500 mt-2 text-lg">
                {classroom?.description}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl shadow-md font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Back
              </button>
              {/* Show Leave Classroom button if not teacher and student is enrolled */}
              {!classroom.isTeacher &&
              classroom.students &&
              classroom.students.some((s) => s.email === userEmail) ? (
                <button
                  onClick={handleLeaveClassroom}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 text-white rounded-xl shadow-md font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  <PiSignOutBold className="text-xl" /> Leave Classroom
                </button>
              ) : null}
            </div>
          </div>

          {/* Highlighted selected assignment name globally */}
          {selectedAssignmentId && selectedAssignmentName && (
            <div className="mb-2 flex justify-center">
              <span className="inline-block px-5 py-2 bg-yellow-50 text-yellow-800 font-semibold rounded-full shadow-sm border border-yellow-200 text-base">
                Selected Assignment: {selectedAssignmentName}
              </span>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`px-5 py-2 font-semibold rounded-t-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200
                  ${
                    activeTab === tab.key
                      ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600 shadow-sm"
                      : "bg-transparent text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            {activeTab === "overview" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <FaUserGraduate className="text-blue-400" /> Teacher
                </h2>
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-gray-800 font-medium text-lg">
                    {classroom?.teacher.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-base">
                  <span className="font-semibold text-gray-700">
                    {classroom?.students.length}
                  </span>
                  {classroom?.students.length === 1 ? "student" : "students"}{" "}
                  enrolled
                </div>
              </div>
            )}
            {activeTab === "students" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-gray-700">Students</h2>
                  {classroom?.isTeacher && (
                    <span className="text-blue-500 text-base">(Manage)</span>
                  )}
                </div>
                {classroom?.isTeacher && (
                  <div className="mb-4 flex gap-3 flex-wrap items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Student email"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm text-base"
                    />
                    <button
                      onClick={handleAddStudent}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white rounded-lg font-semibold shadow-md transition-all disabled:opacity-60"
                    >
                      <AiOutlinePlus /> Add
                    </button>
                  </div>
                )}
                <ul className="space-y-3">
                  {classroom.students.map((student) => (
                    <li
                      key={student.id}
                      className="flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm hover:bg-blue-50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <FaUserGraduate className="text-blue-500 text-xl" />
                        <div>
                          <p className="text-gray-800 font-medium">
                            {student.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.email}
                          </p>
                        </div>
                      </div>
                      {classroom?.isTeacher && (
                        <button
                          onClick={() => handleRemoveStudent(student.email)}
                          className="flex items-center gap-1 text-sm px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md font-semibold shadow transition-all"
                        >
                          <AiOutlineDelete /> Remove
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === "assignments" && (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                <Assignment
                  classroomId={classroomId}
                  isTeacher={classroom?.isTeacher}
                  onAssignmentClick={(assignmentId, assignmentName) =>
                    handleAssignmentClick(assignmentId, assignmentName)
                  }
                />
              </div>
            )}
            {activeTab === "materials" && (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                <Materials isTeacher={classroom?.isTeacher || false} />
              </div>
            )}
            {activeTab === "submissions" && selectedAssignmentId && (
              <div className="space-y-6">
                {!classroom?.isTeacher ? (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                    <MySubmission
                      assignmentId={selectedAssignmentId}
                      isTeacher={classroom?.isTeacher}
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                    <Submission assignmentId={selectedAssignmentId} />
                  </div>
                )}
              </div>
            )}
            {activeTab === "communication" && (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                <Communication
                  classroomId={classroomId}
                  isTeacher={classroom?.isTeacher}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenedClassroom;
