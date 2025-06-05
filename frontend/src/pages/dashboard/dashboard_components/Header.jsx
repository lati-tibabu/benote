import React from "react";
import { AiOutlineSun, AiOutlineMoon } from "react-icons/ai";
import { HiMenu, HiSearch } from "react-icons/hi";
import {
  PiHouseDuotone,
  PiRobotDuotone,
  PiSignOutDuotone,
} from "react-icons/pi";

function Header({
  loc,
  workspaceTitle,
  workspaceEmoji,
  teamTitle,
  setSearchOpened,
  setAiOverviewOpen,
  theme,
  toggleTheme,
  userData,
  handleLogout,
  profilePopoverOpen,
  setProfilePopoverOpen,
  profileRef,
  getGravatarHash,
  showSidebar,
  toggleMobileNav,
}) {
  return (
    <header className="w-full px-4 sm:px-8 py-4 flex items-center justify-between bg-white border-b shadow-sm sticky top-0 z-30">
      <div className="flex items-center gap-3">
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
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1 sm:gap-3 ml-0 sm:ml-4 border border-gray-300 rounded-full px-2 py-1 sm:px-3 sm:py-1 bg-white shadow-sm">
          <span className="text-yellow-400">
            <AiOutlineSun size={20} />
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={theme === "dark"}
              onChange={toggleTheme}
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
                userData?.email
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
  );
}

export default Header;
