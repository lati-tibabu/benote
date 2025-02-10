import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaTasks,
  FaUsers,
  FaCog,
  FaSearch,
  FaUserCircle,
  FaBell,
  FaPowerOff,
} from "react-icons/fa";
import { AiOutlineClose, AiOutlineFolder } from "react-icons/ai";
import { HiMenu, HiX } from "react-icons/hi";
import Footer1 from "../../components/_footers/footer1";
import { jwtDecode } from "jwt-decode";

function Dashboard() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("jwt");
  // const [userData, setUserData] = useState({});
  var userData;
  try {
    userData = jwtDecode(token);
  } catch (error) {
    console.error(error);
  }
  // console.log("hey", userData);
  const loc = location.pathname.split("/").slice(2);

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("jwt_expiration");
    navigate("/auth/login");
  };

  return (
    <div className="bg-white text-black min-h-screen flex flex-col items-stretch">
      {/* Top */}
      <div className="bg-gray-200 w-full min-h-screen flex-1 flex flex-col sm:flex-row overflow-x-scroll">
        {/* Sidebar */}
        <div className="bg-white w-full sm:w-64 p-6 shadow-md border-r-2 border-black">
          {/* Logo */}
          <div className="flex items-center justify-between sm:justify-start mb-6">
            <div
              className="flex gap-2 text-xs font-bold items-center text-center"
              title="The app name"
            >
              <img src="/rect19.png" alt="Logo" className="h-12 w-auto" />
              <span>Student Productivity Hub</span>
            </div>
            <button
              onClick={toggleMobileNav}
              className="sm:hidden focus:outline-none text-gray-600"
              aria-label="Toggle Navigation"
            >
              {isMobileNavOpen ? <HiX size={28} /> : <HiMenu size={28} />}
            </button>
          </div>
          <hr className="hidden md:block h-1/2 rounded-md bg-gray-800" />
          {/* Navigation */}
          <div
            className={`${
              isMobileNavOpen ? "block" : "hidden"
            } sm:block flex flex-col sm:flex-1`}
          >
            <div className="flex flex-col space-y-4 my-5">
              <Link to={"home"}>
                <div className="flex items-center space-x-2 hover:text-blue-500 cursor-pointer">
                  <FaHome size={20} />
                  <span>Home</span>
                </div>
              </Link>
              <Link to={"workspace"}>
                <div className="flex items-center space-x-2 hover:text-blue-500 cursor-pointer">
                  <FaTasks size={20} />
                  <span>Workspace</span>
                </div>
              </Link>
              <Link to={"team"}>
                <div className="flex items-center space-x-2 hover:text-blue-500 cursor-pointer">
                  <FaUsers size={20} />
                  <span>Teams</span>
                </div>
              </Link>
            </div>
            <hr />
            <div className="flex flex-col space-y-4 my-5 text-black">
              <Link to={"profile"}>
                <div className="flex items-center space-x-2 hover:text-blue-500 cursor-pointer">
                  <FaUserCircle size={20} />
                  <span>Profile</span>
                </div>
              </Link>
              <Link to={"notification"}>
                <div className="flex items-center space-x-2 hover:text-blue-500 cursor-pointer">
                  <FaBell size={20} />
                  <span>Notification</span>
                </div>
              </Link>
              <Link to={"setting"}>
                <div className="flex items-center space-x-2 hover:text-blue-500 cursor-pointer">
                  <FaCog size={20} />
                  <span>Setting</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="w-full flex flex-col">
          {/* Top Bar */}
          <div className="bg-gray-800 w-full p-4 flex items-center justify-between">
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
            <div className="flex dropdown dropdown-end items-center gap-2">
              <strong className="text-white font-bold">
                {userData.email.split("@")[0]}
              </strong>
              <label tabIndex={0} className="cursor-pointer">
                <FaUserCircle size={30} className="text-white" />
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 text-white"
              >
                <li>
                  <button
                    className="flex items-center gap-2"
                    onClick={handleLogout}
                  >
                    {/* <FaBell size={20} /> */}
                    <FaPowerOff /> Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 bg-white h-2">
            {/* breadcrumb */}
            <div className="h-full">
              <div className="breadcrumbs text-sm">
                <ul>
                  {loc.map((l) => (
                    // <Link to={l}>
                    <li className="flex items-center gap-1 justify-center">
                      <AiOutlineFolder size={20} />
                      <a className="font-bold text-xs">
                        {l.toLocaleUpperCase()}
                      </a>
                    </li>
                    // </Link>
                  ))}
                </ul>
              </div>
              <div className="h-full">
                <Outlet />
              </div>
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
