import React, { useEffect, useState } from "react";
import {
  AiOutlineFileAdd,
  AiOutlineFolder,
  AiOutlineFolderAdd,
} from "react-icons/ai";
import AddNew from "./add_new";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

function Workspace() {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");

  const header = {
    authorization: `Bearer ${token}`,
  };

  const [workspaces, setWorkspaces] = useState([]);

  const getWorkspace = async () => {
    const response = await fetch(`${apiURL}/api/workspaces`, {
      method: "GET",
      headers: header,
    });
    const data = await response.json();
    setWorkspaces(data);
    // console.log(data);
  };

  useEffect(() => {
    getWorkspace();
  }, []);

  // console.log(workspaces);
  const location = useLocation();
  const navigate = useNavigate();

  console.log(location.pathname);

  const handleWorkspaceOpen = (workspaceId) => () => {
    navigate("/app/workspace/open/" + workspaceId);
  };

  return (
    <div>
      {location.pathname === "/app/workspace" ? (
        <div>
          <button
            className="p-1 font-bold hover:underline hover:text-blue-700 flex items-center gap-1"
            onClick={() => document.getElementById("my_modal_3").showModal()}
          >
            <AiOutlineFolderAdd className="inline-block" />
            Add New Workspace
          </button>
          <ul className="flex flex-row flex-wrap gap-4">
            {workspaces.map((workspace) => (
              <li
                className="grow"
                key={workspace.name}
                onClick={handleWorkspaceOpen(workspace.id)}
              >
                <div
                  title={workspace.description}
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
                        workspace.emoji
                      )}%3C/text%3E%3C/svg%3E")`,
                    }}
                  ></div>

                  {/* Foreground Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="text-3xl text-center m-5">
                      {workspace.emoji}
                    </div>

                    {/* Main Content */}
                    <div className="border-t-1 border-black pl-3">
                      {/* Name */}
                      <div>{workspace.name}</div>

                      {/* Creation Date */}
                      <div className="font-bold text-sm">
                        {new Date(workspace.createdAt).toUTCString()}
                      </div>

                      {/* Private or Team */}
                      <div>
                        {/* {workspace.type.split("-")[0].toLowerCase().trim() === */}
                        {workspace.belongs_to_team ? (
                          <div className="flex items-center gap-1">
                            <div className="bg-blue-600 text-white px-1 w-fit text-xs">
                              {/* {workspace.type.split("-")[0]} */}
                              {/* {workspace.team.name} */}
                              Team
                            </div>
                            <div className="text-xs hover:underline hover:text-blue-700">
                              {/* {workspace.type.split("-")[1]} */}
                              {workspace.team.name}
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
            ))}
          </ul>
          {/* You can open the modal using document.getElementById('ID').showModal() method */}

          <dialog id="my_modal_3" className="modal">
            <div className="modal-box bg-white p-4 rounded-md shadow-md w-fit lg:w-1/2 mx-auto mt-10">
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
        <div>
          <Outlet />
        </div>
      )}
    </div>
  );
}

export default Workspace;
