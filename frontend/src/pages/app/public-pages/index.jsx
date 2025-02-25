import React from "react";
import { Outlet, useLocation } from "react-router-dom";

const Public = () => {
  const location = useLocation();
  const loc = location.pathname.endsWith("public");
  //   console.log(loc.endsWith("public"));

  return loc ? <div>Public</div> : <Outlet />;
};

export default Public;
