import React from "react";
import { Link, Outlet } from "react-router-dom";
import { AiOutlineInfo } from "react-icons/ai";
import Footer1 from "../../components/_footers/footer1";

function AuthPages() {
  return (
    <div className="bg-white min-h-screen text-black flex flex-col">
      {/* header */}
      <div className="p-5 justify-between flex flex-row items-center shadow-md sticky top-0 z-10 bg-white">
        <div className="flex flex-row items-center gap-3">
          <Link to="/">
            <img
              src="/rect19.png"
              alt=""
              width={40}
              className="cursor-pointer"
            />
          </Link>
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
      <Footer1 />
    </div>
  );
}

export default AuthPages;
