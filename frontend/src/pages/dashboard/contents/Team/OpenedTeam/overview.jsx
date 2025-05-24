import React from "react";
import { useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import AddNew from "../../Workspace/add_new";
import SendInvitation from "../invite_user";

const TeamOverview = () => {
  const team = useSelector((state) => state.team.team);
  const { teamId } = useParams();

  return Object.keys(team).length === 0 ? (
    <div className="flex flex-col gap-4 p-6 min-h-full">
      <div className="h-6 w-3/4 bg-gray-300 rounded animate-pulse"></div>
      <div className="h-6 w-1/2 bg-gray-300 rounded animate-pulse"></div>
      <div className="h-6 w-3/4 bg-gray-300 rounded animate-pulse"></div>
    </div>
  ) : (
    <div className="sm:flex gap-6 p-6 bg-gray-50 rounded-lg shadow-md">
      {/* Right Side */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Team Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="font-bold text-xl mb-4">Team Summary</h1>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-600">Name:</h3>
              <p className="font-semibold text-gray-800">{team.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-600">Description:</h3>
              <p className="text-gray-800">{team.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-600">Created At:</h3>
              <p className="font-semibold text-gray-800">
                {new Date(team.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="font-bold text-xl mb-4">Quick Actions</h1>
          <div className="flex flex-col gap-4">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
              onClick={() => document.getElementById("my_modal_3").showModal()}
            >
              Create New Workspace
            </button>
            <button
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg shadow hover:bg-gray-300 transition"
              onClick={() =>
                document.getElementById("invitation_modal").showModal()
              }
            >
              Invite User
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="font-bold text-xl mb-4">Notifications</h1>
          <ul className="list-disc list-inside text-gray-800 space-y-2">
            {team.notifications?.map((notification, index) => (
              <li key={index}>{notification}</li>
            )) || <p>No notifications available.</p>}
          </ul>
        </div>
      </div>

      {/* Left Side */}
      <div className="flex-2 flex flex-col gap-6">
        {/* Task Status */}
        <div className="grid grid-cols-2 gap-4">
          {team.taskStats?.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center bg-white p-6 rounded-lg shadow"
            >
              <h1 className="font-bold text-lg text-gray-800">{stat.label}</h1>
              <span className="text-2xl font-bold text-blue-600">
                {stat.value}
              </span>
            </div>
          )) || <p>No task statistics available.</p>}
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="font-bold text-xl mb-4">Recent Activities</h1>
          <ul className="list-disc list-inside text-gray-800 space-y-2">
            {team.recentActivities?.map((activity, index) => (
              <li key={index}>{activity}</li>
            )) || <p>No recent activities available.</p>}
          </ul>
        </div>
      </div>

      {/* Modals */}
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box bg-white p-6 rounded-lg shadow-lg w-fit lg:w-1/2 mx-auto">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <AddNew teamId={teamId} />
        </div>
      </dialog>
      <dialog id="invitation_modal" className="modal">
        <div className="modal-box bg-white p-6 rounded-lg shadow-lg w-fit lg:w-1/2 mx-auto">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <SendInvitation teamName={team?.name} teamId={team?.id} />
        </div>
      </dialog>
    </div>
  );
};

export default TeamOverview;
