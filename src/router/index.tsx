import { createBrowserRouter } from "react-router";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/Login";
import PolicyPage from "../pages/PolicyPage";
import SplashPage from "../pages/SplashPage";
import XiaoYiPage from "../pages/XiaoYiPage";

const router = createBrowserRouter([
  { path: "/terms", element: <PolicyPage kind="terms" /> },
  { path: "/privacy", element: <PolicyPage kind="privacy" /> },
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
  {
    path: "/xiaoyi",
    element: <XiaoYiPage />,
  },
]);

export default router;
