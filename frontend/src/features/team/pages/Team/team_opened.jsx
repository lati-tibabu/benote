import React, { useEffect } from "react";
import {
  PiSquaresFourBold,
  PiCheckCircleBold,
  PiFileTextBold,
  PiUsersThreeBold,
  PiGearBold,
  PiArrowLeftBold,
  PiDotsThreeOutlineVerticalBold,
  PiTrashBold,
  PiPencilSimpleBold,
  PiBookBold,
} from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate, useParams, useLocation } from "react-router-dom";
import { clearTeam, setTeam } from "../../../../redux/slices/teamReducer";

const TeamOpened = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const dispatch = useDispatch();
  const team = useSelector((state) => state.team.team);
  const { teamId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (teamId) {
      getTeamDetails(teamId);
    }
    // eslint-disable-next-line
  }, [teamId]);

  useEffect(() => {
    if (team) {
      navigate("overview", { state: { team } });
    }
    // eslint-disable-next-line
  }, []);

  const getTeamDetails = async (id) => {
    try {
      const response = await fetch(`${apiURL}/api/teams/${id}`, {
        method: "GET",
        headers: header,
      });
      if (!response.ok) throw new Error("Failed to fetch team");
      const data = await response.json();
      dispatch(setTeam(data));
    } catch (error) {
      console.error("Error fetching the team data", error);
    }
  };

  const handleTeamDelete = (id) => async () => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      try {
        const response = await fetch(`${apiURL}/api/teams/${id}`, {
          method: "DELETE",
          headers: {
            ...header,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          alert("Deleted");
          window.location.href = "/app/team";
          dispatch(clearTeam());
        } else {
          alert("Failed to delete");
        }
      } catch (error) {
        console.error("Failed to delete the team:", error);
        alert("Failed to delete, check the console logs");
      }
    }
  };

  const handleNavigation = (link) => () => {
    navigate(link, {
      state: { team: team },
    });
  };

  const onPage = (link) => {
    return location.pathname.endsWith(link);
  };

  return (
    <div className="h-full flex flex-col rounded-sm shadow-sm bg-gradient-to-br from-white to-gray-50 border border-gray-200">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white rounded-t-2xl">
        <button
          type="button"
          className="p-2 rounded-sm hover:bg-gray-100 transition"
          onClick={() => navigate("/app/team")}
        >
          <PiArrowLeftBold className="text-2xl text-gray-700" />
        </button>
        <div className="flex items-center gap-2">
          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              className="p-2 rounded-sm hover:bg-gray-100 transition"
            >
              <PiDotsThreeOutlineVerticalBold className="text-2xl text-gray-600" />
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-white rounded-sm shadow-sm w-40 mt-2 border border-gray-100"
            >
              <li className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                <PiPencilSimpleBold className="text-gray-500" />
                <span>Edit</span>
              </li>
              <li
                className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 cursor-pointer"
                onClick={handleTeamDelete(team?.id)}
              >
                <PiTrashBold className="text-red-500" />
                <span>Delete</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="grow flex flex-col">
        {/* Sub navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 pb-2 overflow-x-auto scrollbar-hide">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm transition cursor-pointer text-base font-medium
                ${
                  onPage(item.link)
                    ? "bg-gray-100 text-gray-700 shadow"
                    : "text-gray-500 hover:bg-gray-100"
                }
              `}
              onClick={handleNavigation(item.link)}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="grow w-full px-6 py-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default TeamOpened;

const menuItems = [
  { icon: <PiSquaresFourBold />, label: "Overview", link: "overview" },
  { icon: <PiCheckCircleBold />, label: "Workspaces", link: "workspaces" },
  { icon: <PiFileTextBold />, label: "Discussions", link: "discussions" },
  { icon: <PiBookBold />, label: "Resource", link: "resources" },
  // { icon: <PiListChecksBold />, label: "TO-DO Lists", link: "todo-lists" },
  { icon: <PiGearBold />, label: "Settings", link: "settings" },
];
