import React from "react";

import Login from "../pages/auth/login";
import SignUp from "../pages/auth/signup";
import AuthPages from "../pages/auth/index";
import AuthLoading from "../pages/auth/auth-loading";

const authRoutes = {
  path: "/auth",
  element: <AuthPages />,
  children: [
    { path: "loading", element: <AuthLoading /> },
    { path: "login", element: <Login /> },
    { path: "signup", element: <SignUp /> },
  ],
};

export default authRoutes;
