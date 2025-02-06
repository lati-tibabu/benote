import React from "react";
import { Link } from "react-router-dom";

function Footer1() {
  return (
    <>
      <div className="mt-auto bg-white shadow-md p-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src="/rect19.png"
              alt="Logo"
              width={40}
              className="cursor-pointer"
            />
            <p className="text-xs sm:text-md">
              © 2024 Student Productivity Hub
            </p>
          </div>
          <div className="flex gap-5 text-xs sm:text-md">
            <Link to="/info/about" className=" text-blue-700 hover:underline">
              About
            </Link>
            <Link
              to="/info/contact-us"
              className=" text-blue-700 hover:underline"
            >
              Contact
            </Link>
            <Link
              to="/info/privacy-policy"
              className=" text-blue-700 hover:underline"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Footer1;
