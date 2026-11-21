import { createBrowserRouter, Navigate } from "react-router";
import { lazy, Suspense } from "react";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/Login";
import WishBoxPage from "../pages/WishBoxPage";
import Home from "../pages/Home";
import HomeEntrance from "../features/opening/HomeEntrance";
import GasStationList from "../GasStationList";
import BarPage from "../pages/BarPage";
import PolicyPage from "../pages/PolicyPage";

const CandyPage = lazy(() => import("../pages/CandyPage"));
const SchoolVotePage = lazy(() => import("../pages/vote/SchoolVotePage"));
const XiaoYiPage = lazy(() => import("../pages/XiaoYiPage"));

function TeamHomePage() {
  return (
    <HomeEntrance>
      <HomePage />
    </HomeEntrance>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <TeamHomePage />,
  },
  {
    path: "/home",
    element: <TeamHomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/terms",
    element: <PolicyPage kind="terms" />,
  },
  {
    path: "/privacy",
    element: <PolicyPage kind="privacy" />,
  },
  {
    path: "/pit-signal",
    element: <GasStationList />,
  },
  {
    path: "/school-vote",
    element: (
      <Suspense fallback={null}>
        <SchoolVotePage />
      </Suspense>
    ),
  },
  {
    path: "/xiaoyi",
    element: (
      <Suspense fallback={null}>
        <XiaoYiPage />
      </Suspense>
    ),
  },
  {
    path: "/candy",
    element: (
      <Suspense fallback={null}>
        <CandyPage />
      </Suspense>
    ),
  },
  {
    path: "/account",
    element: <Home />,
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
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
