import { useEffect, useRef, useState, useSyncExternalStore, type AnimationEvent, type CSSProperties, type ReactNode } from "react";
import { BOARD_HEIGHT, BOARD_WIDTH, readBoardScale, subscribeToViewport } from "./sign-in-viewport";
import envelope from "../../assets/xiao-yi-sign-in/draw-envelope.png";
import cardBack from "../../assets/xiao-yi-sign-in/draw-card-back.png";
import cardPaper from "../../assets/xiao-yi-sign-in/draw-card-paper.png";
import starTopLeft from "../../assets/xiao-yi-sign-in/draw-card-star-top-left.svg";
import starTopRight from "../../assets/xiao-yi-sign-in/draw-card-star-top-right.svg";
import starBottomLeft from "../../assets/xiao-yi-sign-in/draw-card-star-bottom-left.svg";
import divider from "../../assets/xiao-yi-sign-in/draw-card-divider.svg";
import starUpperDivider from "../../assets/xiao-yi-sign-in/draw-card-star-upper-divider.svg";
import starLowerDivider from "../../assets/xiao-yi-sign-in/draw-card-star-lower-divider.svg";
import "./draw-card.css";

import { formatSignInCardDate } from "./sign-in-dates";
import type { SignInAddResponse } from "./sign-in-add";

export const SIGN_IN_QUOTE_PENDING_MESSAGE = "签到成功，但暂时无法获取语录";

type DrawCardOverlayProps = {
  open: boolean;
  onCollect?: () => void;
  children?: ReactNode;
  sceneBounds?: { left: number; top: number; width: number; height: number } | null;
  sceneScale?: number | null;
  touchSceneScale?: number;
  result: SignInAddResponse;
  onDismiss: () => void;
};

const decorations = [
  { name: "top-left", src: starTopLeft },
  { name: "top-right", src: starTopRight },
  { name: "bottom-left", src: starBottomLeft },
  { name: "upper-line", src: divider },
  { name: "lower-line", src: divider },
  { name: "upper-star", src: starUpperDivider },
  { name: "lower-star", src: starLowerDivider },
];

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeToVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

function readPageHidden() {
  return document.hidden;
}

type DrawCardSceneProps = {
  result: SignInAddResponse;
  scale: number | null;
  onCollect?: () => void;
};

function DrawCardScene({ result, scale, onCollect }: DrawCardSceneProps) {
  const { dateText, weekday } = formatSignInCardDate(result.sign_date);
  const [isSettled, setIsSettled] = useState(
    () => window.matchMedia(REDUCED_MOTION).matches,
  );
  const hidden = useSyncExternalStore(subscribeToVisibility, readPageHidden);
  const currentStage = isSettled ? "settled" : "waiting";
  const canCollect = currentStage === "settled" && onCollect !== undefined;

  useEffect(() => {
    const preference = window.matchMedia(REDUCED_MOTION);
    function settleWithoutMotion(event: MediaQueryListEvent) {
      // Turning motion back on does not replay this already settled instance.
      if (event.matches) setIsSettled(true);
    }

    preference.addEventListener("change", settleWithoutMotion);
    return () => preference.removeEventListener("change", settleWithoutMotion);
  }, []);

  function finishPlayback(event: AnimationEvent<HTMLParagraphElement>) {
    if (
      !isSettled &&
      event.target === event.currentTarget &&
      event.animationName === "draw-card-finish"
    ) {
      setIsSettled(true);
    }
  }

  return (
    <div
      className="draw-card-scene"
      data-stage={currentStage}
      data-auto-play
      data-playing={!isSettled || undefined}
      data-settled={isSettled}
      data-paused={hidden || undefined}
      data-collectable={canCollect || undefined}
      onClick={canCollect ? onCollect : undefined}
      style={scale === null ? undefined : { transform: `scale(${scale})` }}
    >
      <div className="draw-card-scene__shade" aria-hidden="true" />
      <div className="draw-card-scene__assembly">
        <img className="draw-card-scene__envelope" src={envelope} alt="" draggable={false} />
        <div className="draw-card-scene__card">
          <div className="draw-card-scene__back-face">
            <img className="draw-card-scene__back" src={cardBack} alt="鸢尾花卡片背面" draggable={false} />
          </div>
          <div className="draw-card-scene__front-face">
            <div className="draw-card-scene__paper" aria-hidden="true">
              <img src={cardPaper} alt="" draggable={false} />
            </div>
            <div className="draw-card-scene__front-content">
              <div className="draw-card-scene__inner-border" aria-hidden="true" />
              {decorations.map(({ name, src }) => (
                <span key={name} className={`draw-card-scene__decoration draw-card-scene__decoration--${name}`} aria-hidden="true">
                  <img src={src} alt="" draggable={false} />
                </span>
              ))}
              <h3 className="draw-card-scene__title">今日寄语</h3>
                <div className="draw-card-scene__date-row">
                  <span className="draw-card-scene__date">{dateText}</span>
                  <span className="draw-card-scene__weekday">{weekday}</span>
                </div>
                <p className="draw-card-scene__quote draw-card-scene__quote--formal" aria-live="polite">
                  {currentStage === "settled" && (
                    result.quote_status === "pending" ? SIGN_IN_QUOTE_PENDING_MESSAGE : result.quote?.content
                  )}
                </p>

            </div>
          </div>
        </div>
        {/* Fixed foreground remains outside the moving/clipping card. */}
        <img className="draw-card-scene__foreground" src={envelope} alt="" draggable={false} />
      </div>
      <p
        className="draw-card-scene__hint"
        aria-hidden={!isSettled}
        onAnimationEnd={finishPlayback}
      >
        {canCollect ? (
          <button type="button" className="draw-card-scene__collect">
            点击周围空白处，收下今日寄语
          </button>
        ) : "点击周围空白处，收下今日寄语"}
      </p>
    </div>
  );
}

function DrawCardOverlay({ result, open, onCollect, onDismiss, children, sceneBounds, sceneScale, touchSceneScale }: DrawCardOverlayProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const collectedRef = useRef(false);
  const viewportScale = useSyncExternalStore(subscribeToViewport, readBoardScale);
  const mobile = viewportScale === null;
  const scale = mobile ? touchSceneScale ?? 1 : sceneBounds ? sceneScale ?? viewportScale : viewportScale;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) collectedRef.current = false;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();

    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  function handleCollect() {
    if (!open || !dialogRef.current?.open || !onCollect || collectedRef.current) return;

    // Claim this opening synchronously, even if the host closes asynchronously.
    collectedRef.current = true;
    onCollect();
  }

  return (
    <dialog
      ref={dialogRef}
      className="draw-card-dialog"
      aria-label="今日寄语抽卡"
      data-mobile={mobile ? true : undefined}
      data-scene={sceneBounds ? true : undefined}
      style={sceneBounds ? {
        left: sceneBounds.left, top: sceneBounds.top,
        width: sceneBounds.width, height: sceneBounds.height,
      } as CSSProperties : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
    >
      {open && (
        <div
          className="draw-card-slot"
          style={mobile || scale === null ? undefined : { width: BOARD_WIDTH * scale, height: BOARD_HEIGHT * scale }}
        >
          {/* A fresh scene owns each opening; resize never changes its key. */}
          <DrawCardScene result={result} key="auto" scale={scale} onCollect={onCollect ? handleCollect : undefined} />
        </div>
      )}
      {children}
    </dialog>
  );
}

export default DrawCardOverlay;
