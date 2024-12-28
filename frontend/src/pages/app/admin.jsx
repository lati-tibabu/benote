import React from "react";
import { Link, Outlet } from "react-router-dom";
import {} from "react-icons/ai";
import { FaObjectGroup, FaTeamspeak, FaTelegram, FaUser } from "react-icons/fa";
import Footer1 from "../../components/_footers/footer1";

const Admin = () => {
  return (
    <div className="bg-white text-black min-h-screen">
      <div className="p-3 flex flex-row items-center justify-between">
        <div className="flex flex-row gap-2 items-center">
          <div>
            <img src="/rect19.png" width={36} alt="" />
          </div>
          <h1 className="text-xl font-extrabold">Admin Panel</h1>
        </div>
        <div>
          <ul className="flex flex-row gap-2">
            <Link to={"users"}>
              <li className="cursor-pointer hover:text-blue-800 flex items-center gap-1 p-2 hover:bg-blue-200 rounded-sm">
                <FaUser />
                Users
              </li>
            </Link>
            <Link to={"public-teams"}>
              <li className="cursor-pointer hover:text-blue-800 flex items-center gap-1 p-2 hover:bg-blue-200 rounded-sm">
                <FaTelegram />
                Public Teams
              </li>
            </Link>
          </ul>
        </div>
        <button className="btn">more</button>
      </div>
      <hr />
      <div className="w-1/2 mx-auto min-h-screen">
        <Outlet />
      </div>
      <div className="mb-0">
        <Footer1 />
      </div>
    </div>
  );
};

export default Admin;
