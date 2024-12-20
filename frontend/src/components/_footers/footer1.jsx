import React from "react";
import { Link } from "react-router-dom";

function Footer1() {
  return (
    <>
      <footer className="mt-auto bg-white shadow-md p-5 w-full">
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
    </>
  );
}

export default Footer1;
