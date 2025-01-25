import React, { useEffect, useState } from "react";
import {
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlineBackward,
} from "react-icons/ai";
import { FaChevronLeft } from "react-icons/fa";
import { useParams } from "react-router-dom";

const WorkspaceOpened = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const { workspaceId } = useParams();

  const [workspace, setWorkspace] = useState({});

  const getWorkspaceDetails = async (id) => {
    const response = await fetch(`${apiURL}/api/workspaces/${id}`, {
      method: "GET",
      headers: header,
    });
    const data = await response.json();
    // console.log(data);
    setWorkspace(data);
  };

  useEffect(() => {
    getWorkspaceDetails(workspaceId);
  }, []);

  return (
    <div>
      <button type="button" className="p-5 bg-gray-200 rounded-full m-2">
        {/* <AiOutlineArrowLeft /> */}
        <FaChevronLeft
          onClick={() => {
            window.history.back();
          }}
        />
      </button>
      WorkspaceOpened
      <h1>{workspace.emoji}</h1>
      <h1>{workspace.name}</h1>
      <h1>{workspace.description}</h1>
    </div>
  );
};

export default WorkspaceOpened;
