import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminContent } from "./AdminContent";
import type { AdminMenuGroups } from "./assembleModules";

interface AdminLayoutProps {
  children: ReactNode;
  onLogout: () => void;
  menuGroups: AdminMenuGroups;
  activeMenuId?: string;
}

export function AdminLayout({ children, onLogout, menuGroups, activeMenuId }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-[#f4f6fa] text-[#263652] md:flex-row">
      <Toaster position="bottom-right" richColors closeButton />
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        menuGroups={menuGroups}
        activeMenuId={activeMenuId}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AdminHeader onLogout={onLogout} />
        <AdminContent>{children}</AdminContent>
      </div>
    </div>
  );
}
