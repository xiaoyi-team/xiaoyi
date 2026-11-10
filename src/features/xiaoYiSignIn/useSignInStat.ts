import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/AuthContext";
import { getSignInStat } from "./sign-in-stat";

const STAT_QUERY_KEY = ["xiaoYiSignIn", "stat"] as const;

export type SignInStatView =
  | { kind: "initializing" }
  | { kind: "guest" }
  | { kind: "loading" }
  | { kind: "error"; retry: () => void }
  | { kind: "ready"; totalDays: number };

export function useSignInStat(): SignInStatView {
  const { initializing, isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  // CurrentUser may be a string or an object; uid alone is not a session identity.
  const session = useMemo(
    () => ({ initializing, isAuthenticated, user }),
    [initializing, isAuthenticated, user],
  );
  const [preparedSession, setPreparedSession] = useState<typeof session | null>(null);
  // Unknown profiles cannot distinguish accounts with the current AuthContext contract.
  const enabled = preparedSession === session && !initializing && isAuthenticated && user !== null;
  const query = useQuery({
    queryKey: STAT_QUERY_KEY,
    queryFn: async ({ signal }) => ({
      stat: await getSignInStat(signal),
      owner: session,
    }),
    enabled,
    refetchOnMount: "always",
    gcTime: 0,
    retry: false,
  });

  useEffect(() => {
    let active = true;
    async function prepareSession() {
      // Keep the observer disabled until cancellation and data/error reset finish.
      await queryClient.cancelQueries({ queryKey: STAT_QUERY_KEY, exact: true });
      if (!active) return;
      await queryClient.resetQueries({ queryKey: STAT_QUERY_KEY, exact: true });
      if (active) setPreparedSession(session);
    }
    void prepareSession();
    return () => {
      active = false;
      void queryClient.cancelQueries({ queryKey: STAT_QUERY_KEY, exact: true });
    };
  }, [queryClient, session]);

  if (initializing) return { kind: "initializing" };
  if (!isAuthenticated) return { kind: "guest" };
  if (!enabled) return { kind: "loading" };
  if (query.isError) return { kind: "error", retry: () => { void query.refetch(); } };
  if (query.isFetching || !query.data || query.data.owner !== session) return { kind: "loading" };
  return { kind: "ready", totalDays: query.data.stat.total_days };
}
