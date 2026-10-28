import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { BOARD_HEIGHT, BOARD_WIDTH, readBoardScale, subscribeToViewport } from "./sign-in-viewport";
import gift30 from "../../assets/xiao-yi-sign-in/reward-notice-gift-30.png";
import gift111 from "../../assets/xiao-yi-sign-in/reward-notice-gift-111.png";
import gift365 from "../../assets/xiao-yi-sign-in/reward-notice-gift-365.png";
import "./reward-notice.css";

export type RewardMilestone = 30 | 111 | 365;

type RewardNoticeProps = {
  milestone: RewardMilestone;
  onClose: () => void;
};

// Presentation fixtures from the PC prototype, not eligibility or claim rules.
const rewards = {
  30: { gift: gift30, title: "星光花语 · 头像框", imageSize: 156 },
  111: { gift: gift111, title: "相伴纪念 · 纪念卡", imageSize: 120 },
  365: { gift: gift365, title: "岁月珍藏 · 纪念卡", imageSize: 120 },
};
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function readNoticeScale() {
  // Match the PC board's canvas; smaller windows only get a basic fit fallback.
  return readBoardScale() ?? Math.min(
    1,
    Math.max(0, document.documentElement.clientWidth - 32) / BOARD_WIDTH,
    Math.max(0, window.innerHeight - 32) / BOARD_HEIGHT,
  );
}

function RewardNotice({ milestone, onClose }: RewardNoticeProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const backdropPressRef = useRef(false);
  const phaseRef = useRef<"active" | "closing" | "closed">("active");
  const [closingClip, setClosingClip] = useState<string | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const scale = useSyncExternalStore(subscribeToViewport, readNoticeScale);
  const reward = rewards[milestone];

  const finishClose = useCallback(() => {
    if (phaseRef.current === "closed") return;
    phaseRef.current = "closed";
    dialogRef.current?.close();
    onClose();
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  useEffect(() => {
    if (closingClip === null) return;
    const preference = window.matchMedia(REDUCED_MOTION);
    function finishWithoutMotion() {
      if (preference.matches) finishClose();
    }
    finishWithoutMotion();
    preference.addEventListener("change", finishWithoutMotion);
    return () => preference.removeEventListener("change", finishWithoutMotion);
  }, [closingClip, finishClose]);

  function requestClose() {
    if (phaseRef.current !== "active") return;
    phaseRef.current = "closing";
    if (window.matchMedia(REDUCED_MOTION).matches) {
      finishClose();
    } else {
      // Continue from the visible opening frame if the user closes immediately.
      setClosingClip(revealRef.current ? getComputedStyle(revealRef.current).clipPath : "inset(0)");
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="reward-notice"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      data-closing={closingClip !== null ? true : undefined}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        requestClose();
      }}
      onClose={(event) => {
        if (!event.currentTarget.open) finishClose();
      }}
      onPointerDownCapture={(event) => {
        backdropPressRef.current = event.isPrimary && event.button === 0 &&
          !(event.target instanceof Element && event.target.closest(".reward-notice__card"));
      }}
      onPointerCancel={() => { backdropPressRef.current = false; }}
      onClick={(event) => {
        const outsideCard = !(event.target instanceof Element && event.target.closest(".reward-notice__card"));
        const closeBackdrop = backdropPressRef.current && outsideCard;
        backdropPressRef.current = false;
        if (closeBackdrop) requestClose();
      }}
    >
      <div className="reward-notice__slot" style={{ width: BOARD_WIDTH * scale, height: BOARD_HEIGHT * scale }}>
        <div className="reward-notice__canvas" style={{ transform: `scale(${scale})` }}>
          <div
            ref={revealRef}
            className="reward-notice__reveal"
            style={closingClip === null ? undefined : { "--reward-close-clip": closingClip } as CSSProperties}
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget && event.animationName === "reward-notice-close") finishClose();
            }}
          >
            <div className="reward-notice__shade" aria-hidden="true" />
            <div className="reward-notice__card">
              <div className="reward-notice__inner-border" aria-hidden="true" />
              <h2 className="reward-notice__title" id={titleId}>心意已抵达</h2>
              <p className="reward-notice__english">A GIFT FOR OUR DAYS</p>
              <div className="reward-notice__gift-slot">
                <img className="reward-notice__gift" src={reward.gift} width={reward.imageSize} height={reward.imageSize} alt={`${milestone}天奖励礼盒`} draggable={false} />
              </div>
              <p className="reward-notice__name">{reward.title}</p>
              <p className="reward-notice__description" id={descriptionId}>累计签到 {milestone} 天奖励已收入珍藏</p>
              <button type="button" className="reward-notice__confirm" onClick={requestClose}>收下这份心意</button>
              <button type="button" className="reward-notice__close" aria-label="关闭奖励通知" onClick={requestClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export default RewardNotice;
