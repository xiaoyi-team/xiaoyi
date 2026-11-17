import { createBrowserRouter } from "react-router";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/Login";
import SplashPage from "../pages/SplashPage";
import BarPage from "../pages/BarPage";

const router = createBrowserRouter([
  {
    path: "/bar",
    element: <BarPage />,
  },
  {
    path: "/",
    element: <SplashPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/home",
    element: <HomePage />,
  },
]);

export default router;
