import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const AddNewRoadmapItem = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const userData = useSelector((state) => state.auth.user) || {};
  const { roadmap_id, workspaceId } = useParams();

  const [roadmapItem, setRoadmapItem] = useState({
    title: "",
    description: "",
    roadmap_id: roadmap_id,
  });

  const handleAddRoadmap = async (e) => {
    e.preventDefault();
    console.log(roadmapItem);

    try {
      const response = await fetch(`${apiURL}/api/roadmapItems`, {
        method: "POST",
        body: JSON.stringify(roadmapItem),
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
      Add New Roadmap Item
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
            onChange={(e) =>
              setRoadmapItem({ ...roadmapItem, title: e.target.value })
            }
          />
        </fieldset>
        <fieldset className="flex flex-col relative border-2 p-4 rounded-sm">
          <legend className="text-lg font-medium text-gray-600 mb-2">
            Description
          </legend>
          <textarea
            className="p-3 border rounded-sm border-gray-300 focus:ring-2 focus:ring-gray-500 bg-transparent"
            onChange={(e) =>
              setRoadmapItem({ ...roadmapItem, description: e.target.value })
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

export default AddNewRoadmapItem;
