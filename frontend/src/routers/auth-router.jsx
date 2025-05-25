import React from "react";

import Login from "../pages/auth/login";
import SignUp from "../pages/auth/signup";
import AuthPages from "../pages/auth/index";
import AuthLoading from "../pages/auth/auth-loading";
import ForgotPassword from "../pages/auth/forgot-password";
import ResetPassword from "../pages/auth/reset-password";
const VerifyUser = React.lazy(() => import("../pages/auth/verify-user"));

const authRoutes = {
  path: "/auth",
  element: <AuthPages />,
  children: [
    { path: "loading", element: <AuthLoading /> },
    { path: "login", element: <Login /> },
    { path: "signup", element: <SignUp /> },
    { path: "verify", element: <VerifyUser /> },
    { path: "forgot-password", element: <ForgotPassword /> },
    { path: "reset-password", element: <ResetPassword /> },
  ],
};

export default authRoutes;
