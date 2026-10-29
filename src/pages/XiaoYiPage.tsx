import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router";
import atticBackground from "../assets/xiao-yi-scene/attic-background.png";
import backArrow from "../assets/xiao-yi-scene/back-arrow.svg";
import signInCalendar from "../assets/xiao-yi-scene/sign-in-calendar.png";
import signInWordmark from "../assets/xiao-yi-scene/sign-in-wordmark.png";
import SignInOverlay from "../features/xiaoYiSignIn/SignInOverlay";
import "./xiao-yi-page.css";

const SCENE_WIDTH = 1920;
const SCENE_HEIGHT = 1080;

function XiaoYiPage() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [sceneScale, setSceneScale] = useState(0);
  const [signInOpen, setSignInOpen] = useState(false);
  // A touch hold does not consistently retain the native :active pseudo-class.
  const [signInPressed, setSignInPressed] = useState(false);

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
              aria-label="打开每日逸签"
              aria-haspopup="dialog"
              aria-expanded={signInOpen}
              data-pressed={signInPressed || undefined}
              onPointerDown={(event) => {
                if (event.isPrimary && event.pointerType === "touch") setSignInPressed(true);
              }}
              onPointerUp={() => setSignInPressed(false)}
              onPointerCancel={() => setSignInPressed(false)}
              onPointerLeave={() => setSignInPressed(false)}
              onClick={() => setSignInOpen(true)}
            >
              <img className="xiao-yi-page__calendar" src={signInCalendar} width={83} height={104} alt="" draggable={false} />
              <img className="xiao-yi-page__wordmark" src={signInWordmark} width={262} height={108} alt="" draggable={false} />
            </button>
          </div>
        </div>
      </div>
      <SignInOverlay open={signInOpen} onClose={() => setSignInOpen(false)} />
    </main>
  );
}

export default XiaoYiPage;
