import React from "react";
import { useSelector } from "react-redux";

const AddNew = () => {
  const userData = useSelector((state) => state.auth.user);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log(userData);
  };
  return (
    <div>
      Add New Classroom
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-2">
        <fieldset className="border-2 p-2 rounded-lg">
          <legend>Name</legend>
          <input
            type="text"
            id="title"
            className="p-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 bg-transparent w-full"
          />
        </fieldset>

        <button className="btn">Create</button>
      </form>
    </div>
  );
};

export default AddNew;
