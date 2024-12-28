import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  FaHome,
  FaTasks,
  FaUsers,
  FaCog,
  FaSearch,
  FaUserCircle,
} from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import Footer1 from "../../components/_footers/footer1";

function Dashboard() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  return (
    <div className="bg-white text-black min-h-screen min-w-screen flex flex-col">
      {/* Top */}
      <div className="bg-gray-200 w-full flex-1 flex flex-col sm:flex-row">
        {/* Sidebar */}
        <div className="bg-white w-full sm:w-64 p-6 shadow-md">
          {/* Logo */}
          <div className="flex items-center justify-between sm:justify-start mb-6">
            <img src="/rect19.png" alt="Logo" className="h-16 w-auto" />
            <button
              onClick={toggleMobileNav}
              className="sm:hidden focus:outline-none text-gray-600"
              aria-label="Toggle Navigation"
            >
              {isMobileNavOpen ? <HiX size={28} /> : <HiMenu size={28} />}
            </button>
          </div>
          {/* Navigation */}
          <div
            className={`${
              isMobileNavOpen ? "block" : "hidden"
            } sm:block flex flex-col sm:flex-1`}
          >
            <div className="flex flex-col space-y-4 my-5">
              <div className="flex items-center space-x-2 text-gray-700 hover:text-blue-500 cursor-pointer">
                <FaHome size={20} />
                <span>Home</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700 hover:text-blue-500 cursor-pointer">
                <FaTasks size={20} />
                <span>Workspace</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700 hover:text-blue-500 cursor-pointer">
                <FaUsers size={20} />
                <span>Teams</span>
              </div>
            </div>
            <hr />
            <div className="flex flex-col space-y-4 my-5">
              <div className="flex items-center space-x-2 text-gray-700 hover:text-blue-500 cursor-pointer">
                <FaUserCircle size={20} />
                <span>Profile</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700 hover:text-blue-500 cursor-pointer">
                <FaCog size={20} />
                <span>Settings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="w-full flex flex-col">
          {/* Top Bar */}
          <div className="bg-gray-200 w-full p-4 flex items-center justify-between">
            {/* Universal Search Bar */}
            <div className="flex items-center bg-white p-2 rounded-lg w-1/2 shadow-sm">
              <FaSearch size={20} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="outline-none ml-2 w-full bg-transparent text-gray-600"
              />
            </div>
            {/* Profile & Logout */}
            <div className="flex items-center space-x-4">
              <FaUserCircle
                size={30}
                className="text-gray-600 cursor-pointer"
              />
              <div className="text-gray-600 cursor-pointer">Logout</div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white mt-auto">
        <Footer1 />
      </div>
    </div>
  );
}

export default Dashboard;
