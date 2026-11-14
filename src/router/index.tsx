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
  ...(import.meta.env.DEV
    ? [
        {
          path: "/__dev/xiao-yi-sign-in",
          hydrateFallbackElement: <p>正在加载签到预览…</p>,
          lazy: async () => {
            const { default: Component } = await import(
              "../pages/SignInPreviewPage"
            );
            return { Component };
          },
        },
        {
          path: "/__dev/xiao-yi-guest-login",
          hydrateFallbackElement: <p>正在加载游客提示预览…</p>,
          lazy: async () => {
            const { default: Component } = await import(
              "../pages/GuestLoginPreviewPage"
            );
            return { Component };
          },
        },
      ]
    : []),
]);

export default router;
