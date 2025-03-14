import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const TeamWorkspaces = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const team = useSelector((state) => state.team.team);

  const loadWorkspaces = async () => {
    try {
      const response = await fetch(`${apiURL}/api/workspaces/${team.id}/team`, {
        method: "GET",
        headers: header,
      });
      if (!response.ok)
        throw new Error("Error fetching workspace for the team");

      const data = await response.json();
      setWorkspaces(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (team.id) {
      loadWorkspaces();
    }
  }, [team]);

  // console.log(workspaces);

  const navigate = useNavigate();
  const handleWorkspaceOpen = (workspaceId) => {
    // alert(`opening ${workspaceId}`);
    navigate(`/app/workspace/open/${workspaceId}`);
  };

  return (
    <div className="p-4">
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
              <li>
                <div
                  title={workspace.workspace.description}
                  className="flex gap-2 items-center cursor-default border-1 border-black p-3 rounded-box hover:bg-gray-50 hover:border-r-4 hover:border-b-4 hover:cursor-pointer"
                  onClick={() => handleWorkspaceOpen(workspace.workspace_id)}
                  key={workspace.workspace_id}
                >
                  {/* icon */}
                  <div className="text-3xl">{workspace.workspace.emoji}</div>
                  {/* main */}
                  <div className="border-l-1 pl-3">
                    {/* name */}
                    <div>{workspace.workspace.name}</div>
                    {/* creation date */}
                    <div className="font-bold text-sm">
                      {new Date(workspace.workspace.createdAt).toDateString()}
                    </div>
                    {/* private or team */}
                    {/* <div>
                          {workspace.type.split("-")[0].toLowerCase().trim() ===
                          "team" ? (
                            <div className="flex items-center gap-1">
                              <div className="bg-blue-600 text-white px-1 w-fit text-xs">
                                {workspace.type.split("-")[0]}
                              </div>
                              <div className="text-xs hover:underline hover:text-blue-700">
                                {workspace.type.split("-")[1]}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-green-600 text-white px-1 w-fit text-xs">
                              {workspace.type}
                            </div>
                          )}
                        </div> */}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TeamWorkspaces;
