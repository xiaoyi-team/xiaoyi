import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/AuthContext";
import { getSignInAwardList, type SignInAward } from "./sign-in-award-list";

export const AWARD_LIST_QUERY_KEY = ["xiaoYiSignIn", "awardList"] as const;

export type SignInAwardListView =
  | { kind: "loading" }
  | { kind: "error"; retry: () => void }
  | { kind: "ready"; awards: SignInAward[]; retry?: () => void };

export function useSignInAwardList(): SignInAwardListView {
  const { initializing, isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const session = useMemo(
    () => ({ initializing, isAuthenticated, user }),
    [initializing, isAuthenticated, user],
  );
  const [preparedSession, setPreparedSession] = useState<typeof session | null>(null);
  const enabled = preparedSession === session && !initializing && isAuthenticated && user !== null;
  const query = useQuery({
    queryKey: AWARD_LIST_QUERY_KEY,
    queryFn: async ({ signal }) => ({
      awards: await getSignInAwardList(signal),
      owner: session,
    }),
    enabled,
    gcTime: 0,
    retry: false,
  });

  useEffect(() => {
    let active = true;
    const filter = { queryKey: AWARD_LIST_QUERY_KEY, exact: true };
    async function prepareSession() {
      await queryClient.cancelQueries(filter);
      if (!active) return;
      await queryClient.resetQueries(filter);
      if (active) setPreparedSession(session);
    }
    void prepareSession();
    return () => {
      active = false;
      void queryClient.cancelQueries(filter);
    };
  }, [queryClient, session]);

  if (!enabled) return { kind: "loading" };
  const retry = () => { void query.refetch(); };
  if (query.data?.owner === session) {
    return { kind: "ready", awards: query.data.awards, retry: query.isError ? retry : undefined };
  }
  return query.isError && !query.isFetching ? { kind: "error", retry } : { kind: "loading" };
}
