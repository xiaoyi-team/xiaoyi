import type { ComponentType } from "react";

export type AdminRoute = {
  id: string;
  loadPage: () => Promise<{ default: ComponentType }>;
  /** Local menu to highlight on a route that has no menu of its own. */
  activeMenuId?: string;
} & ({ index: true; path?: never } | { index?: false; path: string });

export interface AdminMenuItem {
  id: string;
  routeId: string;
  label: string;
  groupId: string;
  groupLabel?: string;
  /** Decorative text glyph. */
  icon?: string;
}

export interface AdminModule {
  id: string;
  label: string;
  routes: readonly AdminRoute[];
  menu: readonly AdminMenuItem[];
}
