import React from "react";
import Admin from "../pages/app/admin";
import Users from "../pages/app/admin-pages/users";
import PublicTeams from "../pages/app/admin-pages/public-teams";

const adminRoutes = {
  path: "/admin",
  element: <Admin />,
  children: [
    {
      path: "users",
      element: <Users />,
    },
    {
      path: "public-teams",
      element: <PublicTeams />,
    },
  ],
};

export default adminRoutes;
