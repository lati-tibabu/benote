import React from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

const Overview = () => {
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
      <div className="flex-1 p-6 bg-white rounded-lg border-2 border-gray-100">
        {/* summary */}
        {/* <div className="border-1 border-black p-2 rounded-md"> */}
        <div>
          <h1 className="font-bold text-2xl text-gray-800 mb-4">
            Workspace Summary
          </h1>
          <div className="flex flex-col gap-3 text-gray-600 rounded-md">
            <div className="flex items-start gap-2">
              {/* <h3 className="text-sm font-medium text-gray-700">Name:</h3> */}
              <p className="font-bold">{workspace.name}</p>
            </div>
            {workspace.description && (
              <div className="flex items-start gap-2 text-sm bg-blue-100 rounded-l overflow-hidden">
                <p className="border-l-4 border-blue-300 pl-3 py-2">
                  {workspace.description}
                </p>
              </div>
            )}
            <div className="flex items-start gap-2">
              {/* <h3 className="text-sm font-medium text-gray-700">Created At:</h3> */}
              <p className="font-bold">
                {new Date(workspace.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
        {/* quick actions */}
        <div className="mt-8">
          <h1 className="font-semibold text-2xl text-gray-800 mb-4">
            Quick Actions
          </h1>
          {/* buttons */}
          <div className="flex flex-col gap-2">
            <button
              // className="p-2 rounded-md bg-black text-white outline-none border-none hover:bg-gray-800"
              className="p-3 bg-black text-white rounded-md shadow-md hover:bg-gray-800 transition"
              onClick={() => handleCreateNewTask(workspace.id)}
            >
              Create New Task
            </button>
            {/* <button className="p-2 rounded-md btn-secondary bg-gray-200 text-gray-800 outline-none border-none hover:bg-gray-300"> */}
            <button className="p-3 bg-gray-200 text-gray-800 rounded-md border-2 border-gray-300 hover:bg-gray-300 transition">
              Invite User
            </button>
          </div>
          {/* <button></button> */}
        </div>
        {/* notifications */}
        <div className="mt-8">
          <h1 className="font-semibold text-2xl text-gray-800 mb-4">
            Notifications
          </h1>
          <div className="space-y-2 text-gray-600">
            <li>Task D deadline approachin</li>
            <li>New comment on Task E</li>
            <li>Invitation to join Team Beta</li>
          </div>
        </div>
      </div>
      {/* left side */}
      <div className="flex-2 p-6 bg-white rounded-lg border-2 border-gray-100">
        {/* <div className="p-2 rounded-lg border-2 border-gray-100 bg-gray-600 text-white"> */}
        <div>
          <strong>Total Tasks </strong>40
        </div>
        <div className="flex-2">
          {/* tasks and deadline statuses and informations */}
          <div className="flex flex-wrap gap-2 justify-between p-2">
            <div className="grow flex flex-col items-center justify-between p-5 bg-blue-100 rounded-md shadow-md w-full sm:w-1/4">
              <h1 className="font-bold text-lg text-blue-600">Active Tasks</h1>
              <span className="text-3xl font-bold text-blue-800">10</span>
            </div>

            <div className="grow flex flex-col items-center justify-between p-5 bg-red-100 rounded-md shadow-md w-full sm:w-1/4">
              <h1 className="font-bold text-lg text-red-600">Overdue Tasks</h1>
              <span className="text-3xl font-bold text-red-800">5</span>
            </div>

            <div className="grow flex flex-col items-center justify-between p-5 bg-green-100 rounded-md shadow-md w-full sm:w-1/4">
              <h1 className="font-bold text-lg text-green-600">
                Completed Tasks
              </h1>
              <span className="text-3xl font-bold text-green-800">25</span>
            </div>
          </div>
          {/* Recent Activities */}
          <div className="mt-8 p-5 bg-gray-100 rounded-md shadow-md">
            <h1 className="font-semibold text-2xl text-gray-800 mb-4">
              Recent Activities
            </h1>
            <ul className="space-y-2 text-gray-600">
              <li>User John updated Task A</li>
              <li>User Jane completed Task B</li>
              <li>Team Alpha uploaded a file</li>
              <li>Reminder: Task C is due tomorrow</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
