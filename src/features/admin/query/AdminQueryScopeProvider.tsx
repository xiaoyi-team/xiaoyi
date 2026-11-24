import { useQueryClient } from "@tanstack/react-query";
import { useLayoutEffect, useState, type ReactNode } from "react";
import { createAdminQueryScope, type AdminQueryScope } from "./adminQueryScope";
import { AdminQueryScopeContext } from "./useAdminQueryScope";

export function AdminQueryScopeProvider({ isAuthorized, children }: {
  isAuthorized: () => boolean;
  children: ReactNode;
}) {
  const client = useQueryClient();
  const [scope, setScope] = useState<AdminQueryScope | null>(null);

  useLayoutEffect(() => {
    const scope = createAdminQueryScope(client, isAuthorized);
    // The scope belongs to this effect setup. StrictMode cleanup must retire it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScope(scope);
    return () => { void scope.dispose(); };
  }, [client, isAuthorized]);

  if (!scope || !scope.isCurrent()) return null;
  return <AdminQueryScopeContext.Provider value={scope}>{children}</AdminQueryScopeContext.Provider>;
}
