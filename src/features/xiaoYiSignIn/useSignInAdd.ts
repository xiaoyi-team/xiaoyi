import { AWARD_LIST_QUERY_KEY } from "./useSignInAwardList";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { addSignIn, type SignInAddResponse } from "./sign-in-add";
import { getSignInCalendar } from "./sign-in-calendar";
import { getBeijingDate } from "./sign-in-dates";
import { STAT_QUERY_KEY } from "./useSignInStat";
import { CALENDAR_QUERY_PREFIX } from "./useSignInCalendar";

export type SignInAddStatus = "idle" | "submitting" | "success" | "pending-verification" |
  "verification-failed" | "failed" | "verified-signed" | "verified-not-signed";

type AuthSession = Pick<ReturnType<typeof useAuth>, "initializing" | "isAuthenticated" | "user">;
type Operation = { requestDate: string; settledDate: string | null };
type RefreshState = { pending: boolean; statError: unknown; calendarError: unknown };
type State = {
  status: SignInAddStatus;
  result: SignInAddResponse | null;
  error: unknown;
  operation: Operation | null;
  verificationError: unknown;
  verifying: boolean;
  refresh: RefreshState;
};
type Snapshot = State & { owner: AuthSession };
type Work = { owner: AuthSession; controller: AbortController };

function initialState(): State {
  return {
    status: "idle", result: null, error: null, operation: null,
    verificationError: null, verifying: false,
    refresh: { pending: false, statError: null, calendarError: null },
  };
}

function requiresVerification(status: SignInAddStatus) {
  return status === "pending-verification" || status === "verification-failed";
}

// Only explicit authentication/validation rejections are treated as definite failures.
// Connection, cancellation, contract and server errors may follow a saved sign-in.
function isDefiniteRejection(error: unknown) {
  return error instanceof ApiError && [401, 403, 422].includes(error.status);
}

export function useSignInAdd() {
  const { initializing, isAuthenticated, user } = useAuth();
  const session = useMemo(() => ({ initializing, isAuthenticated, user }), [initializing, isAuthenticated, user]);
  const queryClient = useQueryClient();
  const [snapshot, setSnapshot] = useState<Snapshot>(() => ({ ...initialState(), owner: session }));
  const stateRef = useRef(snapshot);
  const ownerRef = useRef<AuthSession | null>(null);
  const workRef = useRef<Work | null>(null);
  const mutation = useMutation({
    mutationKey: ["xiaoYiSignIn", "add"],
    mutationFn: ({ controller }: Work) => addSignIn(controller.signal),
    retry: false,
    networkMode: "always", // Do not queue a write for automatic reconnect execution.
    gcTime: 0,
  });

  useLayoutEffect(() => {
    ownerRef.current = session;
    return () => {
      ownerRef.current = null;
      workRef.current?.controller.abort();
      workRef.current = null;
    };
  }, [session]);

  function isCurrent(owner: AuthSession) {
    return ownerRef.current === owner && !owner.initializing && owner.isAuthenticated && owner.user !== null;
  }

  function readState(): State {
    return stateRef.current.owner === session ? stateRef.current : initialState();
  }

  function publish(owner: AuthSession, next: State) {
    if (!isCurrent(owner)) return;
    const value = { ...next, owner };
    stateRef.current = value;
    setSnapshot(value);
  }

  async function refreshData(date: string, owner: AuthSession, refreshAwards = false) {
    if (!isCurrent(owner)) return;
    publish(owner, { ...readState(), refresh: { pending: true, statError: null, calendarError: null } });
    async function invalidate(queryKey: readonly string[]) {
      try {
        if (!isCurrent(owner)) return null;
        await queryClient.cancelQueries({ queryKey, exact: true });
        if (!isCurrent(owner)) return null;
        // Inactive entries become stale; no fake cache entries or owner wrappers are created.
        await queryClient.invalidateQueries({ queryKey, exact: true, refetchType: "active" }, { throwOnError: true });
        return null;
      } catch (error) {
        return error;
      }
    }
    if (refreshAwards) void invalidate(AWARD_LIST_QUERY_KEY);
    const [statError, calendarError] = await Promise.all([
      invalidate(STAT_QUERY_KEY),
      invalidate([...CALENDAR_QUERY_PREFIX, date.slice(0, 7)]),
    ]);
    if (isCurrent(owner)) publish(owner, { ...readState(), refresh: { pending: false, statError, calendarError } });
  }

  async function submitSignIn(): Promise<SignInAddResponse | null> {
    if (!isCurrent(session) || workRef.current || requiresVerification(readState().status)) return null;
    const work: Work = { owner: session, controller: new AbortController() };
    workRef.current = work; // Synchronous lock, before mutateAsync or React state updates.
    const operation: Operation = { requestDate: getBeijingDate(new Date()), settledDate: null };
    publish(session, { ...initialState(), status: "submitting", operation });
    try {
      const result = await mutation.mutateAsync(work);
      if (!isCurrent(session)) return null;
      const settledOperation = { ...operation, settledDate: getBeijingDate(new Date()) };
      publish(session, { ...initialState(), status: "success", result, operation: settledOperation });
      await refreshData(result.sign_date, session, true);
      return isCurrent(session) ? result : null;
    } catch (error) {
      if (isCurrent(session)) {
        const settledOperation = { ...operation, settledDate: getBeijingDate(new Date()) };
        publish(session, {
          ...initialState(), operation: settledOperation, error,
          status: isDefiniteRejection(error) ? "failed" : "pending-verification",
        });
      }
      return null;
    } finally {
      if (workRef.current === work) workRef.current = null;
    }
  }

  async function verifyPendingSignIn(): Promise<boolean | null> {
    const current = readState();
    if (!isCurrent(session) || workRef.current || !requiresVerification(current.status) || !current.operation) return null;
    const operation = current.operation;
    function sameDay() {
      return operation.settledDate === operation.requestDate && getBeijingDate(new Date()) === operation.requestDate;
    }
    // requestDate is a client observation, not a replacement for server sign_date.
    // A cross-midnight uncertain request has no reliable recovery contract.
    if (!sameDay()) {
      publish(session, { ...current, status: "verification-failed", verificationError: new Error("请求跨越北京时间业务日，需后端核实原签到结果。") });
      return null;
    }
    const work: Work = { owner: session, controller: new AbortController() };
    workRef.current = work;
    publish(session, { ...current, verifying: true, verificationError: null });
    try {
      const data = await getSignInCalendar({ yearMonth: operation.requestDate.slice(0, 7) }, work.controller.signal);
      if (!isCurrent(session)) return null;
      if (!sameDay()) throw new Error("核实过程中跨越北京时间业务日，不能解除待核实限制。");
      const day = Number(operation.requestDate.slice(-2));
      const record = data.yearMonth === operation.requestDate.slice(0, 7)
        ? data.list.find((item) => item.day === day) : undefined;
      if (typeof record?.is_signed !== "boolean") throw new Error("原操作日期的签到状态无法核实。");
      // M2 confirms a date's sign-in only. It cannot manufacture a POST result or quote.
      publish(session, {
        ...current, status: record.is_signed ? "verified-signed" : "verified-not-signed",
        verifying: false, verificationError: null,
      });
      if (record.is_signed) await refreshData(operation.requestDate, session);
      return isCurrent(session) ? record.is_signed : null;
    } catch (verificationError) {
      publish(session, { ...current, status: "verification-failed", verifying: false, verificationError });
      return null;
    } finally {
      if (workRef.current === work) workRef.current = null;
    }
  }

  async function refreshSignInData(): Promise<boolean> {
    const current = readState();
    const date = current.result?.sign_date ?? (current.status === "verified-signed" ? current.operation?.requestDate : null);
    if (!isCurrent(session) || workRef.current || !date) return false;
    const work: Work = { owner: session, controller: new AbortController() };
    workRef.current = work;
    try {
      await refreshData(date, session);
      return isCurrent(session) && !readState().refresh.statError && !readState().refresh.calendarError;
    } finally {
      if (workRef.current === work) workRef.current = null;
    }
  }

  function cancelSignIn() {
    if (workRef.current?.owner === session) workRef.current.controller.abort();
  }

  function reset(): boolean {
    if (!isCurrent(session) || workRef.current || requiresVerification(readState().status)) return false;
    mutation.reset();
    publish(session, initialState());
    return true;
  }

  // Never expose the previous identity's result during an auth transition render.
  const visible = snapshot.owner === session ? snapshot : initialState();
  return {
    status: visible.status, result: visible.result, error: visible.error,
    operation: visible.operation, verifying: visible.verifying, verificationError: visible.verificationError,
    refresh: visible.refresh,
    submitSignIn, verifyPendingSignIn, refreshSignInData, cancelSignIn, reset,
  };
}
