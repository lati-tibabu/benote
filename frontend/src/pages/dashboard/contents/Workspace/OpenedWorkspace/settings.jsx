import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import React, { useState, useEffect } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { FaRegSmile } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
  clearWorkspace,
  setWorkspace,
} from "../../../../../redux/slices/workspaceSlice";
import WorkspaceToTeam from "./Settings/workspace_to_team";
// import WorkspaceToTeam from "../../Setting/content/workspace_to_team";

const Settings = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const workspace = useSelector((state) => state.workspace?.workspace);
  const { workspaceId } = useParams();

  const [updatedWorkspace, setUpdatedWorkspace] = useState({
    name: workspace?.name,
    description: workspace?.description,
    emoji: workspace?.emoji,
    privacy: workspace?.belongs_to_team ? "Team-based" : "Private",
    ownedBy: workspace?.creator?.name,
    team: workspace?.belongs_to_team,
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setUpdatedWorkspace({
      name: workspace?.name,
      description: workspace?.description,
      emoji: workspace?.emoji,
      privacy: workspace?.belongs_to_team ? "Team-based" : "Private",
      ownedBy: workspace?.creator?.name,
      team: workspace?.belongs_to_team,
    });
  }, [workspace]);

  const handleSave = async () => {
    try {
      const requestOptions = {
        method: "PUT",
        headers: header,
        body: JSON.stringify({
          name: updatedWorkspace.name,
          description: updatedWorkspace.description,
          emoji: updatedWorkspace.emoji,
        }),
      };
      const response = await fetch(
        `${apiURL}/api/workspaces/${workspaceId}`,
        requestOptions
      );
      if (!response.ok)
        return toast.error("Error updating workspace with new information");

      getWorkspaceDetails(workspaceId);
      toast.success("Workspace updated successfully");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this workspace?"))
      return;

    try {
      const response = await fetch(`${apiURL}/api/workspaces/${workspaceId}`, {
        method: "DELETE",
        headers: header,
      });
      if (!response.ok) {
        console.log(await response.json());
        throw new Error("Failed to delete");
      }

      toast.success("Workspace deleted");
      dispatch(clearWorkspace());
      navigate("/app/workspace", { state: { workspaceUpdate: true } });
    } catch (error) {
      console.error("Error deleting workspace:", error);
      toast.error("Failed to delete workspace");
    }
  };

  const handleMigrate = (newPrivacy) => {
    const migrationConfirmed = window.confirm(
      `Are you sure you want to migrate the workspace to ${newPrivacy} settings?`
    );
    if (migrationConfirmed) {
      setUpdatedWorkspace({ ...updatedWorkspace, privacy: newPrivacy });
      alert(`Workspace migrated to ${newPrivacy}`);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setUpdatedWorkspace({
      ...updatedWorkspace,
      emoji: emoji.native,
    });
    setShowEmojiPicker(false);
  };

  const getWorkspaceDetails = async (id) => {
    try {
      const response = await fetch(`${apiURL}/api/workspaces/${id}`, {
        method: "GET",
        headers: header,
      });
      if (!response.ok) throw new Error("Failed to fetch workspace");

      const data = await response.json();
      dispatch(setWorkspace(data));
    } catch (error) {
      console.error("Error fetching workspace:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-gray-50 to-white shadow-sm rounded-sm">
      <ToastContainer />
      <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-8 text-center">
        Workspace Settings
      </h2>
      <form className="space-y-8">
        <fieldset className="flex flex-col relative border border-gray-200 p-6 rounded-sm bg-white/90">
          <legend className="text-lg font-semibold text-gray-600 mb-2 px-2">
            Workspace Name
          </legend>
          <input
            type="text"
            value={updatedWorkspace?.name || ""}
            onChange={(e) =>
              setUpdatedWorkspace({ ...updatedWorkspace, name: e.target.value })
            }
            className="p-3 border rounded-sm border-gray-300 focus:ring-2 focus:ring-gray-500 bg-transparent text-lg"
            placeholder="Enter workspace name"
            required
          />
        </fieldset>
        <fieldset className="flex flex-col relative border border-gray-200 p-6 rounded-sm bg-white/90">
          <legend className="text-lg font-semibold text-gray-600 mb-2 px-2">
            Description
          </legend>
          <textarea
            value={updatedWorkspace?.description || ""}
            onChange={(e) =>
              setUpdatedWorkspace({
                ...updatedWorkspace,
                description: e.target.value,
              })
            }
            className="p-3 border rounded-sm border-gray-300 focus:ring-2 focus:ring-gray-500 bg-transparent text-lg min-h-[80px]"
            placeholder="Enter workspace description"
            required
          />
        </fieldset>
        <fieldset className="flex flex-col relative border border-gray-200 p-6 rounded-sm bg-white/90">
          <legend className="text-lg font-semibold text-gray-600 mb-2 px-2">
            Emoji
          </legend>
          <div className="flex items-center gap-4">
            <input
              type="text"
              disabled
              className="p-2 text-4xl rounded-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-950 w-16 text-center"
              value={updatedWorkspace.emoji}
            />
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-sm hover:bg-gray-300 transition"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <FaRegSmile className="text-xl" />
              {showEmojiPicker ? "Hide" : "Select Emoji"}
            </button>
            <AiOutlineDelete
              className="hover:text-red-600 cursor-pointer text-2xl"
              onClick={() => {
                setUpdatedWorkspace({ ...updatedWorkspace, emoji: "" });
              }}
            />
          </div>
          {showEmojiPicker && (
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-white shadow-sm rounded-sm z-50 p-4 border border-gray-200">
              <h3 className="text-center text-lg font-semibold mb-2">
                Select an Emoji
              </h3>
              <Picker data={data} onEmojiSelect={handleEmojiSelect} />
            </div>
          )}
        </fieldset>
        <fieldset className="flex flex-col relative border border-gray-200 p-6 rounded-sm bg-white/90">
          <legend className="text-lg font-semibold text-gray-600 mb-2 px-2">
            Privacy Settings
          </legend>
          <select
            value={updatedWorkspace?.privacy || ""}
            onChange={(e) =>
              setUpdatedWorkspace({
                ...updatedWorkspace,
                privacy: e.target.value,
              })
            }
            className="p-3 border rounded-sm border-gray-300 focus:ring-2 focus:ring-gray-500 bg-transparent text-lg"
          >
            <option value="Private">Private</option>
            <option value="Team-based">Team-based</option>
          </select>
        </fieldset>
        <div className="flex flex-col sm:flex-row mt-8 gap-4">
          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white font-semibold rounded-sm shadow-sm transition text-lg"
          >
            Save Settings
          </button>
          <button
            type="button"
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold rounded-sm shadow-sm transition text-lg"
            onClick={handleDelete}
          >
            Delete Workspace
          </button>
        </div>
      </form>
      {updatedWorkspace?.privacy === "Private" && (
        <div className="mt-12">
          <WorkspaceToTeam workspaceId={workspaceId} />
        </div>
      )}
    </div>
  );
};

export default Settings;
