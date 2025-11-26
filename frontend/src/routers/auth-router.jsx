import React from "react";

// Auth feature
import Login from "../features/auth/pages/login";
import SignUp from "../features/auth/pages/signup";
import AuthPages from "../features/auth/pages/index";
import AuthLoading from "../features/auth/pages/auth-loading";
import ForgotPassword from "../features/auth/pages/forgot-password";
import ResetPassword from "../features/auth/pages/reset-password";
const VerifyUser = React.lazy(() => import("../features/auth/pages/verify-user"));

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
