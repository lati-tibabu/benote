import React, { useEffect, useState } from "react";
import {
  AiOutlineBlock,
  AiOutlineMore,
  AiOutlineCheckCircle,
  AiOutlineFileText,
  AiOutlineTeam,
  AiOutlineCalendar,
  AiOutlineSetting,
  AiOutlineOrderedList,
  AiOutlineBook,
} from "react-icons/ai";
import { FaChevronLeft } from "react-icons/fa";
import { Outlet, useNavigate, useParams } from "react-router-dom";

const WorkspaceOpened = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const { workspaceId } = useParams();

  const [workspace, setWorkspace] = useState({});

  const getWorkspaceDetails = async (id) => {
    const response = await fetch(`${apiURL}/api/workspaces/${id}`, {
      method: "GET",
      headers: header,
    });
    const data = await response.json();
    setWorkspace(data);
  };

  const menuItems = [
    { icon: <AiOutlineBlock />, label: "Overview", link: "overview" },
    // { icon: <AiOutlineBook />, label: "Projects", link: "projects" },
    { icon: <AiOutlineCheckCircle />, label: "Tasks", link: "tasks" },
    {
      icon: <AiOutlineOrderedList />,
      label: "TO-DO Lists",
      link: "todo-lists",
    },
    { icon: <AiOutlineFileText />, label: "Notes", link: "notes" },
    { icon: <AiOutlineTeam />, label: "Teams", link: "teams" },
    { icon: <AiOutlineCalendar />, label: "Study Plan", link: "study-plans" },
    { icon: <AiOutlineSetting />, label: "Settings", link: "settings" },
  ];

  useEffect(() => {
    getWorkspaceDetails(workspaceId);
  }, []);

  const handleWorkspaceDelete = (id) => async () => {
    if (window.confirm("Are you sure you want to delete this workspace?")) {
      try {
        const response = await fetch(`${apiURL}/api/workspaces/${id}`, {
          method: "DELETE",
          // headers: {
          //   ...header,
          //   "Content-Type": "application/json",
          // },
          headers: header,
        });
        // console.log(response);
        if (response.ok) {
          alert("Deleted");
          window.location.href = "/app/workspace";
        } else {
          alert("Failed to delete");
        }
      } catch (error) {
        console.error("Failed to delete the workspace:", error);
        alert("Failed to delete, check the console logs");
      }
    }
  };

  const navigate = useNavigate();
  const handleNavigation = (link) => () => {
    // navigate(`${location.pathname}/${link}`);
    navigate(link, {
      state: { workspace: workspace },
    });
  };

  const onPage = (link) => {
    return location.pathname.endsWith(link);
  };

  useEffect(() => {
    if (workspace) {
      navigate("overview", { state: { workspace } });
    }
  }, [workspace]);
  return (
    <div className="h-full flex flex-col justify-between rounded-md shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-3 rounded-full m-2"
            onClick={() => {
              navigate("/app/workspace");
            }}
          >
            <FaChevronLeft />
          </button>
          <span className="flex items-center gap-2">
            <h1 className="text-2xl">{workspace.emoji}</h1>
            <h1 className="text-2xl font-bold">{workspace.name}</h1>
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
                onClick={handleWorkspaceDelete(workspace.id)}
              >
                Delete
              </li>
            </ul>
          </div>
        </button>
      </div>

      <div className="grow flex flex-col">
        {/* sub navigation */}
        <div className="bg-gray-100 rounded-md shadow-sm p-2">
          <div className="flex items-center gap-4 px-2 pt-2 overflow-scroll scrollbar-hide">
            {menuItems.map((items, index) => (
              <div
                key={index}
                className={`flex items-center py-1 px-3 gap-1 border-b-2 hover:border-blue-500 cursor-pointer ${
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
        {/* <div className="flex items-center gap-2 p-2 border-y-1 border-gray-300"></div> */}
        {/* contents */}
        <div className="grow w-full">
          <Outlet />
        </div>
      </div>
      {/* <h1>{workspace.description}</h1> */}
    </div>
  );
};

export default WorkspaceOpened;
