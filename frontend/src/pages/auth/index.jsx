import React from "react";
import { Link, Outlet } from "react-router-dom";
import { AiOutlineInfo } from "react-icons/ai";

function AuthPages() {
  return (
    <div className="bg-white min-h-screen text-black flex flex-col">
      {/* header */}
      <div className="p-5 justify-between flex flex-row items-center shadow-md sticky top-0 z-10 bg-white">
        <div className="flex flex-row items-center gap-3">
          <img src="/rect19.png" alt="" width={40} className="cursor-pointer" />
          <p>Student Productivity Hub</p>
        </div>
        <Link to={"/info"}>
          <div className="cursor-pointer bg-black rounded-full p-2">
            <AiOutlineInfo color="white" />
          </div>
        </Link>
      </div>
      <div className="mx-auto my-10 shadow-lg bg-gray-100 rounded-lg">
        <Outlet />
      </div>
      {/* footer */}
      <footer className="mt-auto bg-white shadow-md p-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src="/rect19.png"
              alt="Logo"
              width={40}
              className="cursor-pointer"
            />
            <p className="text-sm">© 2024 Student Productivity Hub</p>
          </div>
          <div className="flex gap-5">
            <Link
              to="/info/about"
              className="text-sm text-blue-700 hover:underline"
            >
              About
            </Link>
            <Link
              to="/info/contact-us"
              className="text-sm text-blue-700 hover:underline"
            >
              Contact
            </Link>
            <Link
              to="/info/privacy-policy"
              className="text-sm text-blue-700 hover:underline"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AuthPages;
