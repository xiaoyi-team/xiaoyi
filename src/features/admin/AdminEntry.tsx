import { lazy, Suspense } from "react";

const AdminRoutes = lazy(() => import("./AdminRoutes"));

export function AdminEntry() {
  return (
    <Suspense fallback={<p role="status" className="p-6">正在加载管理后台…</p>}>
      <AdminRoutes />
    </Suspense>
  );
}
