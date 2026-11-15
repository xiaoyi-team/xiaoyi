import { useEffect, useLayoutEffect, useReducer, useRef, useState, type CSSProperties } from "react";
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
import { useSignInStat } from "../features/xiaoYiSignIn/useSignInStat";
import { createSignInDateState, getBeijingDate, getNextBeijingMidnight, signInDateReducer } from "../features/xiaoYiSignIn/sign-in-dates";
import "./xiao-yi-page.css";

const SCENE_WIDTH = 1920;
const SCENE_HEIGHT = 1080;

function XiaoYiPage() {
  const { initializing, isAuthenticated, user, refreshUser } = useAuth();
  const goLogin = useGoLogin();
  const statView = useSignInStat();
  const [{ todayDate, yearMonth, selectedDate }, dispatchDate] = useReducer(
    signInDateReducer, null, () => createSignInDateState(new Date()),
  );
  const calendarView = useSignInCalendar(yearMonth);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [sceneScale, setSceneScale] = useState(0);
  const [signInOpen, setSignInOpen] = useState(false);
  const [guestLoginOpen, setGuestLoginOpen] = useState(false);
  const [profileRefreshState, setProfileRefreshState] = useState<"idle" | "loading" | "success" | "error">("idle");
  // A touch hold does not consistently retain the native :active pseudo-class.
  const [signInPressed, setSignInPressed] = useState(false);

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
    });

    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="xiao-yi-page" aria-label="萧逸家">
      <div className="xiao-yi-page__viewport" ref={viewportRef}>
        <div
          className="xiao-yi-page__slot"
          style={{
            "--scene-width": `${SCENE_WIDTH * sceneScale}px`,
            "--scene-height": `${SCENE_HEIGHT * sceneScale}px`,
            "--scene-scale": sceneScale,
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
            <Link className="xiao-yi-page__back" to="/home" aria-label="返回首页">
              <img src={backArrow} width={74} height={64} alt="" draggable={false} />
              <span>返回</span>
            </Link>
            <button
              className="xiao-yi-page__sign-in"
              type="button"
              disabled={profileRefreshState === "loading"}
              aria-label="打开每日逸签"
              aria-haspopup="dialog"
              aria-expanded={signInOpen || guestLoginOpen}
              aria-busy={profileRefreshState === "loading"}
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
                  setProfileRefreshState("idle");
                  setGuestLoginOpen(true);
                  return;
                }

                if (user === null) {
                  if (profileRefreshState === "loading") return;

                  setProfileRefreshState("loading");
                  void refreshUser().then(
                    () => setProfileRefreshState("success"),
                    () => setProfileRefreshState("error"),
                  );
                  return;
                }

                setProfileRefreshState("idle");
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
      {profileRefreshState !== "idle" && (
        <div
          role={profileRefreshState === "error" ? "alert" : "status"}
          aria-live={profileRefreshState === "error" ? "assertive" : "polite"}
          style={{
            position: "fixed",
            zIndex: 5,
            right: 16,
            bottom: 16,
            maxWidth: "min(420px, calc(100vw - 32px))",
            padding: "12px 16px",
            borderRadius: 8,
            background: "rgba(20, 24, 32, 0.94)",
            color: "#fff",
            boxShadow: "0 4px 18px rgba(0, 0, 0, 0.3)",
          }}
        >
          {profileRefreshState === "loading" && "正在恢复登录资料…"}
          {profileRefreshState === "success" && "认证状态已更新，请再次点击入口继续。"}
          {profileRefreshState === "error" && "登录资料暂时无法恢复，请再次点击入口重试。"}
        </div>
      )}
      <GuestLoginPrompt
        open={guestLoginOpen}
        onClose={() => setGuestLoginOpen(false)}
        onLogin={() => {
          setGuestLoginOpen(false);
          goLogin();
        }}
      />
      <SignInOverlay open={signInOpen} onClose={() => setSignInOpen(false)} statView={statView} calendar={{
        view: calendarView, todayDate, yearMonth, selectedDate,
        onSelectDate: (date) => dispatchDate({ type: "select", date }),
        onChangeMonth: (month) => dispatchDate({ type: "month", yearMonth: month }),
        onReturnToday: () => dispatchDate({ type: "return-today", date: getBeijingDate(new Date()) }),
        onSelectDemoDate: () => dispatchDate({ type: "select-demo-date" }),
      }} />
    </main>
  );
}

export default XiaoYiPage;
