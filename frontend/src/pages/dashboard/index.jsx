import React, { useEffect, useState, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AiOutlineHome,
  AiOutlineUser,
  AiOutlineNotification,
  AiOutlineSetting,
  AiOutlinePoweroff,
  AiOutlineArrowLeft,
  AiOutlineSun,
  AiOutlineMoon,
} from "react-icons/ai";
import { HiMenu, HiSearch, HiX } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { SHA256 } from "crypto-js";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { stopAlarm } from "../../redux/slices/pomodoroSlice";
import { toggleTheme } from "../../redux/slices/themeSlice";
import { clearAuthenticatedUser } from "../../redux/slices/authSlice";
import GeminiIcon from "../../components/geminiIcon";
import { sendBrowserNotification } from "../../utils/sendBrowserNotification";
import SearchModal from "./contents/SearchModal";
import AiOverviewModal from "./contents/AiOverviewModal";
import {
  PiStudentBold,
  PiBooksDuotone,
  PiUsersThreeDuotone,
  PiChalkboardTeacherDuotone,
  PiNewspaperDuotone,
  PiRobotDuotone,
  PiUserCircleDuotone,
  PiGearDuotone,
  PiBellRingingDuotone,
  PiSignOutDuotone,
  PiHouseDuotone,
  PiListChecksDuotone,
  PiNotePencilDuotone,
  PiCalendarCheckDuotone,
  PiMapTrifoldDuotone,
  PiSlidersHorizontalDuotone,
  PiPresentationChart,
  PiChartBarDuotone,
  PiClipboardDuotone,
  PiClipboardTextDuotone,
} from "react-icons/pi";

function Dashboard() {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
  };

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false); //mobile nav bar
  const [latestNotification, setLatestNotification] = useState(null); //latest notification
  const [unreadCount, setUnreadCount] = useState(0); //notification count
  const [collapsedNav, setCollapsedBar] = useState(false); //collapsed nav bar
  const [notificationPopping, setNotificationPopping] = useState(false); //notification popping

  const [searchOpened, setSearchOpened] = useState(false);
  const [aiOverviewOpen, setAiOverviewOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const workspaceTitle =
    useSelector((state) => state.workspace.workspace.name) || "Workspace";
  const teamTitle = useSelector((state) => state.team.team.name) || "Team";
  const workspaceEmoji =
    useSelector((state) => state.workspace.workspace.emoji) || "";
  const userData = useSelector((state) => state.auth.user) || {};

  const loc = location.pathname.split("/").slice(2);

  const handleNavigation = (link, workspaceId) => () => {
    navigate(`/app/workspace/open/${workspaceId}/${link}`);
  };

  const onPage = (link) => location.pathname.includes(link);

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
    // When opening mobile nav, ensure collapsedNav is false
    if (!isMobileNavOpen) {
      setCollapsedBar(false);
    }
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

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(
          `${apiURL}/api/notifications/unread-count`,
          {
            headers: header,
          }
        );
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error("Error fetching unread notifications:", error);
      }
    };

    fetchUnreadCount();
    const intervalId = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchLatestNotification = async () => {
      try {
        const response = await fetch(`${apiURL}/api/notifications?latest=1`, {
          headers: header,
        });

        if (response.status === 204) {
          setLatestNotification(null);
          return;
        }

        const data = await response.json();
        setLatestNotification(data);
      } catch (error) {
        console.error("Error fetching latest notification:", error);
      }
    };

    fetchLatestNotification();
  }, [unreadCount]);

  useEffect(() => {
    if (latestNotification) {
      setNotificationPopping(true);
      const timer = setTimeout(() => {
        setNotificationPopping(false);
        setLatestNotification(null);
      }, 10000); // Notification will disappear after 10 seconds

      return () => clearTimeout(timer); // Cleanup the timer on unmount
    }
  }, [latestNotification]);

  const navigateToWorkspace = (id) => {
    navigate(`/app/workspace/open/${id}/tasks`);
  };

  useEffect(() => {
    if (latestNotification) {
      sendBrowserNotification(
        latestNotification.message,
        latestNotification.type
      );
    }
  }, [latestNotification]);

  const toggleSearchOpened = () => {
    setSearchOpened(!searchOpened);
  };

  useEffect(() => {
    if (aiOverviewOpen) {
      setAiSummary("Generating summary...");
      setTimeout(() => {
        setAiSummary(
          "This is your AI-generated productivity summary.\n\n- You have 3 tasks due today.\n- Your focus time is up 20% this week.\n- Team collaboration is active in 2 workspaces.\n\nKeep up the great work!"
        );
      }, 1200);
    }
  }, [aiOverviewOpen]);

  // Use a single state for sidebar visibility, managed by screen size and mobile toggle
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 640);

  useEffect(() => {
    const handleResize = () => {
      // On screens smaller than 'sm' (640px), sidebar is always hidden by default, and `isMobileNavOpen` controls its display.
      // On 'sm' and larger screens, sidebar is always shown by default.
      if (window.innerWidth < 640) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
        setIsMobileNavOpen(false); // Close mobile nav if resized to desktop
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfilePopoverOpen(false);
      }
    }
    if (profilePopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profilePopoverOpen]);

  return (
    <div className="bg-white text-black h-screen min-h-screen w-full flex flex-col overflow-hidden">
      {/* Top */}
      <div className="w-full flex-1 flex flex-col sm:flex-row overflow-hidden">
        {/* Hamburger for mobile */}
        {!showSidebar && !isMobileNavOpen && (
          <button
            className="fixed top-4 left-4 z-50 p-2 rounded-full bg-blue-600 text-white shadow-lg sm:hidden"
            onClick={toggleMobileNav}
            aria-label="Open sidebar"
          >
            <HiMenu size={28} />
          </button>
        )}
        {/* Mobile sidebar backdrop */}
        {isMobileNavOpen && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-30 sm:hidden"
            onClick={toggleMobileNav}
            aria-label="Close sidebar backdrop"
          />
        )}
        {/* Sidebar */}
        {(showSidebar || isMobileNavOpen) && (
          <aside
            className={`fixed sm:static top-0 left-0 z-40 h-full bg-white/90 border-r border-blue-100 shadow-lg sm:shadow-none p-6 transition-transform duration-300 transform ${
              isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
            } ${
              showSidebar ? "sm:translate-x-0" : "sm:-translate-x-full"
            } scrollbar-hide`}
            style={{
              width: collapsedNav && showSidebar ? 90 : 256,
              minWidth: collapsedNav && showSidebar ? 80 : 256,
              maxHeight: "100vh",
              overflowY: "auto",
            }}
          >
            {/* Logo, collapse/expand, and profile */}
            <div className="flex items-center justify-between mb-6 relative ">
              <Link to="/" className="flex gap-2 items-center">
                {/* Show logo only when not collapsed AND on desktop, or on mobile */}
                {(!collapsedNav || !showSidebar) && (
                  <>
                    <img src="/rect19.png" alt="Logo" className="h-10 w-auto" />
                    <span className="font-black text-lg tracking-tight text-blue-700">
                      Benote
                    </span>
                  </>
                )}
              </Link>
              <div className="flex items-center gap-2">
                {/* Collapse/Expand button (desktop only) */}
                <div
                  className={`hidden sm:flex p-2 hover:bg-blue-50 rounded-full cursor-pointer ${
                    showSidebar ? "" : "pointer-events-none opacity-0"
                  }`}
                  onClick={handleCollapseBar}
                  title={collapsedNav ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {collapsedNav ? <FaChevronRight /> : <FaChevronLeft />}
                </div>
                {/* Mobile close button */}
                <button
                  onClick={toggleMobileNav}
                  className="sm:hidden focus:outline-none text-gray-600 ml-2"
                  aria-label="Close sidebar"
                >
                  <HiX size={28} />
                </button>
              </div>
            </div>
            <nav className="bg-white max-h-full overflow-auto scrollbar-hide">
              {/* Quick Search & AI Overview for mobile (show above nav on mobile) */}
              <div className="flex sm:hidden gap-2 mb-4">
                <button
                  className="flex items-center justify-center gap-2 flex-1 px-2 py-2 rounded-lg bg-blue-50 text-blue-800 font-semibold shadow hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  onClick={() => {
                    setSearchOpened(true);
                    setIsMobileNavOpen(false); // Close mobile nav when opening modal
                  }}
                  title="Quick Search"
                >
                  <HiSearch size={22} />
                  <span className="text-sm">Search</span>
                </button>
                <button
                  className="flex items-center justify-center gap-2 flex-1 px-2 py-2 rounded-lg bg-blue-50 text-blue-800 font-semibold shadow hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  onClick={() => {
                    setAiOverviewOpen(true);
                    setIsMobileNavOpen(false); // Close mobile nav when opening modal
                  }}
                  title="AI Overview"
                >
                  <PiRobotDuotone size={22} />
                  <span className="text-sm">AI</span>
                </button>
              </div>
              <ul className="flex flex-col gap-2">
                {/* Sidebar nav items with fixed icon size */}
                <li>
                  <Link
                    to="home"
                    className={`flex items-center ${
                      collapsedNav && "justify-center"
                    } gap-2 px-0 py-2 rounded-lg font-medium transition-all ${
                      loc[0] === "home"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                    onClick={() => setIsMobileNavOpen(false)}
                    title="Home"
                  >
                    <span className="flex items-center justify-center min-w-[40px] min-h-[40px]">
                      <PiHouseDuotone size={22} />
                    </span>
                    {!collapsedNav && <span>Home</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    to="workspace"
                    className={`flex items-center ${
                      collapsedNav && "justify-center"
                    } gap-2 px-0 py-2 rounded-lg font-medium transition-all ${
                      loc[0] === "workspace"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                    onClick={() => setIsMobileNavOpen(false)}
                    title="Workspace"
                  >
                    <span className="flex items-center justify-center min-w-[40px] min-h-[40px]">
                      <PiBooksDuotone size={22} />
                    </span>
                    {!collapsedNav && <span>Workspace</span>}
                  </Link>
                  {/* Submenu */}
                  {loc[1] === "open" && loc[0] === "workspace" && (
                    <ul
                      className={`${
                        collapsedNav ? "p-1 bg-blue-50 rounded" : "pl-7 p-2"
                      } mt-2 flex flex-col gap-1`}
                    >
                      {workspaceSubMenusModern.map((item, idx) => (
                        <li
                          key={idx}
                          className={`flex items-center gap-2 py-1 rounded transition-all cursor-pointer ${
                            onPage(item.link)
                              ? "bg-blue-200 text-blue-900 font-semibold"
                              : "text-gray-600 hover:bg-blue-100"
                          }`}
                          onClick={() => {
                            handleNavigation(item.link, loc[2])();
                            setIsMobileNavOpen(false); // Close mobile nav after navigation
                          }}
                          title={item.label}
                        >
                          <span className="flex items-center justify-center min-w-[36px] min-h-[36px]">
                            {React.cloneElement(item.icon, { size: 28 })}
                            {collapsedNav && (
                              <span className="sr-only">{item.label}</span>
                            )}
                          </span>
                          {!collapsedNav && (
                            <span className="text-sm">{item.label}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
                <li>
                  <Link
                    to="team"
                    className={`flex items-center ${
                      collapsedNav && "justify-center"
                    } gap-2 px-0 py-2 rounded-lg font-medium transition-all ${
                      loc[0] === "team"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                    onClick={() => setIsMobileNavOpen(false)}
                    title="Teams"
                  >
                    <span className="flex items-center justify-center min-w-[40px] min-h-[40px]">
                      <PiUsersThreeDuotone size={22} />
                    </span>
                    {!collapsedNav && <span>Teams</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    to="classroom"
                    className={`flex items-center ${
                      collapsedNav && "justify-center"
                    } gap-2 px-0 py-2 rounded-lg font-medium transition-all ${
                      loc[0] === "classroom"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                    onClick={() => setIsMobileNavOpen(false)}
                    title="Classroom"
                  >
                    <span className="flex items-center justify-center min-w-[40px] min-h-[40px]">
                      <PiChalkboardTeacherDuotone size={22} />
                    </span>
                    {!collapsedNav && <span>Classroom</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    to="news"
                    className={`flex items-center ${
                      collapsedNav && "justify-center"
                    } gap-2 px-0 py-2 rounded-lg font-medium transition-all ${
                      loc[0] === "news"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                    onClick={() => setIsMobileNavOpen(false)}
                    title="News"
                  >
                    <span className="flex items-center justify-center min-w-[40px] min-h-[40px]">
                      <PiNewspaperDuotone size={22} />
                    </span>
                    {!collapsedNav && <span>News</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    to="askAI"
                    className={`flex items-center ${
                      collapsedNav && "justify-center"
                    } gap-2 px-0 py-2 rounded-lg font-medium transition-all ${
                      loc[0] === "askAI"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                    onClick={() => setIsMobileNavOpen(false)}
                    title="AskAI"
                  >
                    <span className="flex items-center justify-center min-w-[40px] min-h-[40px]">
                      <PiRobotDuotone size={22} />
                    </span>
                    {!collapsedNav && <span>AskAI</span>}
                  </Link>
                </li>
              </ul>
              <hr className="my-4 border-blue-100" />
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    to="profile"
                    className={`flex items-center ${
                      collapsedNav && "justify-center"
                    } gap-2 px-0 py-2 rounded-lg font-medium transition-all ${
                      loc[0] === "profile"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                    onClick={() => setIsMobileNavOpen(false)}
                    title="Profile"
                  >
                    <span className="flex items-center justify-center min-w-[40px] min-h-[40px]">
                      <PiUserCircleDuotone size={22} />
                    </span>
                    {!collapsedNav && <span>Profile</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    to="llm-setting"
                    className={`flex items-center ${
                      collapsedNav && "justify-center"
                    } gap-2 px-0 py-2 rounded-lg font-medium transition-all ${
                      loc[0] === "llm-setting"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                    onClick={() => setIsMobileNavOpen(false)}
                    title="LLM Setting"
                  >
                    <span className="flex items-center justify-center min-w-[40px] min-h-[40px]">
                      <GeminiIcon size={22} />
                    </span>
                    {!collapsedNav && <span>LLM Setting</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    to="notifications"
                    className={`flex items-center ${
                      collapsedNav && "justify-center"
                    } gap-2 px-0 py-2 rounded-lg font-medium transition-all ${
                      loc[0] === "notifications"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                    onClick={() => setIsMobileNavOpen(false)}
                    title="Notifications"
                  >
                    <span className="relative flex items-center justify-center min-w-[40px] min-h-[40px]">
                      <PiBellRingingDuotone size={22} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </span>
                    {!collapsedNav && <span>Notifications</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    to="setting"
                    className={`flex items-center ${
                      collapsedNav && "justify-center"
                    } gap-2 px-0 py-2 rounded-lg font-medium transition-all ${
                      loc[0] === "setting"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                    onClick={() => setIsMobileNavOpen(false)}
                    title="Setting"
                  >
                    <span className="flex items-center justify-center min-w-[40px] min-h-[40px]">
                      <PiGearDuotone size={22} />
                    </span>
                    {!collapsedNav && <span>Setting</span>}
                  </Link>
                </li>
                {/* Logout Button (Moved to bottom of sidebar for better mobile access) */}
                <li>
                  <button
                    className="w-full flex items-center gap-2 px-0 py-2 text-red-600 hover:bg-red-50 hover:text-red-800 rounded-lg font-medium transition-all"
                    onClick={handleLogout}
                    title="Logout"
                  >
                    <span className="flex items-center justify-center min-w-[40px] min-h-[40px]">
                      <PiSignOutDuotone size={22} />
                    </span>
                    {!collapsedNav && <span>Logout</span>}
                  </button>
                </li>
              </ul>
            </nav>
          </aside>
        )}
        {/* Modals for search and AI overview */}
        <SearchModal
          open={searchOpened}
          onClose={() => setSearchOpened(false)}
        />
        <AiOverviewModal
          open={aiOverviewOpen}
          onClose={() => setAiOverviewOpen(false)}
        />
        {/* Main Content */}
        <main className="w-full flex flex-col h-screen min-h-0 overflow-y-auto scrollbar-hide bg-white/80">
          <header className="w-full px-4 sm:px-8 py-4 flex items-center justify-between bg-white border-b shadow-sm sticky top-0 z-30">
            <div className="flex items-center gap-3">
              {/* Hamburger for mobile in header for consistency */}
              {!showSidebar && (
                <button
                  className="p-2 hover:bg-blue-100 rounded-full cursor-pointer border border-transparent hover:border-blue-300 transition sm:hidden"
                  onClick={toggleMobileNav}
                  title="Open sidebar"
                  aria-label="Open sidebar"
                >
                  <HiMenu size={22} />
                </button>
              )}
              <button
                className="p-2 hover:bg-blue-100 rounded-full cursor-pointer border border-transparent hover:border-blue-300 transition"
                onClick={() => history.back()}
                title="Back"
              >
                <PiHouseDuotone size={22} />
              </button>
              <span className="font-bold text-lg sm:text-2xl text-blue-900 tracking-tight drop-shadow-sm truncate">
                {loc[0]
                  ? loc[0].charAt(0).toUpperCase() + loc[0].slice(1)
                  : "Dashboard"}
              </span>
              {loc[0] === "workspace" &&
              loc[1] === "open" &&
              workspaceTitle &&
              workspaceEmoji ? (
                <span className="hidden sm:flex border-l-2 border-blue-200 pl-3 max-w-[200px] sm:max-w-xs truncate text-md lg:text-xl md:text-lg text-blue-700 items-center gap-2">
                  {workspaceEmoji}
                  {workspaceTitle}
                </span>
              ) : loc[0] === "team" && loc[1] === "open" && teamTitle ? (
                <span className="hidden sm:flex border-l-2 border-blue-200 pl-3 max-w-[200px] sm:max-w-xs truncate text-md lg:text-xl md:text-lg text-blue-700 items-center gap-2">
                  {teamTitle}
                </span>
              ) : null}
            </div>
            {/* Search & AI Overview (Desktop only in header, mobile versions are in sidebar) */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-800 font-semibold shadow hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                onClick={() => setSearchOpened(true)}
                title="Search"
                style={{ minWidth: 120 }}
              >
                <HiSearch size={22} className="mr-1" />
                <span className="hidden sm:inline">Quick Search</span>
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-800 font-semibold shadow hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                onClick={() => setAiOverviewOpen(true)}
                title="AI Overview"
                style={{ minWidth: 120 }}
              >
                <PiRobotDuotone size={22} />
                <span className="hidden sm:inline">AI Overview</span>
              </button>
            </div>
            {/* Theme Switch and Profile Picture */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1 sm:gap-3 ml-0 sm:ml-4 border border-gray-300 rounded-full px-2 py-1 sm:px-3 sm:py-1 bg-white shadow-sm">
                <span className="text-yellow-400">
                  <AiOutlineSun size={20} />
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={theme === "dark"}
                    onChange={() => dispatch(toggleTheme())}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer dark:bg-gray-700 peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-600 transition-all duration-300"></div>
                  <div className="absolute left-1 top-1 w-3 h-3 sm:w-4 sm:h-4 bg-white border border-gray-300 rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-4 sm:peer-checked:translate-x-5"></div>
                </label>
                <span className="text-blue-900 ml-1 sm:ml-2">
                  <AiOutlineMoon size={20} />
                </span>
              </div>
              <div ref={profileRef} className="relative">
                <button
                  className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-300 bg-white hover:ring-2 hover:ring-blue-200 transition"
                  onClick={() => setProfilePopoverOpen((v) => !v)}
                  title="User menu"
                >
                  <img
                    src={`https://gravatar.com/avatar/${getGravatarHash(
                      email
                    )}?s=40`}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full"
                    alt="User Avatar"
                  />
                </button>
                {profilePopoverOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-blue-100 rounded-lg shadow-lg z-50 animate-fade-in">
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-800 rounded-lg text-sm font-medium transition-all"
                      onClick={handleLogout}
                    >
                      <PiSignOutDuotone size={22} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
          {/* Main Content */}
          <section className="flex-1 p-4 sm:p-6">
            <div className="h-full">
              <Outlet />
            </div>
          </section>
          <footer className="w-full text-center mt-5 border-t pt-4 text-gray-500 text-xs sm:text-sm px-4">
            &copy; 2025 Benote
          </footer>
        </main>
      </div>
      {/* Notification Popover/Banner */}
      {notificationPopping && latestNotification && (
        <div className="fixed top-6 right-6 z-50 bg-blue-700 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 animate-fade-in">
          <div className="flex-1">
            <strong>New Notification:</strong>{" "}
            {latestNotification.message ||
              latestNotification.title ||
              "You have a new notification."}
          </div>
          <button
            className="ml-2 px-2 py-1 rounded bg-blue-900 hover:bg-blue-800 text-xs"
            onClick={() => {
              setNotificationPopping(false);
              setLatestNotification(null);
            }}
            aria-label="Dismiss notification"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

const workspaceSubMenusModern = [
  { icon: <PiChartBarDuotone />, label: "Overview", link: "overview" },
  { icon: <PiListChecksDuotone />, label: "Tasks", link: "tasks" },
  {
    icon: <PiClipboardTextDuotone />,
    label: "TO-DO Lists",
    link: "todo-lists",
  },
  { icon: <PiNotePencilDuotone />, label: "Notes", link: "notes" },
  { icon: <PiMapTrifoldDuotone />, label: "Roadmaps", link: "roadmaps" },
  {
    icon: <PiCalendarCheckDuotone />,
    label: "Study Plan",
    link: "study-plans",
  },
  { icon: <PiSlidersHorizontalDuotone />, label: "Settings", link: "settings" },
];
