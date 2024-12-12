import { createBrowserRouter } from "react-router-dom";
import authRoutes from "./auth-router";
import NotFound from "../pages/ErrorPages/notfound";
import appRoutes from "./app-routes";

const router = createBrowserRouter([
  authRoutes,
  appRoutes,
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
