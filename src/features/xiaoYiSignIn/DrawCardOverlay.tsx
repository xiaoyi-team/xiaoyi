import { useEffect, useRef, useState, useSyncExternalStore, type AnimationEvent, type ReactNode } from "react";
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

export type DrawCardStage = "waiting" | "drawn" | "settled";

type DrawCardOverlayProps = {
  open: boolean;
  stage?: DrawCardStage;
  autoPlay?: boolean;
  onCollect?: () => void;
  children?: ReactNode;
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
  stage: DrawCardStage;
  autoPlay: boolean;
  mobile: boolean;
  scale: number | null;
  onCollect?: () => void;
};

function DrawCardScene({ stage, autoPlay, mobile, scale, onCollect }: DrawCardSceneProps) {
  const [isSettled, setIsSettled] = useState(
    () => autoPlay && window.matchMedia(REDUCED_MOTION).matches,
  );
  const hidden = useSyncExternalStore(subscribeToVisibility, readPageHidden);
  const currentStage = autoPlay ? (isSettled ? "settled" : "waiting") : stage;
  const canCollect = currentStage === "settled" && onCollect !== undefined;

  useEffect(() => {
    if (!autoPlay) return;

    const preference = window.matchMedia(REDUCED_MOTION);
    function settleWithoutMotion(event: MediaQueryListEvent) {
      // Turning motion back on does not replay this already settled instance.
      if (event.matches) setIsSettled(true);
    }

    preference.addEventListener("change", settleWithoutMotion);
    return () => preference.removeEventListener("change", settleWithoutMotion);
  }, [autoPlay]);

  function finishPlayback(event: AnimationEvent<HTMLParagraphElement>) {
    if (
      autoPlay &&
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
      data-auto-play={autoPlay || undefined}
      data-playing={autoPlay && !isSettled ? true : undefined}
      data-settled={autoPlay ? isSettled : stage === "settled"}
      data-paused={autoPlay && hidden ? true : undefined}
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
              {/* Fixed Figma card copy, not the C1 business date calculation. */}
              <div className="draw-card-scene__date-row">
                <span className="draw-card-scene__date">9 / 24</span>
                <span className="draw-card-scene__weekday">Wed.</span>
              </div>
              <p className="draw-card-scene__quote">
                {mobile ? <>赛车的终点<br />是赛道的尽头，<br />而我的终点<br />是你的身边。</> : <>赛车的终点是赛道的尽头，<br />而我的终点是你的身边。</>}
              </p>
            </div>
          </div>
        </div>
        {/* Fixed foreground remains outside the moving/clipping card. */}
        <img className="draw-card-scene__foreground" src={envelope} alt="" draggable={false} />
      </div>
      <p
        className="draw-card-scene__hint"
        aria-hidden={autoPlay ? !isSettled : stage !== "settled"}
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

function DrawCardOverlay({ open, stage = "waiting", autoPlay = false, onCollect, children }: DrawCardOverlayProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const collectedRef = useRef(false);
  const scale = useSyncExternalStore(subscribeToViewport, readBoardScale);
  const mobile = scale === null;

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
      aria-label="今日寄语抽卡静态预览"
      data-mobile={mobile ? true : undefined}
      onCancel={(event) => event.preventDefault()}
    >
      {open && (
        <div
          className="draw-card-slot"
          style={mobile ? undefined : { width: BOARD_WIDTH * scale, height: BOARD_HEIGHT * scale }}
        >
          {/* A fresh scene owns each opening; resize never changes its key. */}
          <DrawCardScene key={autoPlay ? "auto" : "static"} stage={stage} autoPlay={autoPlay} mobile={mobile} scale={scale} onCollect={onCollect ? handleCollect : undefined} />
        </div>
      )}
      {children}
    </dialog>
  );
}

export default DrawCardOverlay;
