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

  const getWorkspace = async () => {
    try {
      const response = await fetch(`${apiURL}/api/workspaces`, {
        method: "GET",
        headers: header,
      });
      const data = await response.json();
      setWorkspaces(data);
      // console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getWorkspace();
  }, []);

  // console.log(workspaces);
  const location = useLocation();
  const navigate = useNavigate();

  // console.log(location.pathname);
  const handleWorkspaceOpen = (workspaceId) => () => {
    navigate(`/app/workspace/open/${workspaceId}`);
  };

  // useEffect(() => {
  //   console.log(location.pathname);
  // });
  return (
    <div className="h-full flex flex-col">
      {location.pathname == "/app/workspace" ? (
        <div>
          {workspaces.length > 0 && (
            /* Add New Workspace Button */
            <button
              className="p-1 font-bold hover:underline hover:text-blue-700 flex items-center gap-1"
              onClick={() => document.getElementById("my_modal_3").showModal()}
            >
              <AiOutlineFolderAdd className="inline-block" />
              Add New Workspace
            </button>
          )}
          <ul className="flex flex-row flex-wrap gap-4">
            {workspaces.length > 0 ? (
              workspaces.map((workspace) => (
                <li
                  className="grow"
                  key={workspace.workspace.id}
                  onClick={handleWorkspaceOpen(workspace.workspace.id)}
                >
                  <div
                    title={workspace.workspace.description}
                    className="relative flex flex-col gap-2 items-center cursor-default border-1 border-black p-3 rounded-box hover:bg-gray-50 hover:border-r-4 hover:border-b-4 hover:cursor-pointer overflow-hidden"
                    style={{
                      transition: "all 0.09s",
                    }}
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
                      {/* Icon */}
                      <div className="text-3xl text-center m-5">
                        {workspace.workspace.emoji}
                      </div>

                      {/* Main Content */}
                      <div className="border-t-1 border-black pl-3">
                        {/* Name */}
                        <div>{workspace.workspace.name}</div>

                        <div>
                          {/* role */}
                          {workspace.role}
                        </div>

                        {/* Creation Date */}
                        <div className="font-bold text-sm">
                          {new Date(
                            workspace.workspace.createdAt
                          ).toUTCString()}
                        </div>

                        {/* Private or Team */}
                        <div>
                          {/* {workspace.workspace.type.split("-")[0].toLowerCase().trim() === */}
                          {workspace.workspace.belongs_to_team ? (
                            <div className="flex items-center gap-1">
                              <div className="bg-blue-600 text-white px-1 w-fit text-xs">
                                {/* {workspace.workspace.type.split("-")[0]} */}
                                {/* {workspace.workspace.team.name} */}
                                Team
                              </div>
                              <div className="text-xs hover:underline hover:text-blue-700">
                                {/* {workspace.workspace.type.split("-")[1]} */}
                                {workspace.workspace.team.name}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-green-600 text-white px-1 w-fit text-xs">
                              {/* {workspace.type} */}
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
                <div>
                  {workspaces.length == 0 && (
                    /* Add New Workspace Button */
                    <button
                      className="p-1 font-bold hover:underline hover:text-blue-700 flex items-center gap-1"
                      onClick={() =>
                        document.getElementById("my_modal_3").showModal()
                      }
                    >
                      <FaPlus className="inline-block" size={40} />
                      Add New Workspace
                    </button>
                  )}
                </div>
              </div>
            )}
          </ul>
          {/* You can open the modal using document.getElementById('ID').showModal() method */}

          <dialog id="my_modal_3" className="modal overflow-x-scroll">
            <div className="modal-box bg-white p-4 rounded-md shadow-md sm:w-fit lg:w-1/2 mx-auto mt-10">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
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
