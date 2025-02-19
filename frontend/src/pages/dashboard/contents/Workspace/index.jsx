import React, { useEffect, useState } from "react";
import { AiOutlineFileAdd, AiOutlineFolderAdd } from "react-icons/ai";
import AddNew from "./add_new";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

function Workspace() {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
  };

  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const getWorkspace = async () => {
    try {
      const response = await fetch(`${apiURL}/api/workspaces`, {
        method: "GET",
        headers: header,
      });
      const data = await response.json();
      setWorkspaces(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false); // Handle loading state even in error
    }
  };

  useEffect(() => {
    getWorkspace();
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  const handleWorkspaceOpen = (workspaceId) => () => {
    navigate(`/app/workspace/open/${workspaceId}`);
  };

  return (
    <div className="h-full flex flex-col">
      {location.pathname === "/app/workspace" ? (
        <div>
          {workspaces.length > 0 && !loading && (
            <button
              className="p-1 font-bold hover:underline hover:text-blue-700 flex items-center gap-1"
              onClick={() => document.getElementById("my_modal_3").showModal()}
            >
              <AiOutlineFolderAdd className="inline-block" />
              Add New Workspace
            </button>
          )}

          <ul className="flex flex-row flex-wrap gap-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <li key={index} className="w-60">
                  <div className="animate-pulse flex flex-col items-center justify-center gap-3">
                    <div className="h-24 w-24 bg-gray-300 rounded-full"></div>
                    <div className="h-6 w-3/4 bg-gray-300 rounded"></div>
                    <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
                  </div>
                </li>
              ))
            ) : workspaces.length > 0 ? (
              workspaces.map((workspace) => (
                <li
                  key={workspace.workspace.id}
                  className="grow"
                  onClick={handleWorkspaceOpen(workspace.workspace.id)}
                >
                  <div
                    title={workspace.workspace.description}
                    className="relative flex flex-col gap-2 items-center cursor-pointer border-1 border-black p-3 rounded-box hover:bg-gray-50 hover:border-r-4 hover:border-b-4 overflow-hidden transition-all duration-200"
                  >
                    {/* Blurred Emoji Background */}
                    <div
                      className="absolute inset-0 filter blur-lg bg-cover bg-no-repeat bg-center opacity-30"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Ctext x='0' y='40' font-size='50'%3E${encodeURIComponent(
                          workspace.workspace.emoji
                        )}%3C/text%3E%3C/svg%3E")`,
                      }}
                    ></div>

                    {/* Foreground Content */}
                    <div className="relative z-10">
                      <div className="text-3xl text-center m-5">
                        {workspace.workspace.emoji}
                      </div>
                      <div className="border-t-1 border-black pl-3">
                        <div>{workspace.workspace.name}</div>
                        <div>{workspace.role}</div>
                        <div className="font-bold text-sm">
                          {new Date(
                            workspace.workspace.createdAt
                          ).toUTCString()}
                        </div>
                        <div>
                          {workspace.workspace.belongs_to_team ? (
                            <div className="flex items-center gap-1">
                              <div className="bg-blue-600 text-white px-1 w-fit text-xs">
                                Team
                              </div>
                              <div className="text-xs hover:underline hover:text-blue-700">
                                {workspace.workspace.team.name}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-green-600 text-white px-1 w-fit text-xs">
                              Private
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-96">
                <h1 className="text-2xl text-gray-500">No Workspaces Found</h1>
                <button
                  className="p-1 font-bold hover:underline hover:text-blue-700 flex items-center gap-1"
                  onClick={() =>
                    document.getElementById("my_modal_3").showModal()
                  }
                >
                  <FaPlus className="inline-block" size={40} />
                  Add New Workspace
                </button>
              </div>
            )}
          </ul>

          <dialog id="my_modal_3" className="modal overflow-x-scroll">
            <div className="modal-box bg-white p-4 rounded-md shadow-md sm:w-fit lg:w-1/2 mx-auto mt-10 scrollbar-hide">
              <form method="dialog">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                  ✕
                </button>
              </form>
              <AddNew />
            </div>
          </dialog>
        </div>
      ) : (
        <div className="h-full">
          <Outlet />
        </div>
      )}
    </div>
  );
}

export default Workspace;
