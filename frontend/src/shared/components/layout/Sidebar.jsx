import React from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { HiX } from "react-icons/hi";
import {
    PiHouseDuotone,
    PiBooksDuotone,
    PiUsersThreeDuotone,
    PiChalkboardTeacherDuotone,
    PiNewspaperDuotone,
    PiRobotDuotone,
    PiUserCircleDuotone,
    PiGearDuotone,
    PiBellRingingDuotone,
    PiSignOutDuotone,
    PiListChecksDuotone,
    PiNotePencilDuotone,
    PiCalendarCheckDuotone,
    PiMapTrifoldDuotone,
    PiSlidersHorizontalDuotone,
    PiChartBarDuotone,
    PiClipboardTextDuotone,
} from "react-icons/pi";
import { HiSearch } from "react-icons/hi";
import { GeminiIcon } from "../../../features/ai";

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

function Sidebar({
    showSidebar,
    isMobileNavOpen,
    collapsedNav,
    loc,
    unreadCount,
    handleCollapseBar,
    toggleMobileNav,
    setIsMobileNavOpen,
    setSearchOpened,
    setAiOverviewOpen,
    handleNavigation,
    onPage,
    handleLogout,
}) {
    return (
        <aside
            className={`fixed sm:static top-0 left-0 z-40 h-full bg-white/90 border-r border-gray-100 shadow-sm sm:shadow-none p-6 transition-transform duration-300 transform ${isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
                } ${showSidebar ? "sm:translate-x-0" : "sm:-translate-x-full"
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
                            <span className="font-black text-lg tracking-tight text-gray-700">
                                Benote
                            </span>
                        </>
                    )}
                </Link>
                <div className="flex items-center gap-2">
                    {/* Collapse/Expand button (desktop only) */}
                    <div
                        className={`hidden sm:flex p-2 hover:bg-gray-50 rounded-sm cursor-pointer ${showSidebar ? "" : "pointer-events-none opacity-0"
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
                        className="flex items-center justify-center gap-2 flex-1 px-2 py-2 rounded-sm bg-gray-50 text-gray-800 font-semibold shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
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
                        className="flex items-center justify-center gap-2 flex-1 px-2 py-2 rounded-sm bg-gray-50 text-gray-800 font-semibold shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
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
                            className={`flex items-center ${collapsedNav && "justify-center"
                                } gap-2 px-0 py-2 rounded-sm font-medium transition-all ${loc[0] === "home"
                                    ? "bg-gray-100 text-gray-700"
                                    : "text-gray-700 hover:bg-gray-50"
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
                            className={`flex items-center ${collapsedNav && "justify-center"
                                } gap-2 px-0 py-2 rounded-sm font-medium transition-all ${loc[0] === "workspace"
                                    ? "bg-gray-100 text-gray-700"
                                    : "text-gray-700 hover:bg-gray-50"
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
                                className={`${collapsedNav ? "p-1 bg-gray-50 rounded" : "pl-7 p-2"
                                    } mt-2 flex flex-col gap-1`}
                            >
                                {workspaceSubMenusModern.map((item, idx) => (
                                    <li
                                        key={idx}
                                        className={`flex items-center gap-2 py-1 rounded transition-all cursor-pointer ${onPage(item.link)
                                            ? "bg-gray-200 text-gray-900 font-semibold"
                                            : "text-gray-600 hover:bg-gray-100"
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
                            className={`flex items-center ${collapsedNav && "justify-center"
                                } gap-2 px-0 py-2 rounded-sm font-medium transition-all ${loc[0] === "team"
                                    ? "bg-gray-100 text-gray-700"
                                    : "text-gray-700 hover:bg-gray-50"
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
                            className={`flex items-center ${collapsedNav && "justify-center"
                                } gap-2 px-0 py-2 rounded-sm font-medium transition-all ${loc[0] === "classroom"
                                    ? "bg-gray-100 text-gray-700"
                                    : "text-gray-700 hover:bg-gray-50"
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
                            className={`flex items-center ${collapsedNav && "justify-center"
                                } gap-2 px-0 py-2 rounded-sm font-medium transition-all ${loc[0] === "news"
                                    ? "bg-gray-100 text-gray-700"
                                    : "text-gray-700 hover:bg-gray-50"
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
                            className={`flex items-center ${collapsedNav && "justify-center"
                                } gap-2 px-0 py-2 rounded-sm font-medium transition-all ${loc[0] === "askAI"
                                    ? "bg-gray-100 text-gray-700"
                                    : "text-gray-700 hover:bg-gray-50"
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
                <hr className="my-4 border-gray-100" />
                <ul className="flex flex-col gap-2">
                    <li>
                        <Link
                            to="profile"
                            className={`flex items-center ${collapsedNav && "justify-center"
                                } gap-2 px-0 py-2 rounded-sm font-medium transition-all ${loc[0] === "profile"
                                    ? "bg-gray-100 text-gray-700"
                                    : "text-gray-700 hover:bg-gray-50"
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
                            className={`flex items-center ${collapsedNav && "justify-center"
                                } gap-2 px-0 py-2 rounded-sm font-medium transition-all ${loc[0] === "llm-setting"
                                    ? "bg-gray-100 text-gray-700"
                                    : "text-gray-700 hover:bg-gray-50"
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
                            className={`flex items-center ${collapsedNav && "justify-center"
                                } gap-2 px-0 py-2 rounded-sm font-medium transition-all ${loc[0] === "notifications"
                                    ? "bg-gray-100 text-gray-700"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                            onClick={() => setIsMobileNavOpen(false)}
                            title="Notifications"
                        >
                            <span className="relative flex items-center justify-center min-w-[40px] min-h-[40px]">
                                <PiBellRingingDuotone size={22} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-sm w-5 h-5 flex items-center justify-center">
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
                            className={`flex items-center ${collapsedNav && "justify-center"
                                } gap-2 px-0 py-2 rounded-sm font-medium transition-all ${loc[0] === "setting"
                                    ? "bg-gray-100 text-gray-700"
                                    : "text-gray-700 hover:bg-gray-50"
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
                            className="w-full flex items-center gap-2 px-0 py-2 text-red-600 hover:bg-red-50 hover:text-red-800 rounded-sm font-medium transition-all"
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
    );
}

export default Sidebar;
