import { createBrowserRouter } from "react-router";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/Login";
import PolicyPage from "../pages/PolicyPage";
import SplashPage from "../pages/SplashPage";

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
    hydrateFallbackElement: <p>正在加载萧逸家…</p>,
    lazy: async () => {
      const { default: Component } = await import("../pages/XiaoYiPage");
      return { Component };
    },
  },
]);

export default router;
