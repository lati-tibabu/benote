import React from "react";

import Dashboard from "../pages/dashboard";

import Home from "../pages/dashboard/contents/Home";
import Workspace from "../pages/dashboard/contents/Workspace";
import Team from "../pages/dashboard/contents/Team";
import Profile from "../pages/dashboard/contents/Profile";
import Setting from "../pages/dashboard/contents/Setting";

import ProtectedRoute from "./protected-routes";
import Notification from "../pages/dashboard/contents/Notification";

const dashboardRoutes = {
  path: "/app",
  // element: <Dashboard />,
  element: <ProtectedRoute component={Dashboard} />,
  children: [
    { path: "home", element: <Home /> },
    { path: "workspace", element: <Workspace /> },
    { path: "team", element: <Team /> },
    { path: "profile", element: <Profile /> },
    { path: "notification", element: <Notification /> },
    { path: "setting", element: <Setting /> },
  ],
};

export default dashboardRoutes;
