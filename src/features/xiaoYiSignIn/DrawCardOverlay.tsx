import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
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

function DrawCardOverlay({ open, stage = "waiting", children }: DrawCardOverlayProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scale = useSyncExternalStore(subscribeToViewport, readBoardScale);
  const mobile = scale === null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();

    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="draw-card-dialog"
      aria-label="今日寄语抽卡静态预览"
      data-mobile={mobile ? true : undefined}
      onCancel={(event) => event.preventDefault()}
    >
      <div
        className="draw-card-slot"
        style={mobile ? undefined : { width: BOARD_WIDTH * scale, height: BOARD_HEIGHT * scale }}
      >
        <div
          className="draw-card-scene"
          data-stage={stage}
          style={mobile ? undefined : { transform: `scale(${scale})` }}
        >
          <div className="draw-card-scene__shade" aria-hidden="true" />
          {/* Figma 2096:4794 / 3711:7686: one shared, unadjusted transparent IMAGE. */}
          <div className="draw-card-scene__assembly">
            <img className="draw-card-scene__envelope" src={envelope} alt="" draggable={false} />
            <div className="draw-card-scene__card">
              {stage === "settled" ? (
                <>
                  <div className="draw-card-scene__paper" aria-hidden="true">
                    <img src={cardPaper} alt="" draggable={false} />
                  </div>
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
                </>
              ) : (
                <img className="draw-card-scene__back" src={cardBack} alt="鸢尾花卡片背面" draggable={false} />
              )}
            </div>
            {/* Same original IMAGE above the card, through the exact exported SVG mask. */}
            <img className="draw-card-scene__foreground" src={envelope} alt="" draggable={false} />
          </div>
          <p className="draw-card-scene__hint">点击周围空白处，收下今日寄语</p>
        </div>
      </div>
      {children}
    </dialog>
  );
}

export default DrawCardOverlay;
