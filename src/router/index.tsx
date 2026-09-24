import { createBrowserRouter } from "react-router";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import SplashPage from "../pages/SplashPage";
import WishBoxPage from "../pages/WishBoxPage";

const router = createBrowserRouter([
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
    path: "/wish-box",
    element: <WishBoxPage />,
  },
]);

export default router;
