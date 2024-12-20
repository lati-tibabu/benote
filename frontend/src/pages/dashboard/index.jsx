import React from "react";
import { Outlet } from "react-router-dom";
import {
  FaHome,
  FaTasks,
  FaUsers,
  FaCog,
  FaSearch,
  FaUserCircle,
} from "react-icons/fa";
import Footer1 from "../../components/_footers/footer1";

function Dashboard() {
  return (
    <div className="bg-white text-black min-h-screen min-w-screen flex flex-col">
      {/* top */}
      <div className="bg-gray-200 w-full flex-1 flex flex-row">
        {/* sidebar */}
        <div className="bg-white w-64 p-6 shadow-md">
          <div className="flex items-center justify-start mb-6">
            {/* Logo */}
            <img src="/rect19.png" alt="Logo" className="h-16 w-auto" />
          </div>
          <hr />
          {/* navigations */}
          <div className="flex flex-col justify-between">
            <div className="flex flex-col space-y-4 my-5">
              {/* Navigation Menu */}
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
        {/* body */}
        <div className="w-full flex flex-col">
          {/* top */}
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
            {/* Profile Icon */}
            <div className="flex items-center space-x-4">
              <FaUserCircle
                size={30}
                className="text-gray-600 cursor-pointer"
              />
              <div className="text-gray-600 cursor-pointer">Logout</div>
            </div>
          </div>

          {/* main */}
          <div className="flex-1 p-6">
            {/* Child will append here */}
            <Outlet />
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="bg-gray-800 text-white mt-auto">
        <Footer1 />
      </div>
    </div>
  );
}

export default Dashboard;
