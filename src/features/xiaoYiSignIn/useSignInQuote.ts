import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import type { SignInCalendarView } from "./useSignInCalendar";
import { getSignInQuoteByDate, isValidSignInQuoteDate, type SignInQuote } from "./sign-in-quote";

const QUOTE_QUERY_PREFIX = ["xiaoYiSignIn", "quoteByDate"] as const;

export type SignInQuoteView =
  | { kind: "idle" }
  | { kind: "initializing" }
  | { kind: "guest" }
  | { kind: "profile-unavailable" }
  | { kind: "loading" }
  | { kind: "calendar-loading" }
  | { kind: "calendar-error" }
  | { kind: "calendar-unavailable" }
  | { kind: "not-signed" }
  | { kind: "today-not-signed" }
  | { kind: "future" }
  | { kind: "no-record" }
  | { kind: "ready"; data: SignInQuote }
  | { kind: "invalid-date" }
  | { kind: "unauthorized" }
  | { kind: "error"; retry: () => void };

type UseSignInQuoteOptions = {
  date: string | null;
  todayDate: string;
  enabled: boolean;
  calendar: SignInCalendarView;
};

export function useSignInQuote({ date, todayDate, enabled: boardOpen, calendar }: UseSignInQuoteOptions): SignInQuoteView {
  const { initializing, isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const session = useMemo(
    () => ({ initializing, isAuthenticated, user }),
    [initializing, isAuthenticated, user],
  );
  const [preparedSession, setPreparedSession] = useState<typeof session | null>(null);
  const validDate = date !== null && isValidSignInQuoteDate(date);
  const isFutureDate = validDate && date > todayDate;
  const selectedMonth = validDate ? date?.slice(0, 7) : undefined;
  const selectedDay = validDate && date !== null ? Number(date.slice(-2)) : null;
  const matchingCalendar = selectedMonth !== undefined && calendar.kind === "ready" &&
    calendar.data.yearMonth === selectedMonth && !calendar.refreshing;
  const calendarRecord = selectedMonth !== undefined && selectedDay !== null && calendar.kind === "ready" &&
    calendar.data.yearMonth === selectedMonth
    ? calendar.data.list.find((item) => item.day === selectedDay)
    : undefined;
  const isSigned = typeof calendarRecord?.is_signed === "boolean" ? calendarRecord.is_signed : null;
  const queryKey = [...QUOTE_QUERY_PREFIX, date ?? "no-date"] as const;
  const queryEnabled = boardOpen && validDate && !isFutureDate &&
    matchingCalendar && isSigned === true && preparedSession === session &&
    !initializing && isAuthenticated && user !== null;

  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }) => ({
      quote: await getSignInQuoteByDate(date!, signal),
      owner: session,
    }),
    enabled: queryEnabled,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: false,
  });

  useEffect(() => {
    let active = true;
    async function prepareSession() {
      await queryClient.cancelQueries({ queryKey: QUOTE_QUERY_PREFIX });
      if (!active) return;
      queryClient.removeQueries({ queryKey: QUOTE_QUERY_PREFIX });
      if (active) setPreparedSession(session);
    }
    void prepareSession();
    return () => {
      active = false;
      void queryClient.cancelQueries({ queryKey: QUOTE_QUERY_PREFIX });
      queryClient.removeQueries({ queryKey: QUOTE_QUERY_PREFIX });
    };
  }, [queryClient, session]);

  useEffect(() => {
    if (!queryEnabled && date) {
      void queryClient.cancelQueries({ queryKey: [...QUOTE_QUERY_PREFIX, date], exact: true });
    }
  }, [date, queryClient, queryEnabled]);

  if (!boardOpen || date === null) return { kind: "idle" };
  if (!validDate) return { kind: "invalid-date" };
  if (isFutureDate) return { kind: "future" };
  if (initializing) return { kind: "initializing" };
  if (!isAuthenticated) return { kind: "guest" };
  if (user === null) return { kind: "profile-unavailable" };
  if (calendar.kind === "error") return { kind: "calendar-error" };
  if (calendar.kind === "initializing" || calendar.kind === "loading" ||
    (calendar.kind === "ready" && calendar.refreshing)) return { kind: "calendar-loading" };
  if (calendar.kind !== "ready" || !matchingCalendar || calendarRecord === undefined) {
    return { kind: "calendar-unavailable" };
  }
  if (isSigned === false) return { kind: date === todayDate ? "today-not-signed" : "not-signed" };
  if (isSigned !== true) return { kind: "calendar-unavailable" };
  if (!queryEnabled) return { kind: "loading" };
  if (query.isError) {
    const status = query.error instanceof ApiError ? query.error.status : 0;
    if (status === 404) return { kind: "no-record" };
    if (status === 401) return { kind: "unauthorized" };
    if (status === 422) return { kind: "invalid-date" };
    return { kind: "error", retry: () => { void query.refetch(); } };
  }
  if (!query.data || query.data.owner !== session) return { kind: "loading" };
  return { kind: "ready", data: query.data.quote };
}
