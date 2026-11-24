import { createContext, useContext } from "react";
import type { AdminQueryScope } from "./adminQueryScope";

export const AdminQueryScopeContext = createContext<AdminQueryScope | null>(null);

export function useAdminQueryScope() {
  const scope = useContext(AdminQueryScopeContext);
  if (!scope) throw new Error("后台私有查询必须位于已授权的后台作用域内");
  return scope;
}
