import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import GasStationList from './GasStationList.tsx';

import Home from "./pages/Home";
import HomePage from "./pages/HomePage";
import HomeEntrance from "./features/opening/HomeEntrance";
import WishBoxPage from "./pages/WishBoxPage";
import BarPage from "./pages/BarPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "./pages/Login";
import PolicyPage from "./pages/PolicyPage";
import { lazy, Suspense } from "react";

const CandyPage = lazy(() => import("./pages/CandyPage"));
const SchoolVotePage = lazy(() => import("./pages/vote/SchoolVotePage"));
const XiaoYiPage = lazy(() => import("./pages/XiaoYiPage"));
const homeQueryClient = new QueryClient();
function TeamHomePage() {
  return <HomeEntrance><QueryClientProvider client={homeQueryClient}><HomePage /></QueryClientProvider></HomeEntrance>;
}

function App() {
  return (
    <Routes>
      {/* 登录 */}
      <Route
        path="/login"
        element={<Login />}
      />
      <Route path="/terms" element={<PolicyPage kind="terms" />} />
      <Route path="/privacy" element={<PolicyPage kind="privacy" />} />
      <Route path="/pit-signal" element={<GasStationList />} />
      <Route path="/school-vote" element={<Suspense fallback={null}><SchoolVotePage /></Suspense>} />
      <Route path="/xiaoyi" element={<Suspense fallback={null}><XiaoYiPage /></Suspense>} />

      <Route path="/candy" element={<Suspense fallback={null}><CandyPage /></Suspense>} />

      {/* 登录后主页 */}
      <Route
        path="/"
        element={<TeamHomePage />}
      />

      <Route path="/home" element={<TeamHomePage />} />
      <Route path="/account" element={<Home />} />
      <Route path="/wish-box" element={<WishBoxPage />} />
      <Route path="/bar" element={<BarPage />} />

      {/* 未匹配路由 */}
      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;
