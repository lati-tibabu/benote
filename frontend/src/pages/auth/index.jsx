import React from "react";
import { Outlet } from "react-router-dom";

function AuthPages() {
  return (
    <>
      <h2>SPH</h2>
      <Outlet />
    </>
  );
}

export default AuthPages;
