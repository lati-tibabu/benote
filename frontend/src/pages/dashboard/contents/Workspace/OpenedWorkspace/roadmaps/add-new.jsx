import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const AddNewRoadmap = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const userData = useSelector((state) => state.auth.user) || {};
  const { workspaceId } = useParams();

  const [roadmap, setRoadmap] = useState({
    title: "",
    description: "",
    created_by: userData?.id,
    workspace_id: workspaceId,
  });

  const handleAddRoadmap = async (e) => {
    e.preventDefault();
    console.log(roadmap);

    try {
      const response = await fetch(`${apiURL}/api/roadmaps`, {
        method: "POST",
        body: JSON.stringify(roadmap),
        headers: header,
      });
      if (!response.ok) {
        console.log("Failed");
        return;
      }
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.log("Error happend while creating roadmap: ", error);
    }
  };

  const navigate = useNavigate();

  return (
    <div className="p-4">
      AddNewRoadmap
      <form
      // onSubmit={() => handleSubmit}
      >
        <fieldset className="flex flex-col relative border-2 p-4 rounded-sm">
          <legend className="text-lg font-medium text-gray-600 mb-2">
            Title
          </legend>
          <input
            className="p-3 border rounded-sm border-gray-300 focus:ring-2 focus:ring-gray-500 bg-transparent"
            type="text"
            name="title"
            onChange={(e) => setRoadmap({ ...roadmap, title: e.target.value })}
          />
        </fieldset>
        <fieldset className="flex flex-col relative border-2 p-4 rounded-sm">
          <legend className="text-lg font-medium text-gray-600 mb-2">
            Description
          </legend>
          <textarea
            className="p-3 border rounded-sm border-gray-300 focus:ring-2 focus:ring-gray-500 bg-transparent"
            onChange={(e) =>
              setRoadmap({ ...roadmap, description: e.target.value })
            }
          ></textarea>
        </fieldset>

        <button
          type="button"
          className="btn w-full bg-gray-500 text-white hover:bg-gray-600 mt-2"
          onClick={handleAddRoadmap}
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default AddNewRoadmap;
