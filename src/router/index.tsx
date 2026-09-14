import { createBrowserRouter } from "react-router";
import BarPage from "../pages/BarPage";
import CandyHousePage from "../pages/CandyHousePage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import SplashPage from "../pages/SplashPage";
import VotePage from "../pages/VotePage";
import WishBoxPage from "../pages/WishBoxPage";
import XiaoYiPage from "../pages/XiaoYiPage";

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
    path: "/xiaoyi",
    element: <XiaoYiPage />,
  },
  {
    path: "/candy-house",
    element: <CandyHousePage />,
  },
  {
    path: "/wish-box",
    element: <WishBoxPage />,
  },
  {
    path: "/bar",
    element: <BarPage />,
  },
  {
    path: "/vote",
    element: <VotePage />,
  },
]);

export default router;
