import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./routers/index.jsx";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import { GoogleOAuthProvider } from "@react-oauth/google";
import PomodoroManager from "./utils/pomodoro-manager.jsx";
import DarkReaderManager from "./utils/darkreader.jsx";
import SocketHandler from "./utils/socketHandler.jsx";
import NotificationScheduler from "./utils/NotificationScheduler.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>{/* <App /> */}</StrictMode>
  <StrictMode>
    <Provider store={store}>
      <DarkReaderManager />
      <SocketHandler />
      <GoogleOAuthProvider>
        <PomodoroManager />
        {/* <NotificationScheduler> */}
        <RouterProvider router={router} />
        {/* </NotificationScheduler> */}
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>
);
