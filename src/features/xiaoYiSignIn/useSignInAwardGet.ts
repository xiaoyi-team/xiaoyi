import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, hasAuthToken } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { getSignInAward } from "./sign-in-award-get";
import type { SignInAward } from "./sign-in-award-list";
import { AWARD_LIST_QUERY_KEY } from "./useSignInAwardList";

type Status = "idle" | "pending" | "verifying" | "unresolved" | "success" | "error";
type Outcome = { status: Status; message: string };
type Work = { awardId: number; controller: AbortController; onUnauthorizedResponse: () => void };
const UNAUTHORIZED_PREFIX = "401:";
const AWARD_FILTER = { queryKey: AWARD_LIST_QUERY_KEY, exact: true } as const;
const IDLE: Outcome = { status: "idle", message: "" };

export function useSignInAwardGet() {
  const { initializing, isAuthenticated, user } = useAuth();
  const owner = useMemo(() => ({ initializing, isAuthenticated, user }), [initializing, isAuthenticated, user]);
  const account = typeof user === "object" && user !== null
    ? user.user_id ?? user.uid
    : null;
  const storagePrefix = !initializing && isAuthenticated && account !== undefined && account !== null && account !== ""
    ? `xiaoyi:award-verify:${JSON.stringify(account)}:`
    : null;
  const queryClient = useQueryClient();
  const activeOwner = useRef<typeof owner | null>(null);
  const workRef = useRef<Work | null>(null);
  const [snapshot, setSnapshot] = useState<{ owner: typeof owner; awardId: number; outcome: Outcome } | null>(null);
  const { mutateAsync } = useMutation({
    mutationKey: ["xiaoYiSignIn", "awardGet"],
    mutationFn: ({ awardId, controller, onUnauthorizedResponse }: Work) =>
      getSignInAward(awardId, controller.signal, onUnauthorizedResponse),
    retry: false,
    networkMode: "always",
    gcTime: 0,
  });

  useLayoutEffect(() => {
    activeOwner.current = owner;
    return () => {
      activeOwner.current = null;
      workRef.current?.controller.abort();
      workRef.current = null;
    };
  }, [owner]);

  useLayoutEffect(() => {
    if (!storagePrefix) return;
    return queryClient.getQueryCache().subscribe((event) => {
      // A network success for the active account is required. A cache write is not verification.
      if (event.type !== "updated" || event.action.type !== "success" || event.action.manual) return;
      const { query } = event;
      if (
          query.queryKey.length !== AWARD_LIST_QUERY_KEY.length ||
          !AWARD_LIST_QUERY_KEY.every((part, index) => query.queryKey[index] === part) ||
          activeOwner.current !== owner || !hasAuthToken()) return;

      const data = queryClient.getQueryData<{ awards: SignInAward[]; owner: typeof owner }>(AWARD_LIST_QUERY_KEY);
      if (!data || data.owner.user !== owner.user || !data.owner.isAuthenticated || data.owner.initializing) return;

      for (const award of data.awards) {
        if (workRef.current?.awardId === award.award_id) continue;
        const key = storagePrefix + award.award_id;
        try {
          const marker = localStorage.getItem(key);
          if (marker !== null &&
              (award.is_get === true ||
               (award.is_get === false && marker.startsWith(UNAUTHORIZED_PREFIX)))) {
            localStorage.removeItem(key);
          }
        } catch {
          // A storage failure must not turn a successful list response into a query error.
        }
      }
    });
  }, [owner, queryClient, storagePrefix]);

  function storageKey(awardId: number) {
    return storagePrefix === null ? null : storagePrefix + awardId;
  }

  function needsVerification(awardId: number) {
    const key = storageKey(awardId);
    try {
      return key !== null && localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }

  function outcomeFor(awardId: number): Outcome {
    if (snapshot?.owner === owner && snapshot.awardId === awardId) return snapshot.outcome;
    return needsVerification(awardId)
      ? { status: "unresolved", message: "领取结果待核实。" }
      : IDLE;
  }

  async function run(awardId: number, verifyOnly: boolean) {
    const key = storageKey(awardId);
    if (!key || activeOwner.current !== owner || workRef.current || !Number.isSafeInteger(awardId)) return;
    if (verifyOnly !== needsVerification(awardId)) return;
    const pendingMarker = String(crypto.getRandomValues(new Uint32Array(4)));
    const work: Work = {
      awardId,
      controller: new AbortController(),
      onUnauthorizedResponse: () => {
        try {
          if (localStorage.getItem(key) === pendingMarker) {
            localStorage.setItem(key, UNAUTHORIZED_PREFIX + pendingMarker);
          }
        } catch {
          // Keep the existing uncertain marker if the 401 could not be recorded.
        }
      },
    };
    workRef.current = work;
    const isCurrent = () => activeOwner.current === owner && workRef.current === work;
    const show = (status: Status, message: string) => {
      if (isCurrent()) setSnapshot({ owner, awardId, outcome: { status, message } });
    };

    let message = "";
    try {
      if (!verifyOnly) {
        // Store before dispatch so reloads and aborted requests cannot unlock a second POST.
        try {
          localStorage.setItem(key, pendingMarker);
        } catch {
          show("error", "无法保存领取核实状态，请检查浏览器存储设置。");
          return;
        }
        show("pending", "正在领取奖励…");
        const timeout = window.setTimeout(() => work.controller.abort(), 15000);
        try {
          await mutateAsync(work);
        } catch (error) {
          if (!isCurrent()) return;
          if (error instanceof ApiError) {
            if (error.status === 400 && error.bizCode === "AWARD_001") {
              localStorage.removeItem(key);
              show("error", "签到天数不足，无法领取。");
              return;
            }
            if (error.status === 401) {
              show("unresolved", "重新登录后可核实领取状态。");
              return;
            }
            if ([404, 422].includes(error.status)) {
              localStorage.removeItem(key);
              show("error", error.status === 404 ? "奖励不存在。" : error.message);
              return;
            }
            message = error.status === 400 && error.bizCode === "AWARD_002"
              ? "该奖励已经领取过。"
              : error.status > 0 ? error.message + " " : "";
          }
        } finally {
          window.clearTimeout(timeout);
        }
      }

      if (!isCurrent()) return;
      show("verifying", message + "正在核实领取状态…");
      // Cancel an earlier list read so verification waits for a new server response.
      await queryClient.cancelQueries(AWARD_FILTER);
      if (!isCurrent()) return;
      const previousUpdateCount = queryClient.getQueryState(AWARD_LIST_QUERY_KEY)?.dataUpdateCount ?? 0;
      await queryClient.invalidateQueries({ ...AWARD_FILTER, refetchType: "active" }, { throwOnError: true });
      if (!isCurrent()) return;
      const data = queryClient.getQueryData<{ awards: SignInAward[]; owner: typeof owner }>(AWARD_LIST_QUERY_KEY);
      const queryState = queryClient.getQueryState(AWARD_LIST_QUERY_KEY);
      const award = queryState && queryState.dataUpdateCount > previousUpdateCount &&
        !queryState.isInvalidated && hasAuthToken() && data?.owner.user === owner.user
        ? data.awards.find((entry) => entry.award_id === awardId) : undefined;
      if (award?.is_get === true) {
        localStorage.removeItem(key);
        show("success", message || "奖励已领取。");
        return;
      }
      if (award?.is_get === false && localStorage.getItem(key)?.startsWith(UNAUTHORIZED_PREFIX)) {
        localStorage.removeItem(key);
        show("idle", "");
        return;
      }
      show("unresolved", message + "领取结果待核实。");
    } catch {
      show("unresolved", message + "领取结果待核实。");
    } finally {
      if (workRef.current === work) workRef.current = null;
    }
  }

  const current = snapshot?.owner === owner ? snapshot : null;
  return {
    canClaim: storagePrefix !== null,
    busy: current?.outcome.status === "pending" || current?.outcome.status === "verifying",
    current,
    outcomeFor,
    claim: (awardId: number) => void run(awardId, false),
    verify: (awardId: number) => void run(awardId, true),
  };
}

export type SignInAwardClaim = ReturnType<typeof useSignInAwardGet>;
