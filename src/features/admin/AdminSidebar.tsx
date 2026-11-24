import { Link, matchPath, useLocation } from "react-router";
import brandLogo from "../../assets/admin/title-shadow.svg";
import type { AdminMenuGroups } from "./assembleModules";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  menuGroups: AdminMenuGroups;
  activeMenuId?: string;
}

export function AdminSidebar({
  collapsed,
  onToggle,
  menuGroups,
  activeMenuId,
}: AdminSidebarProps) {
  const { pathname } = useLocation();
  const isCurrentPage = (path: string) =>
    matchPath({ path, end: true }, pathname) !== null;
  const isHome = isCurrentPage("/admin");
  const labelClass = collapsed ? "md:sr-only" : "";
  function linkClass(active: boolean) {
    return `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#4168a1] ${active ? "bg-[#eaf0f9] text-[#31578d]" : "text-[#536781] hover:bg-[#edf2f8]"} ${collapsed ? "md:justify-center" : ""}`;
  }

  return (
    <aside
      className={`shrink-0 border-b border-[#dce3ed] bg-white md:flex md:h-full md:flex-col md:border-r md:border-b-0 ${collapsed ? "md:w-20" : "md:w-60"}`}
    >
      <div
        className={`flex min-h-16 items-center justify-between gap-3 px-4 md:min-h-20 ${collapsed ? "md:flex-col md:justify-start md:gap-2 md:pt-4" : ""}`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-label="Xiaoyi 管理后台"
            className={`hidden size-10 shrink-0 place-items-center rounded-xl bg-[#344f7d] text-lg font-semibold text-white ${collapsed ? "md:grid" : ""}`}
          >
            XY
          </span>
          <img
            src={brandLogo}
            alt="Xiaoyi 管理后台"
            className={`h-14 w-auto max-w-full object-contain ${collapsed ? "md:hidden" : ""}`}
          />
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
          aria-expanded={!collapsed}
          aria-controls="admin-sidebar-navigation"
          className="hidden size-11 shrink-0 items-center justify-center rounded-lg text-[#536781] hover:bg-[#edf2f8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4168a1] md:flex"
        >
          <span aria-hidden="true" className="text-3xl leading-none">
            {collapsed ? "›" : "‹"}
          </span>
        </button>
      </div>
      <nav
        id="admin-sidebar-navigation"
        aria-label="后台导航"
        className="max-h-[35dvh] overflow-y-auto px-3 pb-3 md:max-h-none md:min-h-0 md:pt-4"
      >
        <Link
          to="/admin"
          aria-current={isHome ? "page" : undefined}
          className={linkClass(isHome)}
        >
          <span aria-hidden="true" className="text-lg">
            ⌂
          </span>
          <span className={labelClass}>后台首页</span>
        </Link>
        {menuGroups.map((group) => (
          <section
            key={group.id}
            aria-labelledby={`admin-menu-group-${group.id}`}
            className="mt-4"
          >
            <h2
              id={`admin-menu-group-${group.id}`}
              className={`px-3 pb-1 text-xs font-semibold text-[#687991] ${labelClass}`}
            >
              {group.label}
            </h2>
            <ul className="space-y-1">
              {group.links.map((link) => (
                <li key={link.id}>
                  <Link
                    to={link.to}
                    aria-current={isCurrentPage(link.to) ? "page" : undefined}
                    title={collapsed ? link.label : undefined}
                    className={linkClass(activeMenuId === link.id)}
                  >
                    <span aria-hidden="true" className="text-lg">
                      {link.icon ?? "◇"}
                    </span>
                    <span className={`min-w-0 truncate ${labelClass}`}>
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </aside>
  );
}
