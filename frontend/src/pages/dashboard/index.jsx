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
  AiFillInfoCircle,
  AiOutlinePoweroff,
  AiOutlineLeft,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlineStar,
  AiOutlineSun,
  AiOutlineMoon,
} from "react-icons/ai";
import { HiMenu, HiX } from "react-icons/hi";
import Footer1 from "../../components/_footers/footer1";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
// const crypto = require("crypto");
import { SHA256 } from "crypto-js";
import {
  FaChalkboardTeacher,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { FaBolt, FaMoon, FaStop, FaSun } from "react-icons/fa6";
import {
  GiArtificialIntelligence,
  GiSparkles,
  GiStarStruck,
} from "react-icons/gi";
import { stopAlarm } from "../../redux/slices/pomodoroSlice";
import { setTheme, toggleTheme } from "../../redux/slices/themeSlice";
import { clearAuthenticatedUser } from "../../redux/slices/authSlice";
import GeminiIcon from "../../components/geminiIcon";

function Dashboard() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const workspaceTitle =
    useSelector((state) => state.workspace.workspace.name) || "Workspace";

  const teamTitle = useSelector((state) => state.team.team.name) || "Team";

  const workspaceEmoji =
    useSelector((state) => state.workspace.workspace.emoji) || "";

  const userData = useSelector((state) => state.auth.user) || {};

  const loc = location.pathname.split("/").slice(2);

  const [collapsedNav, setCollapsedBar] = useState(false);

  const handleNavigation = (link, workspaceId) => () => {
    navigate(`/app/workspace/open/${workspaceId}/${link}`);
  };

  const onPage = (link) => location.pathname.includes(link);

  // checking location for whether to open submenu or not depending on which page we are or user is currently at

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("jwt_expiration");
    dispatch(clearAuthenticatedUser());
    navigate("/auth/login");
  };
  const email = userData?.email;

  const getGravatarHash = (email) => {
    return SHA256(email.trim().toLowerCase()).toString();
  };

  const handleCollapseBar = () => {
    setCollapsedBar((prev) => !prev);
  };

  const dispatch = useDispatch();
  const { alarmPlaying } = useSelector((state) => state.pomodoro);

  const theme = useSelector((state) => state.theme.theme);

  return (
    <div className="bg-white text-black min-h-screen flex flex-col">
      {/* Top */}
      <div className="bg-gray-200 w-full min-h-screen flex-1 flex flex-col sm:flex-row overflow-x-scroll scrollbar-hide">
        {/* Sidebar or navigtion bar or column*/}
        <div
          className={`w-full ${
            collapsedNav ? "sm:w-20" : "sm:w-64"
          } p-6 shadow bg-white border-black sm:relative z-10 backdrop-blur-2xl transition-all duration-300 overflow-x-hidden scrollbar-hide`}
        >
          {/* Logo */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2 text-xs font-bold items-center">
              <img src="/rect19.png" alt="Logo" className="h-12 w-auto" />
              {/* <span>Student Productivity Hub</span> */}
            </div>
            <button
              onClick={toggleMobileNav}
              className="sm:hidden focus:outline-none text-gray-600"
            >
              {isMobileNavOpen ? <HiX size={28} /> : <HiMenu size={28} />}
            </button>
            <div
              className="hidden sm:block p-3 hover:bg-gray-200 rounded-full cursor-pointer"
              onClick={handleCollapseBar}
            >
              {collapsedNav ? <FaChevronRight /> : <FaChevronLeft />}
            </div>
          </div>

          {/* <hr className="hidden md:block h-1/2 rounded-md bg-gray-300" /> */}

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
                title="Home"
              >
                <AiOutlineHome size={20} />
                {!collapsedNav && <span>Home</span>}
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
                  <Link to="workspace" title="Workspace">
                    <div className="flex items-center space-x-2">
                      <AiOutlineUnorderedList size={20} />
                      {!collapsedNav && <span>Workspace</span>}
                    </div>
                  </Link>
                </button>

                {loc[1] === "open" && loc[0] === "workspace" && (
                  <div
                    className={`${
                      collapsedNav ? "p-1 border-1 rounded bg-gray-100" : "pl-6"
                    } mt-2 space-y-2`}
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    {workspaceSubMenus.map((items, index) => (
                      <div
                        key={index}
                        className={`flex items-center py-1 ${
                          !collapsedNav && "px-3"
                        } gap-1  hover:border-blue-500 cursor-pointer ${
                          onPage(items.link)
                            ? "border-b-2 border-blue-500 text-black font-bold"
                            : "text-gray-900 "
                        }`}
                        onClick={handleNavigation(items.link, loc[2])}
                        title={items.label}
                      >
                        <span className="text-xl">{items.icon}</span>
                        {!collapsedNav && (
                          <p className="text-sm text-nowrap">{items.label}</p>
                        )}
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
                title="Teams"
              >
                <AiOutlineTeam size={20} />
                {!collapsedNav && <span>Teams</span>}
              </Link>

              <Link
                to="classroom"
                className={`flex items-center space-x-2 hover:text-blue-500 p-1 ${
                  loc[0] === "classroom"
                    ? "font-bold bg-blue-100 text-blue-800 rounded"
                    : "text-gray-800"
                }`}
                onClick={() => setIsMobileNavOpen(false)}
                title="Classroom"
              >
                <FaChalkboardTeacher size={20} />
                {!collapsedNav && <span>Classroom</span>}
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
                title="Profile"
              >
                <AiOutlineUser size={20} />
                {!collapsedNav && <span>Profile</span>}
              </Link>
              <Link
                to="llm-setting"
                className={`flex items-center space-x-2 hover:text-blue-500 p-1 ${
                  loc[0] === "llm-setting"
                    ? "font-bold bg-blue-100 text-blue-800 rounded"
                    : "text-gray-800"
                }`}
                onClick={() => setIsMobileNavOpen(false)}
                title="LLM Setting"
              >
                {/* <FaBolt size={20} /> */}
                <GeminiIcon size={20} />
                {!collapsedNav && <span>LLM Setting</span>}
              </Link>
              <Link
                to="notification"
                className={`flex items-center space-x-2 hover:text-blue-500 p-1 ${
                  loc[0] === "notification"
                    ? "font-bold bg-blue-100 text-blue-800 rounded"
                    : "text-gray-800"
                }`}
                onClick={() => setIsMobileNavOpen(false)}
                title="Notification"
              >
                <AiOutlineNotification size={20} />
                {!collapsedNav && <span>Notification</span>}
              </Link>
              <Link
                to="setting"
                className={`flex items-center space-x-2 hover:text-blue-500 p-1 ${
                  loc[0] === "setting"
                    ? "font-bold bg-blue-100 text-blue-800 rounded"
                    : "text-gray-800"
                }`}
                onClick={() => setIsMobileNavOpen(false)}
                title="Setting"
              >
                <AiOutlineSetting size={20} />
                {!collapsedNav && <span>Setting</span>}
              </Link>
            </div>

            <div className="dropdown dropdown-start min-w-max hover:bg-gray-200 rounded-md">
              <div
                tabIndex={0}
                role="button"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 shadow-sm cursor-pointer"
              >
                <img
                  src={`https://gravatar.com/avatar/${getGravatarHash(
                    email
                  )}?s=40`}
                  className="w-8 h-8 rounded-full border border-gray-300"
                  alt="User Avatar"
                />
                {!collapsedNav && (
                  <strong className="text-black font-semibold text-sm">
                    {email.split("@")[0]}
                  </strong>
                )}
              </div>
              <ul
                tabIndex={0}
                className="z-10 dropdown-content menu border rounded-box shadow-md w-fit p-2"
              >
                <li>
                  <button
                    className="text-red-500 hover:bg-red-100 p-2 rounded-md text-sm"
                    onClick={handleLogout}
                    title="Logout"
                  >
                    <AiOutlinePoweroff />
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full flex flex-col overflow-x-hidden h-screen overflow-y-auto">
          <div className="w-full p-2 flex items-center justify-between bg-white border-b-1">
            <div className="flex items-center gap-2">
              <div className="flex space-x-2">
                <div
                  className="p-2 hover:bg-gray-200 rounded-full cursor-pointer"
                  onClick={() => history.back()}
                >
                  <AiOutlineArrowLeft />
                </div>
              </div>

              <div className="font-bold text-2xl">
                {loc[0]
                  ? loc[0].charAt(0).toUpperCase() + loc[0].slice(1)
                  : "Dashboard"}
              </div>
              {loc[0] === "workspace" &&
              loc[1] === "open" &&
              workspaceTitle &&
              workspaceEmoji ? (
                <div className="flex border-l-2 border-gray-500 pl-2 w-48 sm:w-80 overflow-x-scroll scrollbar-hide">
                  <div className="text-lg lg:text-2xl md:text-xl text-black flex items-center text-nowrap text-clip gap-2">
                    {workspaceEmoji}
                    {workspaceTitle}
                  </div>
                </div>
              ) : loc[0] === "team" && loc[1] === "open" && teamTitle ? (
                <div className="flex border-l-2 border-gray-500 pl-2 w-80 overflow-x-scroll scrollbar-hide">
                  <div className="text-lg lg:text-2xl md:text-xl text-black flex items-center gap-2 text-nowrap overflow-hidden">
                    {teamTitle}
                  </div>
                </div>
              ) : null}
            </div>

            {/* <div> */}
            {alarmPlaying && (
              <div className="fixed bottom-5 right-5 bg-orange-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-bounce transition-all">
                <span className="font-bold text-lg">🔔 Focus Time is Up!</span>
                <button
                  className="bg-white text-orange-600 px-3 py-1 rounded-lg font-bold shadow-md hover:shadow-xl transition-all hover:scale-105"
                  onClick={() => dispatch(stopAlarm())}
                >
                  ✋ Stop Music
                </button>
              </div>
            )}
            {/* </div> */}
            <div className="flex items-center gap-1">
              {/* <div className="" onClick={() => dispatch(toggleTheme())}>
                {theme}
                <input type="checkbox" className="toggle" />
              </div> */}
              <div
                className={`border-2 border-gray-800 rounded-box w-10 flex ${
                  theme === "light"
                    ? "justify-start"
                    : "justify-end bg-blue-50 bg-opacity-20 text-gray-700"
                } transition-all duration-500 cursor-pointer`}
                onClick={() => dispatch(toggleTheme())}
                title="Theme toggle"
              >
                <div className="w-5 h-5 rounded-full bg-black-200 flex items-center justify-center">
                  {theme === "light" ? <AiOutlineSun /> : <AiOutlineMoon />}
                </div>
              </div>
              <AiFillInfoCircle size={30} className="cursor-pointer" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-3 bg-white">
            <div className="h-full">
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      {/* <div className="bg-white text-white mt-auto border-t-2 border-black">
        <Footer1 />
      </div> */}
      <div className="w-full text-center mt-5 border-t-1">
        &copy; 2025 Student Productivity Hub
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
  // { icon: <AiOutlineTeam />, label: "Teams", link: "teams" },
  { icon: <AiOutlineCalendar />, label: "Study Plan", link: "study-plans" },
  { icon: <AiOutlineSetting />, label: "Settings", link: "settings" },
];
