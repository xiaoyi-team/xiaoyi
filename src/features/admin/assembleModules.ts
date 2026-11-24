import type { AdminModule, AdminRoute } from "./moduleContract";

export interface AdminMenuLink {
  id: string;
  label: string;
  to: string;
  icon?: string;
}

interface AdminMenuGroup {
  id: string;
  label: string;
  links: AdminMenuLink[];
}

export interface AdminModuleLink {
  id: string;
  label: string;
  to: string;
}

const localId = (value: unknown) => typeof value === "string" && /^[a-z][a-z0-9-]*$/.test(value);
const pathSegment = /^(?:[a-z0-9][a-z0-9-]*|:[a-zA-Z_][a-zA-Z0-9_]*)$/;

function fail(moduleId: string, reason: string): never {
  throw new Error(`Invalid admin module "${moduleId}": ${reason}`);
}

export function assembleModules(modules: readonly AdminModule[]) {
  const moduleIds = new Set<string>();
  const menuIds = new Set<string>();
  const menuGroups = new Map<string, AdminMenuGroup>();
  const moduleLinks: AdminModuleLink[] = [];

  const mountedRoutes = modules.flatMap(({ id, label, routes, menu }) => {
    if (!localId(id)) fail(id, "invalid module ID");
    if (moduleIds.has(id)) fail(id, "duplicate module ID");
    if (!label.trim()) fail(id, "module label is empty");
    moduleIds.add(id);

    const routesById = new Map<string, AdminRoute>();
    const pathPatterns = new Set<string>();
    const mountedPath = (route: AdminRoute) => route.index ? id : `${id}/${route.path}`;

    for (const route of routes) {
      const routeId = route.id;
      if (!localId(routeId)) fail(id, `invalid route ID "${routeId}"`);
      if (routesById.has(route.id)) fail(id, `duplicate route ID "${route.id}"`);
      if (typeof route.loadPage !== "function") fail(id, `invalid page loader for "${route.id}"`);
      if (route.index === true && route.path !== undefined) fail(id, `index route "${routeId}" also declares a path`);

      // Allow literal segments and required named parameters only.
      const segments = route.index ? [] : route.path?.split("/");
      if (!segments || segments.some((segment) => !pathSegment.test(segment))) {
        fail(id, `invalid relative path for "${route.id}"`);
      }
      const parameters = segments.filter((segment) => segment.startsWith(":"));
      if (new Set(parameters).size !== parameters.length) fail(id, `duplicate path parameter in "${route.id}"`);
      const pattern = segments.map((segment) => segment.startsWith(":") ? ":" : segment).join("/");
      if (pathPatterns.has(pattern)) fail(id, `duplicate route path pattern for "${route.id}"`);
      pathPatterns.add(pattern);
      routesById.set(route.id, route);
    }

    const menuByRoute = new Map<string, string>();
    for (const item of menu) {
      if (!localId(item.id)) fail(id, `invalid menu ID "${item.id}"`);
      const key = `${id}:${item.id}`;
      // Valid module and menu IDs cannot contain the separator.
      if (menuIds.has(key)) fail(id, `duplicate menu ID "${item.id}" (final ID "${key}")`);
      menuIds.add(key);

      const route = routesById.get(item.routeId);
      if (!route) fail(id, `menu "${item.id}" references unknown local route "${item.routeId}"`);
      if (route.path?.includes(":")) fail(id, `menu "${item.id}" requires route parameters`);
      if (menuByRoute.has(route.id)) fail(id, `multiple menus point to route "${route.id}"`);
      menuByRoute.set(route.id, key);

      if (!localId(item.groupId)) fail(id, `invalid group ID "${item.groupId}"`);
      const groupLabel = item.groupLabel ?? item.groupId;
      if (!item.label.trim() || !groupLabel.trim()) fail(id, `empty menu or group label for "${item.id}"`);
      const group = menuGroups.get(item.groupId) ?? { id: item.groupId, label: groupLabel, links: [] };
      if (group.label !== groupLabel) fail(id, `conflicting labels for group "${item.groupId}"`);
      group.links.push({ id: key, label: item.label, to: `/admin/${mountedPath(route)}`, icon: item.icon });
      menuGroups.set(group.id, group);
    }

    const entry = routes.find((route) => route.index) ?? routes.find((route) => !route.path?.includes(":"));
    if (!entry) fail(id, "module needs an index or static route for its home link");
    moduleLinks.push({ id, label, to: `/admin/${mountedPath(entry)}` });

    return routes.map((route) => {
      const ownMenuId = menuByRoute.get(route.id);
      const activeMenuId = route.activeMenuId === undefined ? ownMenuId : `${id}:${route.activeMenuId}`;
      if (activeMenuId !== undefined && !menuIds.has(activeMenuId)) {
        fail(id, `route "${route.id}" references unknown local menu "${route.activeMenuId}"`);
      }
      if (ownMenuId && ownMenuId !== activeMenuId) fail(id, `route "${route.id}" conflicts with its own menu`);
      return { path: mountedPath(route), loadPage: route.loadPage, activeMenuId };
    });
  });

  return { routes: mountedRoutes, menuGroups: [...menuGroups.values()], moduleLinks };
}

export type AdminMenuGroups = ReturnType<typeof assembleModules>["menuGroups"];
