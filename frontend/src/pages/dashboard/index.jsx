import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AiOutlineHome,
  AiOutlineUnorderedList,
  AiOutlineTeam,
  AiOutlineUser,
  AiOutlineNotification,
  AiOutlineSetting,
  AiOutlineDown,
  AiOutlineRight,
  AiOutlineBlock,
  AiOutlineCheckCircle,
  AiOutlineOrderedList,
  AiOutlineFileText,
  AiOutlineCalendar,
} from "react-icons/ai";
import { HiMenu, HiX } from "react-icons/hi";
import Footer1 from "../../components/_footers/footer1";
import { jwtDecode } from "jwt-decode";
import { useSelector } from "react-redux";

function Dashboard() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null); // Track open submenu
  const location = useLocation();
  const navigate = useNavigate();

  const workspaceTitle =
    useSelector((state) => state.workspace.workspace.name) || "Workspace";

  const teamTitle = useSelector((state) => state.team.team.name) || "Team";

  const workspaceEmoji =
    useSelector((state) => state.workspace.workspace.emoji) || "";

  const token = localStorage.getItem("jwt");
  let userData = null;
  if (token) {
    try {
      userData = jwtDecode(token);
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  const loc = location.pathname.split("/").slice(2);
  // console.log("location", loc[0]);

  // const navigationLoc = location.pathname.split("/").slice(2);

  // console.log("location", loc);

  const handleNavigation = (link, workspaceId) => () => {
    navigate(`/app/workspace/open/${workspaceId}/${link}`);
  };

  // const onPage = (link) => {
  //   return location.pathname.endsWith(link);
  // };
  const onPage = (link) => location.pathname.includes(link);

  // checking location for whether to open submenu or not depending on which page we are or user is currently at

  // const location

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("jwt_expiration");
    navigate("/auth/login");
  };

  return (
    <div className="bg-white text-black min-h-screen flex flex-col">
      {/* Top */}
      <div className="bg-gray-200 w-full min-h-screen flex-1 flex flex-col sm:flex-row overflow-x-scroll">
        {/* Sidebar or navigtion bar or column*/}
        <div className="w-full sm:w-64 p-6 shadow bg-white border-black sm:relative z-10 backdrop-blur-2xl transition-all duration-300 overflow-x-hidden">
          {/* Logo */}
          <div className="flex items-center justify-between sm:justify-start mb-6">
            <div className="flex gap-2 text-xs font-bold items-center">
              <img src="/rect19.png" alt="Logo" className="h-12 w-auto" />
              <span>Student Productivity Hub</span>
            </div>
            <button
              onClick={toggleMobileNav}
              className="sm:hidden focus:outline-none text-gray-600"
            >
              {isMobileNavOpen ? <HiX size={28} /> : <HiMenu size={28} />}
            </button>
          </div>
          <hr className="hidden md:block h-1/2 rounded-md bg-gray-800" />

          {/* Navigation */}
          <div className={`${isMobileNavOpen ? "block" : "hidden"} sm:block`}>
            <div className="flex flex-col space-y-2 my-2">
              <Link
                to="home"
                className={`flex items-center space-x-2 hover:text-blue-500 p-1 ${
                  loc[0] === "home"
                    ? "font-bold bg-blue-100 text-blue-800 rounded"
                    : "text-gray-800"
                }`}
                onClick={() => setIsMobileNavOpen(false)}
              >
                <AiOutlineHome size={20} />
                <span>Home</span>
              </Link>

              {/* Workspace with Submenu */}
              <div className="flex flex-col space-y-2">
                <button
                  className={`flex items-center space-x-2 hover:text-blue-500 p-1 ${
                    loc[0] === "workspace"
                      ? "font-bold bg-blue-100 text-blue-800 rounded"
                      : "text-gray-800"
                  }`}
                  onClick={() => setIsMobileNavOpen(false)}
                  // onClick={() => toggleSubmenu("workspace")}
                >
                  <Link to="workspace">
                    <div className="flex items-center space-x-2">
                      <AiOutlineUnorderedList size={20} />
                      <span>Workspace</span>
                    </div>
                  </Link>

                  {/* {loc[1] === "open" &&
                    (openSubmenu === "workspace" ? (
                      <AiOutlineDown />
                    ) : (
                      <AiOutlineRight />
                    ))} */}
                </button>
                {loc[1] === "open" && loc[0] === "workspace" && (
                  <div className="pl-6 mt-2 space-y-2">
                    {workspaceSubMenus.map((items, index) => (
                      <div
                        key={index}
                        className={`flex items-center py-1 px-3 gap-1  hover:border-blue-500 cursor-pointer ${
                          onPage(items.link)
                            ? "border-b-2 border-blue-500 text-black font-bold"
                            : "text-gray-900 "
                        }`}
                        onClick={handleNavigation(items.link, loc[2])}
                      >
                        <span className="text-xl">{items.icon}</span>
                        <p className="text-sm text-nowrap">{items.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="team"
                className={`flex items-center space-x-2 hover:text-blue-500 p-1 ${
                  loc[0] === "team"
                    ? "font-bold bg-blue-100 text-blue-800 rounded"
                    : "text-gray-800"
                }`}
                onClick={() => setIsMobileNavOpen(false)}
              >
                <AiOutlineTeam size={20} />
                <span>Teams</span>
              </Link>
            </div>
            <hr />

            {/* Profile and Settings */}
            <div className="flex flex-col space-y-2 my-5">
              <Link
                to="profile"
                className={`flex items-center space-x-2 hover:text-blue-500 p-1 ${
                  loc[0] === "profile"
                    ? "font-bold bg-blue-100 text-blue-800 rounded"
                    : "text-gray-800"
                }`}
                onClick={() => setIsMobileNavOpen(false)}
              >
                <AiOutlineUser size={20} />
                <span>Profile</span>
              </Link>
              <Link
                to="notification"
                className={`flex items-center space-x-2 hover:text-blue-500 p-1 ${
                  loc[0] === "notification"
                    ? "font-bold bg-blue-100 text-blue-800 rounded"
                    : "text-gray-800"
                }`}
                onClick={() => setIsMobileNavOpen(false)}
              >
                <AiOutlineNotification size={20} />
                <span>Notification</span>
              </Link>
              <Link
                to="setting"
                className={`flex items-center space-x-2 hover:text-blue-500 p-1 ${
                  loc[0] === "setting"
                    ? "font-bold bg-blue-100 text-blue-800 rounded"
                    : "text-gray-800"
                }`}
                onClick={() => setIsMobileNavOpen(false)}
              >
                <AiOutlineSetting size={20} />
                <span>Setting</span>
              </Link>
            </div>

            <div className="flex lg:hidden md:hidden dropdown dropdown-end items-center gap-2 p-1 rounded shadow-md">
              <div className="flex flex-row-reverse items-center  gap-2">
                <strong className="text-black font-bold" tabIndex={0}>
                  {userData?.email.split("@")[0]}
                </strong>
                <label className="cursor-pointer">
                  <AiOutlineUser size={30} className="text-black" />
                </label>
              </div>
              <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 text-white">
                <li>
                  <button
                    className="flex items-center gap-2"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full flex flex-col overflow-x-hidden">
          <div className="w-full p-2 flex items-center justify-between bg-white border-b-1">
            <div className="flex items-center gap-2">
              <div className="font-bold text-2xl">
                {loc[0]
                  ? loc[0].charAt(0).toUpperCase() + loc[0].slice(1)
                  : "Dashboard"}
              </div>
              {loc[0] === "workspace" &&
              loc[1] === "open" &&
              workspaceTitle &&
              workspaceEmoji ? (
                <>
                  <div className="text-gray-500">|</div>
                  <div className="text-lg lg:text-2xl md:text-xl text-black flex items-center gap-2 text-nowrap overflow-hidden">
                    {workspaceEmoji}
                    {workspaceTitle}
                  </div>
                </>
              ) : loc[0] === "team" && loc[1] === "open" && teamTitle ? (
                <>
                  <div className="text-gray-500">|</div>
                  <div className="text-lg lg:text-2xl md:text-xl text-black flex items-center gap-2 text-nowrap overflow-hidden">
                    {teamTitle}
                  </div>
                </>
              ) : null}
            </div>

            {/* Profile & Logout */}
            <div className="hidden lg:flex md:flex dropdown dropdown-end items-center gap-2">
              <strong className="text-black font-bold">
                {userData?.email.split("@")[0]}
              </strong>
              <label tabIndex={0} className="cursor-pointer">
                <AiOutlineUser size={30} className="text-black" />
              </label>
              <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 text-white">
                <li>
                  <button
                    className="flex items-center gap-2"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
          {/* Main Content */}
          <div className="flex-1 p-6 pt-1 bg-white">
            <div className="h-full">
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white text-white mt-auto border-t-2 border-black">
        <Footer1 />
      </div>
    </div>
  );
}

export default Dashboard;

const workspaceSubMenus = [
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
