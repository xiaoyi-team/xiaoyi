import RewardNotice from "../features/xiaoYiSignIn/RewardNotice";
import { useSignInAwardGet } from "../features/xiaoYiSignIn/useSignInAwardGet";
import { useSignInAwardList } from "../features/xiaoYiSignIn/useSignInAwardList";
import { useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router";
import { useAuth } from "../auth/AuthContext";
import { useGoLogin } from "../auth/navigation";
import atticBackground from "../assets/xiao-yi-scene/attic-background.png";
import backArrow from "../assets/xiao-yi-scene/back-arrow.svg";
import signInCalendar from "../assets/xiao-yi-scene/sign-in-calendar.png";
import signInWordmark from "../assets/xiao-yi-scene/sign-in-wordmark.png";
import GuestLoginPrompt from "../features/xiaoYiGuestLogin/GuestLoginPrompt";
import SignInOverlay from "../features/xiaoYiSignIn/SignInOverlay";
import { useSignInCalendar } from "../features/xiaoYiSignIn/useSignInCalendar";
import { useSignInQuote, type SignInQuoteView } from "../features/xiaoYiSignIn/useSignInQuote";
import type { SignInQuote } from "../features/xiaoYiSignIn/sign-in-quote";
import { useSignInStat } from "../features/xiaoYiSignIn/useSignInStat";
import { useSignInAdd } from "../features/xiaoYiSignIn/useSignInAdd";
import type { SignInAddResponse } from "../features/xiaoYiSignIn/sign-in-add";
import { createSignInDateState, getBeijingDate, getNextBeijingMidnight, signInDateReducer } from "../features/xiaoYiSignIn/sign-in-dates";
import XiaoYiCharacter from "./XiaoYiCharacter";
import "./xiao-yi-page.css";

const SCENE_WIDTH = 1920;
const SCENE_HEIGHT = 1080;
const TOUCH_SCENE_WIDTH = 667;
const TOUCH_SCENE_HEIGHT = 375;

function XiaoYiPage() {
  const { initializing, isAuthenticated, user, refreshUser } = useAuth();
  const goLogin = useGoLogin();
  const statView = useSignInStat();
  const awardListView = useSignInAwardList();
  const awardClaim = useSignInAwardGet();
  const signIn = useSignInAdd();
  const [{ todayDate, yearMonth, selectedDate }, dispatchDate] = useReducer(
    signInDateReducer, null, () => createSignInDateState(new Date()),
  );
  const calendarView = useSignInCalendar(yearMonth);
  const viewportRef = useRef<HTMLDivElement>(null);
  const sceneSlotRef = useRef<HTMLDivElement>(null);
  const rewardAnchorRef = useRef<HTMLDivElement>(null);
  const [sceneScale, setSceneScale] = useState(0);
  const [touchSceneScale, setTouchSceneScale] = useState(0);
  const [signInOpen, setSignInOpen] = useState(false);
  const authSession = useMemo(() => ({ initializing, isAuthenticated, user }), [initializing, isAuthenticated, user]);
  const [openAward, setOpenAward] = useState<{ owner: typeof authSession; id: number } | null>(null);
  const selectedAward = signInOpen && openAward?.owner === authSession && awardListView.kind === "ready"
    ? awardListView.awards.find((award) => award.award_id === openAward.id)
    : undefined;
  const [drawRequest, setDrawRequest] = useState<{
    owner: typeof authSession;
    previousResult: SignInAddResponse | null;
    backgroundQuote: { view: SignInQuoteView; result: SignInAddResponse | null };
  } | null>(null);
  const [retainedQuotes, setRetainedQuotes] = useState<{
    owner: typeof authSession;
    byDate: ReadonlyMap<string, SignInQuote>;
  } | null>(null);
  const currentDrawRequest = drawRequest?.owner === authSession ? drawRequest : null;
  // The hook publishes success before refreshing M1/M2. Only a new result for this click opens a card.
  const drawResult = signInOpen && currentDrawRequest && signIn.result !== currentDrawRequest.previousResult
    ? signIn.result : null;
  const selectedSignInResult = selectedDate !== null && signIn.result?.sign_date === selectedDate ? signIn.result : null;
  const quoteView = useSignInQuote({
    date: selectedDate,
    todayDate,
    enabled: signInOpen && !selectedSignInResult && !currentDrawRequest,
    calendar: calendarView,
  });
  const retainedQuote = retainedQuotes?.owner === authSession && selectedDate !== null
    ? retainedQuotes.byDate.get(selectedDate)
    : undefined;
  const backgroundQuote = currentDrawRequest?.backgroundQuote;
  const boardQuoteResult = backgroundQuote ? backgroundQuote.result : retainedQuote ? null : selectedSignInResult;
  const boardQuoteView: SignInQuoteView = backgroundQuote?.view ?? (retainedQuote
    ? { kind: "ready", data: retainedQuote }
    : quoteView);
  const [guestLoginOpen, setGuestLoginOpen] = useState(false);
  const [profileRefreshing, setProfileRefreshing] = useState(false);
  // A touch hold does not consistently retain the native :active pseudo-class.
  const [signInPressed, setSignInPressed] = useState(false);

  async function submitForDraw() {
    const request = {
      owner: authSession,
      previousResult: signIn.result,
      backgroundQuote: { view: boardQuoteView, result: boardQuoteResult },
    };
    // Keep the quote already shown for this date even if the repeat response differs.
    const previousQuote = signIn.result?.quote;
    const queriedQuote = selectedDate === todayDate && quoteView.kind === "ready" ? quoteView.data : null;
    if (previousQuote || queriedQuote) {
      setRetainedQuotes((current) => {
        const byDate = current?.owner === authSession ? current.byDate : new Map<string, SignInQuote>();
        const next = new Map(byDate);
        for (const quote of [previousQuote, queriedQuote]) {
          if (quote && !next.has(quote.quote_date)) next.set(quote.quote_date, quote);
        }
        return next.size === byDate.size ? current : { owner: authSession, byDate: next };
      });
    }
    setDrawRequest((current) => current?.owner === authSession ? current : request);
    const result = await signIn.submitSignIn();
    if (!result) setDrawRequest((current) => current === request ? null : current);
    return result;
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function schedule() {
      clearTimeout(timer);
      const now = new Date();
      timer = setTimeout(refreshToday, Math.max(1, getNextBeijingMidnight(now) - now.getTime()));
    }
    function refreshToday() {
      dispatchDate({ type: "refresh-today", date: getBeijingDate(new Date()) });
      schedule();
    }
    function onVisibility() {
      if (document.visibilityState === "visible") refreshToday();
    }
    schedule();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", refreshToday);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", refreshToday);
    };
  }, []);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;

      const scale = Math.min(
        1,
        entry.contentRect.width / SCENE_WIDTH,
        entry.contentRect.height / SCENE_HEIGHT,
      );
      setSceneScale(scale);
      setTouchSceneScale(Math.min(
        entry.contentRect.width / TOUCH_SCENE_WIDTH,
        entry.contentRect.height / TOUCH_SCENE_HEIGHT,
      ));
    });

    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="xiao-yi-page" aria-label="萧逸家">
      <div className="xiao-yi-page__viewport" ref={viewportRef}>
        <div
          className="xiao-yi-page__slot"
          ref={sceneSlotRef}
          style={{
            "--scene-width": `${SCENE_WIDTH * sceneScale}px`,
            "--scene-height": `${SCENE_HEIGHT * sceneScale}px`,
            "--scene-scale": sceneScale,
            "--touch-scene-scale": touchSceneScale,
            visibility: sceneScale > 0 ? "visible" : "hidden",
          } as CSSProperties}
        >
          <div className="xiao-yi-page__scene">
            {/* Figma 1510:2868 extends 1px below the 1920 × 1080 scene. */}
            <img
              className="xiao-yi-page__background"
              src={atticBackground}
              width={3344}
              height={1882}
              alt=""
              draggable={false}
            />
            <XiaoYiCharacter />
            <Link data-return-feedback className="xiao-yi-page__back" to="/home" aria-label="返回首页">
              <img src={backArrow} width={74} height={64} alt="" draggable={false} />
              <span>返回</span>
            </Link>
            <button
              className="xiao-yi-page__sign-in"
              type="button"
              disabled={profileRefreshing}
              aria-label="打开每日逸签"
              aria-haspopup="dialog"
              aria-expanded={signInOpen || guestLoginOpen}
              aria-busy={profileRefreshing}
              data-pressed={signInPressed || undefined}
              onPointerDown={(event) => {
                if (event.isPrimary && event.pointerType === "touch") setSignInPressed(true);
              }}
              onPointerUp={() => setSignInPressed(false)}
              onPointerCancel={() => setSignInPressed(false)}
              onPointerLeave={() => setSignInPressed(false)}
              onClick={() => {
                if (initializing) return;

                if (!isAuthenticated) {
                  setGuestLoginOpen(true);
                  return;
                }

                if (user === null) {
                  if (profileRefreshing) return;

                  setProfileRefreshing(true);
                  void refreshUser().then(
                    () => setProfileRefreshing(false),
                    () => setProfileRefreshing(false),
                  );
                  return;
                }

                dispatchDate({ type: "refresh-today", date: getBeijingDate(new Date()) });
                setSignInOpen(true);
              }}
            >
              <img className="xiao-yi-page__calendar" src={signInCalendar} width={83} height={104} alt="" draggable={false} />
              <img className="xiao-yi-page__wordmark" src={signInWordmark} width={262} height={108} alt="" draggable={false} />
            </button>
          </div>
        </div>
      </div>
      <GuestLoginPrompt
        open={guestLoginOpen}
        touchSceneScale={touchSceneScale}
        onClose={() => setGuestLoginOpen(false)}
        onLogin={() => {
          setGuestLoginOpen(false);
          goLogin();
        }}
      />
      <SignInOverlay
        rewardAnchorRef={rewardAnchorRef}
        sceneRef={sceneSlotRef}
        touchSceneScale={touchSceneScale}
        open={signInOpen}
        onClose={() => {
          setDrawRequest(null);
          setOpenAward(null);
          setSignInOpen(false);
        }}
        statView={statView}
        awardListView={awardListView}
        awardClaim={awardClaim}
        onOpenAward={(id) => setOpenAward({ owner: authSession, id })}
        quoteView={boardQuoteView}
        quoteResult={boardQuoteResult}
        drawResult={drawResult}
        onDismissDraw={() => {
          dispatchDate({ type: "return-today", date: getBeijingDate(new Date()) });
          setDrawRequest(null);
        }}
        signIn={{ ...signIn, submitSignIn: submitForDraw, authenticated: !initializing && isAuthenticated && user !== null }}
        calendar={{
          view: calendarView, todayDate, yearMonth, selectedDate,
          onSelectDate: (date) => dispatchDate({ type: "select", date }),
          onChangeMonth: (month) => dispatchDate({ type: "month", yearMonth: month }),
          onReturnToday: () => dispatchDate({ type: "return-today", date: getBeijingDate(new Date()) }),
        }}
      />
      {selectedAward && (
        <RewardNotice
          boardRef={rewardAnchorRef}
          touchSceneScale={touchSceneScale}
          claim={{
            days: selectedAward.day_count,
            name: selectedAward.award_name, imageUrl: selectedAward.reward_img_url,
            onClaim: () => {
              if (!selectedAward.is_get && statView.kind === "ready" && selectedAward.day_count <= statView.totalDays) {
                awardClaim.claim(selectedAward.award_id);
              }
            },
          }}
          onClose={() => setOpenAward(null)}
        />
      )}
    </main>
  );
}

export default XiaoYiPage;
