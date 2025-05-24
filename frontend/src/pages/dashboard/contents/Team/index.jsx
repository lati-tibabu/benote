import React, { useEffect, useState } from "react";
import AddNew from "./add_new";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaPlus, FaUserFriends, FaTh, FaList } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { setTeamList } from "../../../../redux/slices/teamReducer";
import { toast, ToastContainer } from "react-toastify";

function Team() {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
  };

  const [teamLoading, setTeamLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // State to toggle between grid and list view
  const dispatch = useDispatch();
  const teams = useSelector((state) => state.team.teamList) || [];
  const userId = useSelector((state) => state.auth.user.id) || null;

  const location = useLocation();

  const getTeams = async () => {
    !teams.length && setTeamLoading(true);
    try {
      const response = await fetch(`${apiURL}/api/teams`, {
        method: "GET",
        headers: header,
      });

      if (!response.ok) {
        toast.error("Error fetching teams");
        return;
      }
      const data = await response.json();
      dispatch(setTeamList(data));
    } catch (error) {
      console.error(error);
    } finally {
      setTeamLoading(false);
    }
  };

  useEffect(() => {
    getTeams();
  }, [location]);

  const navigate = useNavigate();

  const handleTeamOpen = (teamId) => () => {
    navigate(`/app/team/open/${teamId}`);
  };

  const renderGridView = () => (
    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {teams.map((team) => (
        <li
          key={team.team.id}
          onClick={handleTeamOpen(team.team.id)}
          className="cursor-pointer shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div
            title={team.team.name}
            className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300"
          >
            <div className="bg-gray-100 p-4 flex justify-center items-center">
              <FaUserFriends className="text-4xl text-gray-600" />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 truncate">
                {team.team.name}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(team.team.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-2 flex justify-between items-center">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    team.role === "admin"
                      ? "bg-green-100 text-green-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {team.role === "admin" ? "Admin" : "Member"}
                </span>
                {team.team.created_by === userId && (
                  <span className="text-xs text-gray-500">Owner</span>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {team.team.members.length} Member/s
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );

  const renderListView = () => (
    <table className="w-full text-left border-collapse border border-gray-200">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-4 py-2 border border-gray-200">Name</th>
          <th className="px-4 py-2 border border-gray-200">Created At</th>
          <th className="px-4 py-2 border border-gray-200">Role</th>
          <th className="px-4 py-2 border border-gray-200">Members</th>
        </tr>
      </thead>
      <tbody>
        {teams.map((team) => (
          <tr
            key={team.team.id}
            onClick={handleTeamOpen(team.team.id)}
            className="hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <td className="px-4 py-2 border border-gray-200">
              {team.team.name}
            </td>
            <td className="px-4 py-2 border border-gray-200">
              {new Date(team.team.createdAt).toLocaleDateString()}
            </td>
            <td className="px-4 py-2 border border-gray-200">
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  team.role === "admin"
                    ? "bg-green-100 text-green-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {team.role === "admin" ? "Admin" : "Member"}
              </span>
            </td>
            <td className="px-4 py-2 border border-gray-200">
              {team.team.members.length} Member/s
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50 p-6">
      <ToastContainer />
      {location.pathname === "/app/team" ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
              onClick={() => document.getElementById("my_modal_3").showModal()}
            >
              + Create New
            </button>
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded-lg shadow ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200"
                } hover:bg-blue-700 hover:text-white transition`}
                onClick={() => setViewMode("grid")}
              >
                <FaTh />
              </button>
              <button
                className={`px-4 py-2 rounded-lg shadow ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200"
                } hover:bg-blue-700 hover:text-white transition`}
                onClick={() => setViewMode("list")}
              >
                <FaList />
              </button>
            </div>
          </div>

          {teamLoading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : teams.length > 0 ? (
            viewMode === "grid" ? renderGridView() : renderListView()
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-96">
              <h1 className="text-2xl text-gray-500">No teams Found</h1>
              <button
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                onClick={() => document.getElementById("my_modal_3").showModal()}
              >
                + Create New
              </button>
            </div>
          )}

          <dialog id="my_modal_3" className="modal">
            <div className="modal-box bg-white p-6 rounded-lg shadow-lg w-fit lg:w-1/2 mx-auto mt-10">
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

export default Team;
