import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AddNew from "../../Workspace/add_new";
import { setWorkspaceTeam } from "../../../../../redux/slices/workspaceSlice";

const TeamWorkspaces = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // const [workspaces, setWorkspaces] = useState([]);
  const workspaces =
    useSelector((state) => state.workspace.workspaceTeam) || [];

  const [loading, setLoading] = useState(false);

  const team = useSelector((state) => state.team.team);
  const { teamId } = useParams();
  const dispatch = useDispatch();
  const location = useLocation();

  const loadWorkspaces = async () => {
    !workspaces.length && setLoading(true);
    try {
      const response = await fetch(`${apiURL}/api/workspaces/${teamId}/team`, {
        method: "GET",
        headers: header,
      });
      if (!response.ok) {
        throw new Error("Error fetching workspace for the team");
      }
      const data = await response.json();
      dispatch(setWorkspaceTeam(data));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) {
      loadWorkspaces();
    }
  }, [team, location]);

  const navigate = useNavigate();
  const handleWorkspaceOpen = (workspaceId) => {
    navigate(`/app/workspace/open/${workspaceId}`);
  };

  // Function to remove a workspace from the team
  const handleRemoveFromTeam = async (workspaceId) => {
    if (!window.confirm("Remove this workspace from the team?")) return;
    try {
      setLoading(true);
      const response = await fetch(
        `${apiURL}/api/teams/${teamId}/workspace/remove`,
        {
          method: "PUT",
          headers: header,
          body: JSON.stringify({ workspace_id: workspaceId }),
        }
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to remove workspace from team");
      }
      await loadWorkspaces();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-2">
        <button
          className="btn btn-sm"
          onClick={() => document.getElementById("my_modal_3").showModal()}
        >
          + Add Workspace
        </button>
      </div>
      {loading ? (
        <div>
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-gray-300 h-6 w-48 mb-2 rounded"
            ></div>
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <div>No workspaces found</div>
      ) : (
        // <ul>
        <div>
          <ul className="flex flex-col gap-2 justify-stretch">
            {workspaces.map((workspace) => (
              <li key={workspace.workspace_id}>
                <div
                  title={workspace.workspace.description}
                  className="flex gap-2 items-center cursor-default border-2 border-gray-300 p-3 rounded-box hover:bg-gray-50 hover:cursor-pointer hover:border-blue-500 hover:shadow transition-all duration-150"
                  onClick={() => handleWorkspaceOpen(workspace.workspace_id)}
                >
                  {/* icon */}
                  <div className="text-3xl">{workspace.workspace.emoji}</div>
                  {/* main */}
                  <div className="flex justify-between items-center w-full">
                    <div className="border-l-1 pl-3">
                      {/* name */}
                      <div>{workspace.workspace.name}</div>
                      {/* creation date */}
                      <div className="font-bold text-sm text-gray-700">
                        Created on{" "}
                        {new Date(workspace.workspace.createdAt).toDateString()}
                      </div>

                      <div className="text-sm text-gray-700">
                        Owned by{" "}
                        <span className="hover:underline">
                          {workspace?.workspace.creator?.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        className="btn btn-secondary btn-sm text-white bg-blue-600 hover:bg-blue-500  border-none outline-none "
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWorkspaceOpen(workspace.workspace_id);
                        }}
                      >
                        Open
                      </button>
                      <button
                        className="btn btn-error btn-sm text-white bg-red-600 hover:bg-red-500 border-none outline-none"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await handleRemoveFromTeam(workspace.workspace_id);
                        }}
                      >
                        Remove from Team
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <dialog id="my_modal_3" className="modal overflow-x-scroll">
        <div className="modal-box bg-white p-4 rounded-md shadow-md sm:w-fit lg:w-1/2 mx-auto mt-10 scrollbar-hide">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <AddNew teamId={teamId} />
        </div>
      </dialog>
    </div>
  );
};

export default TeamWorkspaces;
