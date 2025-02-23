import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Outlet } from "react-router-dom";
import { setWorkspace } from "../../../../redux/slices/workspaceSlice";
import {
  AiOutlineBlock,
  AiOutlineMore,
  AiOutlineCheckCircle,
  AiOutlineFileText,
  AiOutlineTeam,
  AiOutlineCalendar,
  AiOutlineSetting,
  AiOutlineOrderedList,
} from "react-icons/ai";
import { FaChevronLeft } from "react-icons/fa";

const WorkspaceOpened = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const dispatch = useDispatch();
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  // Get workspace from Redux store
  const workspace = useSelector((state) => state.workspace.workspace);

  const getWorkspaceDetails = async (id) => {
    try {
      const response = await fetch(`${apiURL}/api/workspaces/${id}`, {
        method: "GET",
        headers: header,
      });
      if (!response.ok) throw new Error("Failed to fetch workspace");

      const data = await response.json();
      dispatch(setWorkspace(data)); // Store in Redux
    } catch (error) {
      console.error("Error fetching workspace:", error);
    }
  };

  useEffect(() => {
    if (workspaceId) getWorkspaceDetails(workspaceId);
  }, [workspaceId]);

  useEffect(() => {
    if (workspace?.id) {
      navigate("overview");
    }
  }, [workspace]);

  const handleWorkspaceDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this workspace?"))
      return;

    try {
      const response = await fetch(`${apiURL}/api/workspaces/${workspace.id}`, {
        method: "DELETE",
        headers: header,
      });
      if (!response.ok) throw new Error("Failed to delete");

      alert("Workspace deleted");
      navigate("/app/workspace", { state: { workspaceUpdate: true } });
    } catch (error) {
      console.error("Error deleting workspace:", error);
      alert("Failed to delete workspace");
    }
  };

  // const handleNavigation = (link) => () =>
  //   navigate(link, { state: { workspace } });

  return (
    <div className="h-full flex flex-col justify-between rounded-md shadow-sm">
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full m-2 bg-gray-100 p-2 hover:bg-gray-200"
            onClick={() => navigate("/app/workspace")}
          >
            <FaChevronLeft />
          </button>
          {/* <span className="flex items-center gap-2">
            <h1 className="text-2xl">{workspace?.emoji}</h1>
            <h1 className="text-2xl font-bold">{workspace?.name}</h1>
          </span> */}
        </div>
        {/* <button> */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="m-1">
            <AiOutlineMore size={30} />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 dark:bg-gray-100 rounded-md w-fit"
          >
            <li className="hover:text-blue-500">
              <button>Edit</button>
            </li>
            <li className="hover:text-red-500">
              <button onClick={handleWorkspaceDelete}>Delete</button>
            </li>
          </ul>
        </div>

        {/* </button> */}
      </div>

      <div className="grow flex flex-col">
        {/* <div className="bg-gray-100 rounded-md shadow-sm p-2">
          <div className="flex items-center gap-4 px-2 pt-2 overflow-scroll scrollbar-hide">
            {menuItems.map(({ icon, label, link }, index) => (
              <div
                key={index}
                className={`flex items-center py-1 px-3 gap-1 border-b-2 hover:border-blue-500 cursor-pointer 
                  ${
                    location.pathname.endsWith(link)
                      ? "border-blue-500 text-black font-bold"
                      : "text-gray-500"
                  }`}
                onClick={handleNavigation(link)}
              >
                <span className="text-xl">{icon}</span>
                <p className="text-sm text-nowrap">{label}</p>
              </div>
            ))}
          </div>
        </div> */}

        <div className="grow w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default WorkspaceOpened;

// const menuItems = [
//   { icon: <AiOutlineBlock />, label: "Overview", link: "overview" },
//   { icon: <AiOutlineCheckCircle />, label: "Tasks", link: "tasks" },
//   { icon: <AiOutlineOrderedList />, label: "TO-DO Lists", link: "todo-lists" },
//   { icon: <AiOutlineFileText />, label: "Notes", link: "notes" },
//   { icon: <AiOutlineTeam />, label: "Teams", link: "teams" },
//   { icon: <AiOutlineCalendar />, label: "Study Plan", link: "study-plans" },
//   { icon: <AiOutlineSetting />, label: "Settings", link: "settings" },
// ];
