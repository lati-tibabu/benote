import React, { useEffect, useState } from "react";
import { FaChalkboardTeacher } from "react-icons/fa";
import { MdClass } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const ClassroomList = ({ requestType }) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${apiURL}/api/classrooms?requestType=${requestType}`,
        {
          method: "GET",
          headers: header,
        }
      );
      const data = await response.json();
      // console.log(data);
      setClassrooms(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const navigate = useNavigate();
  const handleOpenClassroom = (id) => {
    navigate(id);
  };
  return (
    <div>
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4"> */}
      <div className="flex flex-col gap-5">
        {loading ? (
          <p>Loading...</p>
        ) : classrooms.length > 0 ? (
          classrooms.map((classroom) => (
            <div
              key={classroom.id}
              title={classroom.description}
              className="bg-white shadow-md rounded-xl p-5 flex flex-col items-center justify-center border border-gray-200 hover:bg-gray-100 cursor-pointer transition duration-300"
              onClick={() => handleOpenClassroom(classroom.id)}
            >
              <div className="bg-blue-100 p-3 rounded-full">
                <MdClass className="text-blue-600 text-3xl" />
              </div>
              <h2 className="text-lg font-semibold mt-3">{classroom.name}</h2>
              <p className="text-sm text-gray-600 text-center mt-2">
                {classroom.description || "No description available"}
              </p>
              <div className="flex items-center gap-2 mt-3 text-gray-700">
                <FaChalkboardTeacher className="text-xl text-green-600" />
                <span className="text-sm font-medium">
                  {classroom.teacher?.name || "Unknown Teacher"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p>No classroom</p>
        )}
        {error && <p>{error}</p>}
      </div>
    </div>
  );
};

export default ClassroomList;
