import { createBrowserRouter } from "react-router-dom";
import authRoutes from "./auth-router";
import NotFound from "../pages/ErrorPages/notfound";
import appRoutes from "./app-routes";
import infoRoutes from "./info-routes";
import dashboardRoutes from "./dashboard-routes";

const router = createBrowserRouter([
  authRoutes,
  appRoutes,
  infoRoutes,
  dashboardRoutes,
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
