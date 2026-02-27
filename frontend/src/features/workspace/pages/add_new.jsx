import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify"; // Import toast library
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import { useSelector } from "react-redux";
import {
  DEFAULT_WORKSPACE_ICON,
  WORKSPACE_ICON_OPTIONS,
  WorkspaceIcon,
} from "@shared/components/ui/workspace-icon";

const AddNew = (props) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const teamId = props.teamId;

  const [showIconPicker, setShowIconPicker] = useState(false);
  const [worskapceLoading, setWorkspaceLoading] = useState(false);

  const navigate = useNavigate();

  const userData = useSelector((state) => state.auth.user) || {};

  const [workspaceData, setWorkspaceData] = useState({
    owned_by: null, // Initialize to null
    name: "",
    description: "",
    emoji: DEFAULT_WORKSPACE_ICON,
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

  const handleIconSelect = (iconKey) => {
    setWorkspaceData({
      ...workspaceData,
      emoji: iconKey,
    });
    setShowIconPicker(false);
  };

  return (
    <div className="w-full flex">
      <ToastContainer />
      <div className="bg-transparent p-4 rounded-sm shadow-sm lg:w-1/2 w-full mt-10 grow">
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
              className="p-2 border border-gray-300 rounded-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-950"
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
              className="p-2 border border-gray-300 rounded-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-950"
              placeholder="eg. This workspace is for my personal projects"
            ></textarea>
          </fieldset>

          <fieldset>
            <legend className="fieldset-legend">Workspace Icon</legend>
            <div className="flex items-center gap-3 mb-3 flex-col sm:flex-row">
              <div className="w-12 h-12 rounded-xl border border-gray-300 flex items-center justify-center bg-white">
                <WorkspaceIcon
                  iconKey={workspaceData.emoji}
                  size={24}
                  className="text-gray-700"
                  fallbackClassName="text-xl"
                />
              </div>
              <button
                type="button"
                className="btn"
                onClick={() => setShowIconPicker(!showIconPicker)}
              >
                {showIconPicker ? "Hide Icon Picker" : "Select Icon"}
              </button>
            </div>
            {showIconPicker && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-2 border border-gray-200 rounded-sm bg-white">
                {WORKSPACE_ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon.key}
                    type="button"
                    title={icon.label}
                    onClick={() => handleIconSelect(icon.key)}
                    className={`h-11 w-11 rounded-lg border flex items-center justify-center transition ${
                      workspaceData.emoji === icon.key
                        ? "border-gray-700 bg-gray-100"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <icon.Icon size={22} className="text-gray-700" />
                  </button>
                ))}
              </div>
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
