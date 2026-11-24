import { CancelledError, type QueryClient } from "@tanstack/react-query";

export function createAdminQueryScope(client: QueryClient, isAuthorized: () => boolean) {
  const id = Array.from(crypto.getRandomValues(new Uint32Array(4)), (part) =>
    part.toString(16).padStart(8, "0")
  ).join("");
  const prefix = ["admin", id] as const;
  let active = true;

  function isCurrent() {
    return active && isAuthorized();
  }

  return {
    id,
    isCurrent,
    key(moduleId: string, resource: string, ...params: readonly unknown[]) {
      return [...prefix, moduleId, resource, ...params] as const;
    },
    async query<T>(signal: AbortSignal, load: (signal: AbortSignal) => Promise<T>): Promise<T> {
      if (!isCurrent() || signal.aborted) throw new CancelledError();
      const result = await load(signal);
      if (!isCurrent() || signal.aborted) throw new CancelledError();
      return result;
    },
    dispose() {
      if (!active) return Promise.resolve();
      active = false;
      const filters = { queryKey: prefix };
      const cancellation = client.cancelQueries(filters, { revert: false });
      client.removeQueries(filters);
      return cancellation;
    },
  };
}

export type AdminQueryScope = Pick<ReturnType<typeof createAdminQueryScope>, "id" | "key" | "isCurrent" | "query">;
