import React, { useEffect, useState } from "react";
import AddNew from "./add_new";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaUserFriends } from "react-icons/fa";
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
  const dispatch = useDispatch();
  const teams = useSelector((state) => state.team.teamList) || [];
  const userId = useSelector((state) => state.auth.user.id) || null;

  const location = useLocation();
  const navigate = useNavigate();

  const selectedTeamId =
    location.pathname.match(/^\/app\/team\/open\/([^/]+)/)?.[1] || null;

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

  useEffect(() => {
    if (location.pathname === "/app/team" && teams.length > 0) {
      navigate(`/app/team/open/${teams[0].team.id}/discussions`, {
        replace: true,
      });
    }
  }, [location.pathname, navigate, teams]);

  const handleTeamOpen = (teamId) => () => {
    navigate(`/app/team/open/${teamId}/discussions`);
  };

  return (
    <div className="h-full min-h-0 overflow-hidden bg-gray-50 p-4 sm:p-6">
      <ToastContainer />
      <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="flex h-full min-h-0 flex-col rounded-sm border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Teams</h2>
              <p className="text-xs text-gray-500">Select a team or create one</p>
            </div>
            <button
              className="rounded-sm bg-gray-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
              onClick={() => document.getElementById("my_modal_3").showModal()}
            >
              + New
            </button>
          </div>

          <div className="grow overflow-y-auto p-2">
            {teamLoading ? (
              <p className="px-3 py-4 text-sm text-gray-500">Loading teams...</p>
            ) : teams.length > 0 ? (
              <ul className="space-y-2">
                {teams.map((team) => {
                  const isActive = String(team.team.id) === selectedTeamId;
                  return (
                    <li key={team.team.id}>
                      <button
                        type="button"
                        onClick={handleTeamOpen(team.team.id)}
                        className={`w-full rounded-sm border p-3 text-left transition ${
                          isActive
                            ? "border-gray-700 bg-gray-100"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-sm bg-gray-100 p-2 text-gray-600">
                            <FaUserFriends />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-800">
                              {team.team.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {team.role === "admin" ? "Admin" : "Member"} - {team.team.members.length} member
                              {team.team.members.length > 1 ? "s" : ""}
                            </p>
                            {team.team.created_by === userId && (
                              <span className="mt-2 inline-block rounded-sm bg-gray-200 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                                Owner
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-3 py-6 text-center">
                <p className="text-sm text-gray-500">No teams yet.</p>
                <button
                  className="mt-3 rounded-sm bg-gray-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                  onClick={() => document.getElementById("my_modal_3").showModal()}
                >
                  + Create your first team
                </button>
              </div>
            )}
          </div>
        </aside>

        <section className="h-full min-h-0 rounded-sm border border-gray-200 bg-white shadow-sm">
          {location.pathname === "/app/team" && !teams.length && !teamLoading ? (
            <div className="flex h-full items-center justify-center p-6">
              <p className="text-center text-gray-500">
                Create a team from the left panel to start discussions and collaboration.
              </p>
            </div>
          ) : (
            <div className="h-full min-h-0 overflow-hidden p-4 sm:p-6">
              <Outlet />
            </div>
          )}
        </section>
      </div>

      <dialog id="my_modal_3" className="modal">
        <div className="modal-box mx-auto mt-10 w-fit rounded-sm bg-white p-6 shadow-sm lg:w-1/2">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">x</button>
          </form>
          <AddNew />
        </div>
      </dialog>
    </div>
  );
}

export default Team;
