import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "../../auth/AuthContext";
import Login from "../../pages/Login";
import DesktopMapArtwork from "../home/components/DesktopMapArtwork";
import MobileMapArtwork from "../home/components/MobileMapArtwork";
import idleVideo from "../../assets/opening/gate-idle.mp4";
import openVideo from "../../assets/opening/gate-open.mp4";
import title from "../../assets/opening/title.svg";
import shadow from "../../assets/opening/title-shadow.svg";
import { shouldShowOpening } from "./entryPolicy";
import "../../fonts/noto-serif-sc.css";
import "./opening.css";

const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
let pendingArrival = shouldShowOpening(location.pathname, navigation?.type ?? "navigate", document.referrer, location.origin);

export default function HomeEntrance({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<"opening" | "auth" | "home">(() => pendingArrival ? "opening" : "home");
  const [filmVisible, setFilmVisible] = useState(pendingArrival);
  const { isAuthenticated, initializing } = useAuth();
  const finish = useCallback(() => setStep("home"), []);
  useEffect(() => {
    // Consume this document's arrival, including when leaving before the film ends.
    pendingArrival = false;
  }, []);
  useEffect(() => {
    if (step === "opening" || !filmVisible) return;
    // Retain the final video frame throughout the dissolve, including browsers
    // that do not dispatch transitionend when the tab is in the background.
    const timeout = window.setTimeout(() => setFilmVisible(false), 1100);
    return () => window.clearTimeout(timeout);
  }, [step, filmVisible]);
  return <div className="home-entrance">
    {step === "auth" ? <ArrivalAuth onComplete={finish} /> : step === "home" ? children : null}
    {filmVisible && <div className="home-entrance__film" data-leaving={step !== "opening" || undefined}
      aria-hidden={step !== "opening"} inert={step !== "opening"}
      onTransitionEnd={event => {
        if (event.target === event.currentTarget && event.propertyName === "opacity" && step !== "opening") setFilmVisible(false);
      }}>
      <Opening onComplete={() => setStep(!initializing && isAuthenticated ? "home" : "auth")} />
    </div>}
  </div>;
}

function ArrivalAuth({ onComplete }: { onComplete: () => void }) {
  const [viewport, setViewport] = useState(() => ({ width: innerWidth, height: innerHeight }));
  useEffect(() => {
    const resize = () => setViewport({ width: innerWidth, height: innerHeight });
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  const mobile = viewport.width < 1024;
  const width = mobile ? 667 : 1920;
  const height = mobile ? 375 : 1080;
  const scale = Math.min(viewport.width / width, viewport.height / height);
  return <div className="arrival-auth">
    <div className="arrival-auth__background" aria-hidden="true" style={{ width: width * scale, height: height * scale }}>
      <div className="home-map__artwork" style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        {mobile ? <MobileMapArtwork /> : <DesktopMapArtwork />}
      </div>
    </div>
    <Login entrance onComplete={onComplete} onDismiss={onComplete} />
  </div>;
}

function Opening({ onComplete }: { onComplete: () => void }) {
  const [viewport, setViewport] = useState(() => ({ width: innerWidth, height: innerHeight }));
  const [phase, setPhase] = useState<"idle" | "starting" | "opening">("idle");
  const idle = useRef<HTMLVideoElement>(null);
  const opening = useRef<HTMLVideoElement>(null);
  const started = useRef(false);
  const mounted = useRef(true);
  const [failed, setFailed] = useState(false);
  const mobile = viewport.width < 1024;
  const width = mobile ? 667 : 1920;
  const height = mobile ? 375 : 1080;
  const scale = Math.min(viewport.width / width, viewport.height / height);

  useEffect(() => {
    mounted.current = true;
    const resize = () => setViewport({ width: innerWidth, height: innerHeight });
    window.addEventListener("resize", resize);
    return () => { mounted.current = false; window.removeEventListener("resize", resize); };
  }, []);

  function enter() {
    if (failed) { onComplete(); return; }
    if (started.current) return;
    started.current = true;
    setPhase("starting");
    // Begin playback in the user gesture. Keep the last idle frame until playback starts.
    idle.current?.pause();
    const video = opening.current;
    if (!video) { onComplete(); return; }
    video.currentTime = 0;
    void video.play().catch(() => {
      if (mounted.current) { setFailed(true); setPhase("idle"); started.current = false; }
    });
  }

  return <main className="opening" aria-label="萧与逸之恋开屏">
    <div className="opening__window" style={{ width: width * scale, height: height * scale }}>
      <button type="button" className="opening__scene" data-mobile={mobile} data-phase={phase}
        style={{ width, height, transform: `scale(${scale})` }} onClick={enter} aria-label="进入首页">
        <video ref={idle} className="opening__video" src={idleVideo} autoPlay loop muted playsInline preload="auto" onError={() => setFailed(true)} />
        <video ref={opening} className="opening__video opening__film" src={openVideo} muted playsInline preload="auto"
          onPlaying={() => setPhase("opening")} onEnded={onComplete} onError={() => setFailed(true)} />
        <span className="opening__words">
          <span className="opening__title">
            <img className="opening__shadow" src={shadow} alt="" />
            <img src={title} alt="萧与逸之恋 · XXW AND OSBORN" />
          </span>
          <span className="opening__prompt">—— 点击空白处进入 ——</span>
          <span className="opening__english">Touch to start</span>
        </span>
        {failed && <span className="opening__fallback">视频暂时无法播放，点击进入首页</span>}
      </button>
    </div>
  </main>;
}
