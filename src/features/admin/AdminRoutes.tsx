import { lazy, Suspense } from "react";
import { Link, matchRoutes, useLocation, useRoutes, type RouteObject } from "react-router";
import { AdminHome } from "./AdminHome";
import { AdminLayout } from "./AdminLayout";
import { AdminUIProvider } from "./AdminUIProvider";
import { assembleModules } from "./assembleModules";
import { AdminGuard } from "./auth/AdminGuard";
import { moduleRegistry } from "./moduleRegistry";
import { AdminLoadingState } from "./shared/AdminLoadingState";

const { routes: moduleRoutes, menuGroups, moduleLinks } = assembleModules(moduleRegistry);
const activeMenusByPath = new Map(moduleRoutes.map(({ path, activeMenuId }) => [path, activeMenuId]));
const routes: RouteObject[] = [
  { index: true, element: <AdminHome modules={moduleLinks} /> },
  ...moduleRoutes.map(({ path, loadPage }) => {
    const Page = lazy(loadPage);
    return { path, element: <Page /> };
  }),
  {
    path: "*",
    element: (
      <section>
        <h1 className="text-xl font-semibold">后台页面不存在</h1>
        <Link className="mt-4 inline-block underline" to="/admin">返回后台首页</Link>
      </section>
    ),
  },
];

function AdminPage() {
  return useRoutes(routes);
}

function AdminShell({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const matchedPath = matchRoutes(routes, location, "/admin")?.at(-1)?.route.path;
  const activeMenuId = matchedPath === undefined ? undefined : activeMenusByPath.get(matchedPath);

  return (
    <AdminLayout onLogout={onLogout} menuGroups={menuGroups} activeMenuId={activeMenuId}>
      <Suspense fallback={<AdminLoadingState message="正在加载页面…" />}>
        <AdminPage />
      </Suspense>
    </AdminLayout>
  );
}

export default function AdminRoutes() {
  return <AdminGuard>{(onLogout) => <AdminUIProvider><AdminShell onLogout={onLogout} /></AdminUIProvider>}</AdminGuard>;
}
