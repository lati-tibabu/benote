import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const AddNewRoadmapItem = ({ theme = "chalk" }) => {
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

  const isWhiteTheme = theme === "white";
  const wrapperClass = isWhiteTheme
    ? "roadmap-form roadmap-form-white"
    : "roadmap-form roadmap-form-chalk";

  return (
    <div className={wrapperClass}>
      <h3 className="roadmap-form-title chalk-text">Add New Roadmap Item</h3>
      <form>
        <fieldset className="roadmap-form-fieldset">
          <legend className="roadmap-form-legend chalk-text">
            Title
          </legend>
          <input
            className="roadmap-form-input chalk-text"
            type="text"
            name="title"
            onChange={(e) =>
              setRoadmapItem({ ...roadmapItem, title: e.target.value })
            }
          />
        </fieldset>
        <fieldset className="roadmap-form-fieldset">
          <legend className="roadmap-form-legend chalk-text">
            Description
          </legend>
          <textarea
            className="roadmap-form-input roadmap-form-textarea chalk-text"
            onChange={(e) =>
              setRoadmapItem({ ...roadmapItem, description: e.target.value })
            }
          ></textarea>
        </fieldset>

        <button
          type="button"
          className="roadmap-form-submit chalk-text"
          onClick={handleAddRoadmap}
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default AddNewRoadmapItem;
