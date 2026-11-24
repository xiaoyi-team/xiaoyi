import { Link } from "react-router";
import type { AdminModuleLink } from "./assembleModules";
import { AdminEmptyState } from "./shared/AdminEmptyState";
import { AdminPageHeader } from "./shared/AdminPageHeader";

export function AdminHome({ modules }: { modules: readonly AdminModuleLink[] }) {
  return (
    <section>
      <AdminPageHeader title="后台首页" description="欢迎使用 Xiaoyi 管理后台。" />
      {modules.length > 0 ? (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {modules.map((module) => (
            <li key={module.id}>
              <Link to={module.to} className="block rounded-xl border border-[#dce3ed] bg-white p-4 font-medium text-[#31578d] hover:bg-[#edf2f8] focus-visible:outline-2 focus-visible:outline-offset-2">
                {module.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8">
          <AdminEmptyState title="暂无业务模块" description="业务模块接入后将在这里显示。" icon="◇" />
        </div>
      )}
    </section>
  );
}
