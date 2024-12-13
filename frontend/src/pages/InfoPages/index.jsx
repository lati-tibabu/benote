import React from "react";
import { Outlet } from "react-router-dom";

function Info() {
  return (
    <div className="bg-white text-black">
      <Outlet />
    </div>
  );
}

export default Info;
