import React, { useEffect, useState } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { AiOutlineDelete } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify"; // Import toast library
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import { useSelector } from "react-redux";

const AddNew = (props) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const teamId = props.teamId;

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiText, setEmojiText] = useState("");
  const [worskapceLoading, setWorkspaceLoading] = useState(false);

  const navigate = useNavigate();

  const userData = useSelector((state) => state.auth.user) || {};

  const [workspaceData, setWorkspaceData] = useState({
    owned_by: null, // Initialize to null
    name: "",
    description: "",
    belongs_to_team: teamId ? teamId : null,
  });

  useEffect(() => {
    // Update owned_by when userData changes (after decoding)
    setWorkspaceData((prev) => ({
      ...prev,
      owned_by: userData?.id ?? null,
    }));
  }, [userData]);

  const createWorkspace = async (e) => {
    e.preventDefault();
    setWorkspaceLoading(true);

    if (!userData || !userData.id) {
      toast.error("User data is not available. Please log in again.");
      setWorkspaceLoading(false);
      return;
    }

    // console.log(workspaceData);

    try {
      // Add ?team=1 to the API URL if teamId is present
      let workspaceApiUrl = `${apiURL}/api/workspaces`;
      if (teamId) {
        workspaceApiUrl += "?team=1";
      }
      const workspaceResponse = await fetch(workspaceApiUrl, {
        method: "POST",
        body: JSON.stringify(workspaceData),
        headers: header,
      });

      const workspaceResult = await workspaceResponse.json();

      // Handle permission error gracefully
      if (
        workspaceResponse.status === 403 &&
        workspaceResult.message &&
        workspaceResult.message.includes("permission")
      ) {
        toast.error(
          // "You do not have permission to create a workspace for this team. Only team admins can create workspaces."
          workspaceResult.message ||
            "You do not have permission to create a workspace for this team. Only team admins can create workspaces."
        );
        setWorkspaceLoading(false);
        return;
      }

      if (!workspaceResponse.ok || !workspaceResult.id) {
        console.error("Workspace creation failed:", workspaceResult);
        toast.error(
          `Workspace creation failed: ${
            workspaceResult.message || "Unknown error"
          }`
        );
        setWorkspaceLoading(false);
        return;
      }

      const workspaceId = workspaceResult.id;

      if (teamId) {
        let membershipData = {
          team_id: teamId || workspaceData.belongs_to_team || null,
        };

        // console.log("Membership data being sent:", membershipData); // Log the data being sent

        const membershipResponse = await fetch(
          `${apiURL}/api/workspaces/${workspaceId}/members`,
          {
            method: "POST",
            body: JSON.stringify(membershipData),
            headers: header,
          }
        );

        const membershipResult = await membershipResponse.json();

        if (!membershipResponse.ok) {
          console.error("Membership creation failed:", membershipResult);
          toast.error(
            `Failed to create workspace membership: ${
              membershipResult.message || "Unknown error"
            }`
          );
          throw new Error(
            `Failed to create workspace membership: ${JSON.stringify(
              membershipResult
            )}`
          );
        }

        toast.success("Workspace created successfully!");
      }
      setWorkspaceLoading(false);
      navigate(`/app/workspace/open/${workspaceId}`);
    } catch (err) {
      console.error("Error creating workspace:", err);
      toast.error(
        "An error occurred while creating the workspace.  See console for details."
      );
      setWorkspaceLoading(false);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setEmojiText(emoji.native);
    setWorkspaceData({
      ...workspaceData,
      emoji: emoji.native,
    });
    setShowEmojiPicker(false);
  };

  return (
    <div className="w-full flex">
      <ToastContainer />
      <div className="bg-transparent p-4 rounded-md shadow-md lg:w-1/2 w-full mt-10 grow">
        <div className="flex items-center gap-2 font-bold text-lg">
          <p className="text-2xl">🗂️</p>
          <h1>add new workspace</h1>
        </div>
        <hr className="h-1/2 bg-gray-500" />
        <p>Fill in the form below to create a new workspace</p>
        <form
          className="flex flex-col gap-2 mt-3"
          onSubmit={(event) => createWorkspace(event)}
        >
          <fieldset className="fieldset flex flex-col gap-1">
            <label htmlFor="workspaceName"> workspace's name</label>
            <input
              type="text"
              id="workspaceName"
              name="workspaceName"
              value={workspaceData.name}
              onChange={(e) => {
                setWorkspaceData({ ...workspaceData, name: e.target.value });
              }}
              placeholder="eg. My workspace"
              className="p-2 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-950"
              required
            />
          </fieldset>

          <fieldset className="fieldset flex flex-col gap-1">
            <label htmlFor="description">description</label>
            <textarea
              id="description"
              name="description"
              value={workspaceData.description}
              onChange={(e) => {
                setWorkspaceData({
                  ...workspaceData,
                  description: e.target.value,
                });
              }}
              className="p-2 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-950"
              placeholder="eg. This workspace is for my personal projects"
            ></textarea>
          </fieldset>

          <fieldset>
            <legend className="fieldset-legend">emoji</legend>
            <div className="flex items-center gap-2 justify-between mb-3 flex-col sm:flex-row">
              <input
                type="text"
                disabled
                className="p-2 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-950 text-xl"
                value={workspaceData.emoji}
                onChange={(e) => {
                  setWorkspaceData({
                    ...workspaceData,
                    emoji: e.target.value,
                  });
                }}
              />
              <span>
                <AiOutlineDelete
                  className="hover:text-red-600 cursor-pointer text-xl"
                  onClick={() => {
                    setWorkspaceData({
                      ...workspaceData,
                      emoji: "",
                    });
                  }}
                />
              </span>
              <button
                type="button"
                className="btn"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                {showEmojiPicker ? "hide emoji picker" : "show emoji picker"}
              </button>
            </div>
            {showEmojiPicker && (
              <Picker data={data} onEmojiSelect={handleEmojiSelect} />
            )}
          </fieldset>

          {worskapceLoading ? (
            <div>
              <span className="loading loading-spinner"></span>
              Creating workspace
            </div>
          ) : (
            <button
              type="submit"
              className="btn btn-primary bg-black hover:bg-gray-800 text-white border-none"
            >
              Create Workspace
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddNew;
