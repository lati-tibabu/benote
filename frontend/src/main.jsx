import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { RouterProvider } from "react-router-dom";
import router from "./routers/index.jsx";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import { GoogleOAuthProvider } from "@react-oauth/google";
import PomodoroManager from "./utils/pomodoro-manager.jsx";
import DarkReaderManager from "./utils/darkreader.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>{/* <App /> */}</StrictMode>
  <StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider>
        <PomodoroManager />
        <DarkReaderManager />
        <RouterProvider router={router} />
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>
);
