import React from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

const Overview = () => {
  const location2 = useLocation();
  // const workspace = location2.state?.workspace || {};
  const workspace = useSelector((state) => state.workspace.workspace);

  const navigate = useNavigate();
  // const addTask = true;
  const handleCreateNewTask = (id) => {
    navigate(`/app/workspace/open/${id}/tasks`, {
      state: { addTask: true, workspace: workspace },
    });
  };

  return Object.keys(workspace).length === 0 ? (
    <div className="flex flex-col gap-4 p-6 min-h-full">
      <div className="h-6 w-3/4 bg-gray-300 rounded animate-pulse"></div>
      <div className="h-6 w-1/2 bg-gray-300 rounded animate-pulse"></div>
      <div className="h-6 w-3/4 bg-gray-300 rounded animate-pulse"></div>
    </div>
  ) : (
    <div className="sm:flex gap-2">
      {/* right side */}
      <div className="flex-1 p-3 flex flex-col gap-5">
        {/* summary */}
        {/* <div className="border-1 border-black p-2 rounded-md"> */}
        <div>
          <h1 className="font-bold text-lg">Workspace Summary</h1>
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <h3 className="text-sm">Name:</h3>
              <p className="font-bold">{workspace.name}</p>
            </div>
            <div className="flex items-start gap-2">
              <h3 className="text-sm">Description:</h3>
              <p>{workspace.description}</p>
            </div>
            <div className="flex items-start gap-2">
              <h3 className="text-sm">Created At:</h3>
              <p className="font-bold">
                {new Date(workspace.createdAt).toUTCString().slice(0, 16)}
              </p>
            </div>
          </div>
        </div>
        {/* quick actions */}
        <div>
          <h1 className="font-bold text-lg">Quick Actions</h1>
          {/* buttons */}
          <div className="flex flex-col gap-2">
            <button
              className="p-2 rounded-md bg-black text-white outline-none border-none hover:bg-gray-800"
              onClick={() => handleCreateNewTask(workspace.id)}
            >
              Create New Task
            </button>
            <button className="p-2 rounded-md btn-secondary bg-gray-200 text-gray-800 outline-none border-none hover:bg-gray-300">
              Invite User
            </button>
          </div>
          <button></button>
        </div>
        {/* notifications */}
        <div>
          <h1 className="font-bold text-lg">Notifications</h1>
          <div>
            <li>Task D deadline approachin</li>
            <li>New comment on Task E</li>
            <li>Invitation to join Team Beta</li>
          </div>
        </div>
      </div>
      {/* left side */}
      <div className="flex-2 p-4">
        {/* tasks and deadline statuses and informations */}
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-col items-center border border-black p-2 px-5 rounded-md w-fit-content grow">
            <h1 className="font-bold">Active Tasks</h1>
            <span className="text-2xl font-bold">10</span>
          </div>

          <div className="flex flex-col items-center border border-black p-2 px-5 rounded-md w-fit-content grow">
            <h1 className="font-bold">Overdue Tasks</h1>
            <span className="text-2xl font-bold">10</span>
          </div>

          <div className="flex flex-col items-center border border-black p-2 px-5 rounded-md w-fit-content grow">
            <h1 className="font-bold">Completed Tasks</h1>
            <span className="text-2xl font-bold">10</span>
          </div>

          <div className="flex flex-col items-center border border-black p-2 px-5 rounded-md w-fit-content grow">
            <h1 className="font-bold">Completed Tasks</h1>
            <span className="text-2xl font-bold">10</span>
          </div>
        </div>
        {/* recent activities */}
        <div className="mt-5 border border-gray-300 p-2 rounded-md">
          <h1 className="font-bold text-lg">Recent Activities</h1>
          <div>
            <li>User John updated Task A </li>
            <li>User Jane completed Task B </li>
            <li>Team Alpha uploaded a file</li>
            <li>Reminder: Task C is due tomorrow</li>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
