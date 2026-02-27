import React from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { HiX } from "react-icons/hi";
import {
    PiHouseDuotone,
    PiBooksDuotone,
    PiUsersThreeDuotone,
    PiChalkboardTeacherDuotone,
    PiRobotDuotone,
    PiGearDuotone,
    PiSignOutDuotone,
    PiListChecksDuotone,
    PiNotePencilDuotone,
    PiCalendarCheckDuotone,
    PiMapTrifoldDuotone,
    PiSlidersHorizontalDuotone,
    PiChartBarDuotone,
    PiClipboardTextDuotone,
} from "react-icons/pi";
import { FEATURES } from "../../../config/featureFlags";
import { HiSearch } from "react-icons/hi";
import { WorkspaceIcon } from "@shared/components/ui/workspace-icon";

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
    // include study plan only if feature is enabled
    ...(FEATURES.studyPlans
        ? [
              {
                  icon: <PiCalendarCheckDuotone />,
                  label: "Study Plan",
                  link: "study-plans",
              },
          ]
        : []),
    { icon: <PiSlidersHorizontalDuotone />, label: "Settings", link: "settings" },
];

function Sidebar({
    showSidebar,
    isMobileNavOpen,
    collapsedNav,
    recentWorkspaces = [],
    loc,
    handleCollapseBar,
    toggleMobileNav,
    setIsMobileNavOpen,
    setSearchOpened,
    handleNavigation,
    onPage,
    handleLogout,
}) {
    const shellWidth = collapsedNav && showSidebar ? 92 : 272;
    const navItemClass = (isActive) =>
        `flex items-center ${collapsedNav ? "justify-center" : ""} gap-2 px-2 py-2.5 rounded-xl font-medium transition-all ${
            isActive
                ? "bg-gray-100 text-gray-900 border border-gray-200 shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
        }`;

    const dedupedRecentWorkspaces = Array.from(
        new Map(
            (recentWorkspaces || [])
                .filter((item) => item?.workspace?.id)
                .map((item) => [item.workspace.id, item])
        ).values()
    ).slice(0, 5);

    return (
        <aside
            className={`fixed sm:static top-0 left-0 z-40 h-full bg-white/95 border-r border-gray-200 shadow-xl sm:shadow-none p-4 transition-transform duration-300 transform ${
                isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
            } ${
                showSidebar ? "sm:translate-x-0" : "sm:-translate-x-full"
            } scrollbar-hide`}
            style={{
                width: shellWidth,
                minWidth: shellWidth,
                maxHeight: "100vh",
                overflowY: "auto",
            }}
        >
            <div className="flex items-center justify-between mb-4">
                <Link to="/" className="flex gap-2 items-center">
                    {(!collapsedNav || !showSidebar) && (
                        <>
                            <img src="/rect19.png" alt="Logo" className="h-9 w-auto" />
                            <span className="font-black text-lg tracking-tight text-gray-900">
                                Benote
                            </span>
                        </>
                    )}
                </Link>
                <div className="flex items-center gap-2">
                    <div
                        className={`hidden sm:flex p-2 hover:bg-gray-100 rounded-lg cursor-pointer ${
                            showSidebar ? "" : "pointer-events-none opacity-0"
                        }`}
                        onClick={handleCollapseBar}
                        title={collapsedNav ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsedNav ? <FaChevronRight /> : <FaChevronLeft />}
                    </div>
                    <button
                        onClick={toggleMobileNav}
                        className="sm:hidden focus:outline-none text-gray-700 ml-2"
                        aria-label="Close sidebar"
                    >
                        <HiX size={28} />
                    </button>
                </div>
            </div>

            <nav className="bg-transparent max-h-full overflow-auto scrollbar-hide">
                <div className="mb-4 rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-2">
                    <div className="flex flex-col gap-2">
                        <button
                            className="flex items-center justify-center gap-2 px-2 py-2.5 rounded-xl bg-gray-900 text-white font-semibold hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 w-full"
                            onClick={() => {
                                setSearchOpened(true);
                                setIsMobileNavOpen(false);
                            }}
                            title="Quick Search"
                        >
                            <HiSearch size={20} />
                            {!collapsedNav && <span className="text-sm">Quick Search</span>}
                        </button>
                    </div>
                </div>

                <div className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                    {!collapsedNav && "Workspace"}
                </div>
                {!collapsedNav && (
                    <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-2">
                        {dedupedRecentWorkspaces.length ? (
                            <ul className="flex flex-col gap-1">
                                {dedupedRecentWorkspaces.map((item) => (
                                    <li key={item.workspace.id}>
                                        <Link
                                            to={`/app/workspace/open/${item.workspace.id}`}
                                            onClick={() => setIsMobileNavOpen(false)}
                                            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-all"
                                            title={item.workspace.name}
                                        >
                                            <span className="text-base">
                                                <WorkspaceIcon
                                                    iconKey={item.workspace.emoji}
                                                    size={18}
                                                    className="text-gray-700"
                                                    fallbackClassName="text-base"
                                                />
                                            </span>
                                            <span className="truncate">
                                                {item.workspace.name || "Untitled Workspace"}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="px-2 py-2 text-xs text-gray-500">
                                No recent workspaces
                            </p>
                        )}
                        <Link
                            to="workspace"
                            onClick={() => setIsMobileNavOpen(false)}
                            className="mt-2 flex items-center justify-center rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
                        >
                            More
                        </Link>
                    </div>
                )}
                <ul className="flex flex-col gap-1.5">
                    <li>
                        <Link
                            to="home"
                            className={navItemClass(loc[0] === "home")}
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
                            className={navItemClass(loc[0] === "workspace")}
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
                                    collapsedNav
                                        ? "p-1 bg-gray-50 rounded-xl"
                                        : "pl-8 p-2 bg-gray-50 rounded-xl"
                                } mt-2 flex flex-col gap-1`}
                            >
                                {workspaceSubMenusModern.map((item, idx) => (
                                    <li
                                        key={idx}
                                        className={`flex items-center gap-2 py-1.5 rounded-lg transition-all cursor-pointer ${
                                            onPage(item.link)
                                                ? "bg-gray-200 text-gray-900 font-semibold"
                                                : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                        onClick={() => {
                                            handleNavigation(item.link, loc[2])();
                                            setIsMobileNavOpen(false);
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
                            className={navItemClass(loc[0] === "team")}
                            onClick={() => setIsMobileNavOpen(false)}
                            title="Teams"
                        >
                            <span className="flex items-center justify-center min-w-[40px] min-h-[40px]">
                                <PiUsersThreeDuotone size={22} />
                            </span>
                            {!collapsedNav && <span>Teams</span>}
                        </Link>
                    </li>
                    {FEATURES.classroom && (
                        <li>
                            <Link
                                to="classroom"
                                className={navItemClass(loc[0] === "classroom")}
                                onClick={() => setIsMobileNavOpen(false)}
                                title="Classroom"
                            >
                                <span className="flex items-center justify-center min-w-[40px] min-h-[40px]">
                                    <PiChalkboardTeacherDuotone size={22} />
                                </span>
                                {!collapsedNav && <span>Classroom</span>}
                            </Link>
                        </li>
                    )}
                    <li>
                        <Link
                            to="askAI"
                            className={navItemClass(loc[0] === "askAI")}
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
                <hr className="my-4 border-gray-200" />
                <div className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                    {!collapsedNav && "Bottom Menu"}
                </div>
                <ul className="flex flex-col gap-1.5">
                    <li>
                        <Link
                            to="setting"
                            className={navItemClass(
                                loc[0] === "setting" ||
                                    loc[0] === "llm-setting" ||
                                    loc[0] === "profile"
                            )}
                            onClick={() => setIsMobileNavOpen(false)}
                            title="Setting"
                        >
                            <span className="flex items-center justify-center min-w-[40px] min-h-[40px]">
                                <PiGearDuotone size={22} />
                            </span>
                            {!collapsedNav && <span>Setting</span>}
                        </Link>
                        {!collapsedNav && (
                            <ul className="mt-2 ml-9 flex flex-col gap-1">
                                <li>
                                    <Link
                                        to="setting"
                                        className={`block rounded-lg px-3 py-1.5 text-sm transition-all ${
                                            loc[0] === "setting"
                                                ? "bg-gray-200 text-gray-900 font-semibold"
                                                : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                        onClick={() => setIsMobileNavOpen(false)}
                                    >
                                        App Settings
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="profile"
                                        className={`block rounded-lg px-3 py-1.5 text-sm transition-all ${
                                            loc[0] === "profile"
                                                ? "bg-gray-200 text-gray-900 font-semibold"
                                                : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                        onClick={() => setIsMobileNavOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="llm-setting"
                                        className={`block rounded-lg px-3 py-1.5 text-sm transition-all ${
                                            loc[0] === "llm-setting"
                                                ? "bg-gray-200 text-gray-900 font-semibold"
                                                : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                        onClick={() => setIsMobileNavOpen(false)}
                                    >
                                        LLM Setting
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>
                </ul>

                <ul className="mt-4 flex flex-col gap-1.5">
                    <li>
                        <button
                            className={`w-full flex items-center ${
                                collapsedNav ? "justify-center" : ""
                            } gap-2 px-2 py-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl font-medium transition-all`}
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
