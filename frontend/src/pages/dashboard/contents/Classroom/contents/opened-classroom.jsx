import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaChalkboardTeacher } from "react-icons/fa";
import { MdAssignment, MdPeople, MdUploadFile } from "react-icons/md";
import { AiOutlineFileAdd } from "react-icons/ai";

const OpenedClassroom = () => {
  const { id } = useParams(); // Get classroom ID from URL

  // Static data for testing
  const classroomData = {
    id: 1,
    name: "Math 101",
    description: "An introductory course to Mathematics.",
    teacher: {
      id: 1,
      name: "John Doe",
    },
    students: [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" },
    ],
    assignments: [
      {
        id: 1,
        title: "Homework 1",
        description: "Solve algebra problems",
        deadline: "2025-04-10",
      },
      {
        id: 2,
        title: "Homework 2",
        description: "Solve calculus problems",
        deadline: "2025-04-15",
      },
    ],
    materials: [
      {
        id: 1,
        title: "Math Lecture 1",
        link: "/materials/lecture1.pdf",
      },
      {
        id: 2,
        title: "Math Lecture 2",
        link: "/materials/lecture2.pdf",
      },
    ],
  };

  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    try {
      // Simulate fetching static data
      setClassroom(classroomData);
    } catch (error) {
      setError("Failed to load classroom data.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!classroom)
    return <p className="text-center mt-10">Classroom not found</p>;

  const isTeacher =
    classroom.teacher.id === JSON.parse(localStorage.getItem("user"))?.id;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Classroom Header */}
      <div className="bg-blue-500 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold">{classroom.name}</h1>
        <p className="mt-1">{classroom.description}</p>
        <div className="mt-2 flex items-center gap-2">
          <FaChalkboardTeacher size={20} />
          <span className="font-medium">{classroom.teacher.name}</span>
        </div>
      </div>

      {/* Content Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assignments */}
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MdAssignment size={24} className="text-blue-500" /> Assignments
            </h2>
            {isTeacher && (
              <button className="bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-1">
                <AiOutlineFileAdd /> Add
              </button>
            )}
          </div>
          {classroom.assignments.length > 0 ? (
            classroom.assignments.map((assignment) => (
              <div key={assignment.id} className="p-2 border-b">
                <h3 className="font-medium">{assignment.title}</h3>
                <p className="text-sm text-gray-600">{assignment.deadline}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No assignments yet.</p>
          )}
        </div>

        {/* Materials */}
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MdUploadFile size={24} className="text-green-500" /> Materials
            </h2>
            {isTeacher && (
              <button className="bg-green-500 text-white px-3 py-1 rounded flex items-center gap-1">
                <AiOutlineFileAdd /> Upload
              </button>
            )}
          </div>
          {classroom.materials.length > 0 ? (
            classroom.materials.map((material) => (
              <div
                key={material.id}
                className="p-2 border-b flex justify-between"
              >
                <p className="text-sm">{material.title}</p>
                <a href={material.link} className="text-blue-500 text-sm">
                  Download
                </a>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No materials uploaded yet.</p>
          )}
        </div>

        {/* Manage Students (Teacher-Only) */}
        {isTeacher && (
          <div className="bg-white p-4 rounded-lg shadow-md border">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MdPeople size={24} className="text-purple-500" /> Manage Students
            </h2>
            <ul className="mt-3">
              {classroom.students.map((student) => (
                <li
                  key={student.id}
                  className="flex justify-between p-2 border-b"
                >
                  <span>{student.name}</span>
                  <button className="text-red-500 text-sm">Remove</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenedClassroom;
