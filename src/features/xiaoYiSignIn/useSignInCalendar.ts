import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/AuthContext";
import { getSignInCalendar, isValidSignCalendarMonth, type SignCalendarResponse } from "./sign-in-calendar";

export const CALENDAR_QUERY_PREFIX = ["xiaoYiSignIn", "calendar"] as const;

export type SignInCalendarView =
  | { kind: "initializing" }
  | { kind: "guest" }
  | { kind: "invalid-month" }
  | { kind: "loading" }
  | { kind: "error"; retry: () => void }
  | { kind: "ready"; data: SignCalendarResponse; refreshing: boolean };

// Mount once in the formal page. DEV components do not call this hook.
export function useSignInCalendar(yearMonth: string): SignInCalendarView {
  const { initializing, isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  // Includes observable auth transitions, not an assumed uid or session-id field.
  const session = useMemo(
    () => ({ initializing, isAuthenticated, user }),
    [initializing, isAuthenticated, user],
  );
  const [preparedSession, setPreparedSession] = useState<typeof session | null>(null);
  const validMonth = isValidSignCalendarMonth(yearMonth);
  const enabled = preparedSession === session && !initializing && isAuthenticated && user !== null && validMonth;
  const query = useQuery({
    queryKey: [...CALENDAR_QUERY_PREFIX, yearMonth],
    queryFn: async ({ signal }) => ({
      calendar: await getSignInCalendar({ yearMonth }, signal),
      owner: session,
    }),
    enabled,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: false,
  });

  useEffect(() => {
    let active = true;
    async function prepareSession() {
      await queryClient.cancelQueries({ queryKey: CALENDAR_QUERY_PREFIX });
      if (!active) return;
      queryClient.removeQueries({ queryKey: CALENDAR_QUERY_PREFIX });
      if (active) setPreparedSession(session);
    }
    void prepareSession();
    return () => {
      active = false;
      // Identity change or page unmount clears every month, but not stat/other queries.
      void queryClient.cancelQueries({ queryKey: CALENDAR_QUERY_PREFIX });
      queryClient.removeQueries({ queryKey: CALENDAR_QUERY_PREFIX });
    };
  }, [queryClient, session]);

  if (initializing) return { kind: "initializing" };
  if (!isAuthenticated) return { kind: "guest" };
  if (!validMonth) return { kind: "invalid-month" };
  // AuthContext has no session id: unknown profiles must wait rather than share data.
  if (!enabled) return { kind: "loading" };
  if (query.isError) return { kind: "error", retry: () => { void query.refetch(); } };
  if (!query.data || query.data.owner !== session) return { kind: "loading" };
  return { kind: "ready", data: query.data.calendar, refreshing: query.isFetching };
}
