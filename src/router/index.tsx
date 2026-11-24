import { createBrowserRouter } from "react-router";
import { AdminEntry } from "../features/admin/AdminEntry";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/Login";
import PolicyPage from "../pages/PolicyPage";
import SplashPage from "../pages/SplashPage";

const router = createBrowserRouter([
  {
    path: "/admin/*",
    element: <AdminEntry />,
    errorElement: (
      <main className="p-6">
        <h1 className="text-xl font-semibold">无法加载管理后台</h1>
        <a className="mt-4 inline-block underline" href="/admin">重新打开后台</a>
      </main>
    ),
  },
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
]);

export default router;
