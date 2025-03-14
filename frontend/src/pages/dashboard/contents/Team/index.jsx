import React, { useEffect, useState } from "react";
import { AiOutlineFolderAdd } from "react-icons/ai";
import AddNew from "./add_new";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaPlus, FaUserFriends } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

function Team() {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
  };

  const [teams, setTeams] = useState([]);
  const [userId, setUserId] = useState(null);

  const getTeams = async () => {
    try {
      const response = await fetch(`${apiURL}/api/teams`, {
        method: "GET",
        headers: header,
      });
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getTeams();
  }, []);

  //fetching currently logged in user id from the jwt token
  useEffect(() => {
    try {
      if (token) {
        const data = jwtDecode(token);
        setUserId(data.id);
      } else {
        console.log("token not found");
      }
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  const location = useLocation();
  const navigate = useNavigate();

  // console.log(location.pathname);

  const handleTeamOpen = (teamId) => () => {
    navigate(`/app/team/open/${teamId}`);
  };

  return (
    <div className="h-full flex flex-col">
      {location.pathname == "/app/team" ? (
        <div>
          {teams.length > 0 && (
            /* Add New team Button */
            <button
              // className="p-1 font-bold hover:underline hover:text-blue-700 flex items-center gap-1"
              className="btn btn-soft rounded-full mb-2"
              onClick={() => document.getElementById("my_modal_3").showModal()}
            >
              <AiOutlineFolderAdd className="inline-block" />
              Add New team
            </button>
          )}
          <ul className="flex flex-row flex-wrap gap-3">
            {teams.length > 0 ? (
              teams.map((team) => (
                <li
                  key={team.team.id}
                  onClick={handleTeamOpen(team.team.id)}
                  className="cursor-pointer"
                >
                  <div
                    title={team.team.name}
                    className="bg-gray-200 flex flex-row gap-2 items-center hover:bg-slate-300 w-fit rounded-box p-10"
                    style={{
                      transition: "all 0.09s",
                    }}
                  >
                    {/* Icon */}
                    <div className="text-3xl text-center m-5 border-2 border-gray-600 p-2 rounded-full">
                      <FaUserFriends />
                    </div>
                    {/* Main Content */}
                    <div className="border-black pl-3">
                      {/* Name */}
                      <div>{team.team.name}</div>
                      {/* Creation Date */}
                      <div className="font-bold text-sm">
                        {new Date(team.team.createdAt)
                          .toUTCString()
                          .slice(0, 16)}
                      </div>
                      {/* Role */}
                      <div className="font-bold text-sm flex justify-between w-full ">
                        {team.role == "admin" ? (
                          <span className="text-green-500">Admin</span>
                        ) : (
                          <span className="text-blue-500">Member</span>
                        )}

                        {team.team.created_by == userId && (
                          <span className="text-gray-600">Owner</span>
                        )}
                      </div>
                      {/* Members */}
                      <div>
                        <span className="text-gray-500">
                          {team.team.members.length} Member/s
                        </span>
                      </div>
                    </div>
                    {/* </div> */}
                  </div>
                </li>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-96">
                <h1 className="text-2xl text-gray-500">No teams Found</h1>
                <div>
                  {teams.length == 0 && (
                    /* Add New team Button */
                    <button
                      className="p-1 font-bold hover:underline hover:text-blue-700 flex items-center gap-1"
                      onClick={() =>
                        document.getElementById("my_modal_3").showModal()
                      }
                    >
                      <FaPlus className="inline-block" size={40} />
                      Add New team
                    </button>
                  )}
                </div>
              </div>
            )}
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
        <div className="h-full">
          <Outlet />
        </div>
      )}
    </div>
  );
}

export default Team;
