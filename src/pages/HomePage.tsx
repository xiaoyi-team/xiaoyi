import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";

function HomePage() {
  const { isLogin, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError(false);
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      setLogoutError(true);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-3xl font-bold">首页地图</h1>
      {isLogin || loggingOut ? (
        <button className="absolute right-6 top-6 rounded border px-4 py-2" type="button" disabled={loggingOut} onClick={() => void handleLogout()}>
          {loggingOut ? "退出中…" : "退出登录"}
        </button>
      ) : !isLoading && (
        <Link className="absolute right-6 top-6 rounded border px-4 py-2" to="/login">登录</Link>
      )}
      {logoutError && <p role="status" className="absolute right-6 top-20">已退出本地登录，服务器未确认退出。</p>}
    </main>
  );
}

export default HomePage;
