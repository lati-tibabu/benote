import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { RouterProvider } from "react-router-dom";
import router from "./routers/index.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>{/* <App /> */}</StrictMode>
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
