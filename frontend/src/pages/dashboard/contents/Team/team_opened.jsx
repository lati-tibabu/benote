import React, { useEffect, useState } from "react";
import {
  AiOutlineBlock,
  AiOutlineMore,
  AiOutlineCheckCircle,
  AiOutlineFileText,
  AiOutlineTeam,
  AiOutlineSetting,
  AiOutlineOrderedList,
} from "react-icons/ai";
import { FaChevronLeft } from "react-icons/fa";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

const TeamOpened = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const location2 = useLocation();

  const { teamId } = useParams();
  const [team, setTeam] = useState({});

  const menuItems = [
    { icon: <AiOutlineBlock />, label: "Overview", link: "overview" },
    { icon: <AiOutlineCheckCircle />, label: "Workspaces", link: "workspaces" },
    { icon: <AiOutlineFileText />, label: "Discussions", link: "discussions" },
    { icon: <AiOutlineTeam />, label: "Resource", link: "resources" },
    {
      icon: <AiOutlineOrderedList />,
      label: "TO-DO Lists",
      link: "todo-lists",
    },
    { icon: <AiOutlineSetting />, label: "Settings", link: "settings" },
  ];

  useEffect(() => {
    if (teamId) {
      getTeamDetails(teamId);
    }
  }, [teamId]);

  useEffect(() => {
    if (team) {
      navigate("overview", { state: { team } });
    }
  }, [team]);

  const getTeamDetails = async (id) => {
    try {
      const response = await fetch(`${apiURL}/api/teams/${id}`, {
        method: "GET",
        headers: header,
      });
      const data = await response.json();
      setTeam(data);
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
        } else {
          alert("Failed to delete");
        }
      } catch (error) {
        console.error("Failed to delete the team:", error);
        alert("Failed to delete, check the console logs");
      }
    }
  };

  const navigate = useNavigate();

  const handleNavigation = (link) => () => {
    navigate(link, {
      state: { team: team },
    });
  };

  const onPage = (link) => {
    return location.pathname.endsWith(link);
  };

  // console.log(location2.pathname);
  // useEffect(() => {
  //   navigate("overview", {
  //     state: { team: team },
  //   });
  // }, []);

  return (
    <div className="h-full flex flex-col justify-between rounded-md shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-3 rounded-full m-2"
            onClick={() => {
              navigate("/app/team");
            }}
          >
            <FaChevronLeft />
          </button>
          <span className="flex items-center gap-2">
            <h1 className="text-2xl">{team.emoji}</h1>
            <h1 className="text-2xl font-bold">{team.name}</h1>
          </span>
        </div>
        <button>
          <div className="dropdown">
            <AiOutlineMore
              size={30}
              role="button"
              tabIndex={0}
              className="m-1"
            />
            <ul
              tabIndex={0}
              className="dropdown-content menu dark:bg-gray-100 bg-base-100 rounded-md w-fit p-2 shadow-lg text-left right-0"
            >
              <li className="p-3 hover:text-blue-500">Edit</li>
              <li
                className="p-3 hover:text-red-500"
                onClick={handleTeamDelete(team.id)}
              >
                Delete
              </li>
            </ul>
          </div>
        </button>
      </div>

      <div className="grow flex flex-col">
        {/* sub navigation */}
        <div>
          <div className="flex items-center gap-4 px-2 pt-2 overflow-scroll">
            {menuItems.map((items, index) => (
              <div
                key={index}
                className={`flex items-center py-1 px-3 gap-1 border-b-2 border-transparent hover:border-blue-500 cursor-pointer ${
                  onPage(items.link)
                    ? "border-blue-500 text-black font-bold"
                    : "text-gray-500 "
                }`}
                onClick={handleNavigation(items.link)}
              >
                <span className="text-xl">{items.icon}</span>
                <p className="text-sm">{items.label}</p>
              </div>
            ))}
            {/* continue with Tasks, TO DO lists, Notes, Teams, Study Plan, and Setting */}
          </div>
        </div>
        {/* actions for sub navigated page like sorting, sharing... */}
        <div className="flex items-center gap-2 p-2 border-y-1 border-gray-300"></div>
        {/* contents */}
        <div className="grow w-full">
          <Outlet />
        </div>
      </div>
      {/* <h1>{team.description}</h1> */}
    </div>
  );
};

export default TeamOpened;
