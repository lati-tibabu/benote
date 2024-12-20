import React from "react";
import Dashboard from "../pages/dashboard";
import Home from "../pages/dashboard/contents/home";

const dashboardRoutes = {
  path: "/app",
  element: <Dashboard />,
  children: [
    { path: "home", element: <Home /> },
    { path: "profile", element: <div>Profile</div> },
    { path: "settings", element: <div>Settings</div> },
    { path: "calendar", element: <div>Calendar</div> },
  ],
};

export default dashboardRoutes;
