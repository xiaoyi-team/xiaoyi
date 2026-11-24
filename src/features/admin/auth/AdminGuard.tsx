import { useState, type ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { useAuth } from "../../../auth/AuthContext";
import { isAdminUser } from "../../../auth/adminGrant";
import { buildLoginPath } from "../../../auth/navigation";
import { AdminQueryScopeProvider } from "../query/AdminQueryScopeProvider";

function AccessStatus({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#f4f6fa] p-5 text-[#263652]">
      <section className="w-full max-w-md rounded-xl border border-[#dce3ed] bg-white p-6">
        <h1 className="text-xl font-semibold">{title}</h1>
        {children}
      </section>
    </main>
  );
}

const actionClass = "mt-4 inline-flex min-h-11 items-center rounded-lg px-3 text-[#31578d] underline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60";

export function AdminGuard({ children }: { children: (onLogout: () => void) => ReactNode }) {
  const { sharedIdentityRevision } = useAuth();
  return <AdminAccess key={sharedIdentityRevision}>{children}</AdminAccess>;
}

function AdminAccess({ children }: { children: (onLogout: () => void) => ReactNode }) {
  const { initializing, reconfirmingIdentity, isAuthenticated, user, refreshUser, logout, adminGrant } = useAuth();
  const loginPath = buildLoginPath(useLocation());
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [logoutStatus, setLogoutStatus] = useState<"idle" | "pending" | "failed">("idle");

  async function retryIdentity() {
    if (refreshing) return;
    setRefreshing(true);
    setRefreshFailed(false);
    try {
      await refreshUser();
    } catch {
      setRefreshFailed(true);
    } finally {
      setRefreshing(false);
    }
  }

  async function signOut() {
    if (logoutStatus === "pending") return;
    setLogoutStatus("pending");
    try {
      await logout();
      setLogoutStatus("idle");
    } catch {
      setLogoutStatus("failed");
    }
  }

  if (initializing) {
    return <AccessStatus title={reconfirmingIdentity ? "正在重新确认登录状态" : "正在确认登录状态"}><p role="status">请稍候…</p></AccessStatus>;
  }

  if (logoutStatus === "pending") {
    return <AccessStatus title="正在退出登录"><p role="status">正在等待服务器确认…</p></AccessStatus>;
  }

  if (!isAuthenticated) {
    if (logoutStatus === "failed") {
      return (
        <AccessStatus title="已退出本地登录">
          <p role="alert" className="mt-3">服务器未能确认退出，请稍后再试。</p>
          <Link className={actionClass} to={loginPath} replace>前往登录</Link>
        </AccessStatus>
      );
    }
    return <Navigate to={loginPath} replace />;
  }

  const isAdmin = isAdminUser(user);
  if (user === null || (isAdmin && !adminGrant?.isCurrent())) {
    return (
      <AccessStatus title="暂时无法确认管理员身份">
        {refreshFailed && <p role="alert" className="mt-3">读取用户资料失败，请重试。</p>}
        {refreshing && <p role="status" className="mt-3">正在重新读取用户资料…</p>}
        <button type="button" className={actionClass} disabled={refreshing} onClick={retryIdentity}>重试</button>
      </AccessStatus>
    );
  }

  if (!isAdmin || !adminGrant) {
    return (
      <AccessStatus title="无权访问管理后台">
        <p className="mt-3">此页面仅向管理员开放。</p>
        <Link className={actionClass} to="/home">返回前台</Link>
      </AccessStatus>
    );
  }

  return (
    <AdminQueryScopeProvider key={adminGrant.revision} isAuthorized={adminGrant.isCurrent}>
      {children(signOut)}
    </AdminQueryScopeProvider>
  );
}
