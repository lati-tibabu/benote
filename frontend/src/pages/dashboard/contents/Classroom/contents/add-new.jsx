import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";

const AddNew = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [classroomData, setClassroomData] = useState({
    name: "",
    description: "",
    teacher_id: "",
  });

  const userData = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (userData?.id)
      setClassroomData((prev) => ({
        ...prev,
        teacher_id: userData?.id,
      }));
  }, [userData]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${apiURL}/api/classrooms`, {
      method: "POST",
      headers: header,
      body: JSON.stringify(classroomData),
    });

    if (!response.ok) {
      toast.error("Something went wrong!");
    }
    const data = await response.json();
    toast.success("Classroom created successfully!");
    console.log(data);

    setClassroomData((prev) => ({
      ...prev,
      name: "",
      description: "",
    }));
  };

  return (
    <div>
      Add New Classroom
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-2">
        {/* Classroom Name */}
        <fieldset className="border-2 p-2 rounded-lg">
          <legend>Name</legend>
          <input
            type="text"
            placeholder="Classroom Name"
            value={classroomData.name}
            className="p-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 bg-transparent w-full"
            onChange={(e) => {
              setClassroomData((prev) => ({
                ...prev,
                name: e.target.value,
              }));
            }}
          />
        </fieldset>

        {/* Classroom Description */}
        <fieldset className="border-2 p-2 rounded-lg">
          <legend>Description</legend>
          <input
            type="text"
            placeholder="Classroom Description"
            value={classroomData.description}
            className="p-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 bg-transparent w-full"
            onChange={(e) => {
              setClassroomData((prev) => ({
                ...prev,
                description: e.target.value,
              }));
            }}
          />
        </fieldset>

        <button className="btn">Create</button>
      </form>
    </div>
  );
};

export default AddNew;
