import { createBrowserRouter } from "react-router";
import BarPage from "../pages/BarPage";
import CandyHousePage from "../pages/CandyHousePage";
import GasStationListPage from "../pages/GasStationListPage";
import HomePage from "../pages/HomePage";
import Login from "../pages/Login";
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
    element: <Login />,
  },
  {
    path: "/home",
    element: <HomePage />,
  },
  {
    path: "/xiao-yi",
    element: <XiaoYiPage />,
  },
  {
    path: "/Osborn-acheive",
    element: <CandyHousePage />,
  },
  {
    path: "/GasStationList",
    element: <GasStationListPage />,
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
