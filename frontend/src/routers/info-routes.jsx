import React from "react";
import AppInfo from "../pages/InfoPages/app-info";
import Info from "../pages/InfoPages";
import PrivacyPolicy from "../pages/InfoPages/privacy-policy";
import Contact from "../pages/InfoPages/contact";

const infoRoutes = {
  path: "/info",
  element: <Info />,
  children: [
    { path: "about", element: <AppInfo /> },
    { path: "privacy-policy", element: <PrivacyPolicy /> },
    { path: "contact-us", element: <Contact /> },
  ],
};

export default infoRoutes;
