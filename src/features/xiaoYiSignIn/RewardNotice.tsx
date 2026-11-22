import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type RefObject } from "react";
import { BOARD_HEIGHT, BOARD_WIDTH, readBoardScale, subscribeToViewport } from "./sign-in-viewport";
import rewardPlaceholderPc from "../../assets/xiao-yi-sign-in/reward-placeholder-pc.png";
import rewardPlaceholderTouch from "../../assets/xiao-yi-sign-in/reward-placeholder-touch.png";
import "./reward-notice.css";

type RewardNoticeProps = {
  onClose: () => void;
  boardRef?: RefObject<HTMLDivElement | null>;
  touchSceneScale?: number;
  claim: { name: string; days: number; imageUrl: string | null; onClaim: () => void };
};

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function RewardNotice({ claim, onClose, boardRef, touchSceneScale }: RewardNoticeProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<"active" | "closing" | "closed">("active");
  const [closingClip, setClosingClip] = useState<string | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const scale = useSyncExternalStore(subscribeToViewport, readBoardScale);
  const mobile = scale === null;
  const [boardBounds, setBoardBounds] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  useLayoutEffect(() => {
    const board = boardRef?.current;
    if (!board || mobile) return;
    const measure = () => {
      const { left, top, width, height } = board.getBoundingClientRect();
      setBoardBounds({ left, top, width, height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(board);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [boardRef, mobile]);
  const boardScale = mobile ? touchSceneScale ?? 1 : boardBounds ? boardBounds.width / BOARD_WIDTH : scale;
  const reward = { gift: claim.imageUrl?.trim() || (mobile ? rewardPlaceholderTouch : rewardPlaceholderPc), title: claim.name.trim() ? claim.name : "奖励名称暂不可用", imageSize: 156 };
  const days = claim.days;

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

  function requestClose(accept = false) {
    if (phaseRef.current !== "active") return;
    phaseRef.current = "closing";
    if (accept) claim.onClaim();
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
      data-mobile={mobile ? true : undefined}
      style={mobile ? { width: 448 * (touchSceneScale ?? 1), height: 248.5 * (touchSceneScale ?? 1) } : undefined}
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
      onClick={(event) => {
        const outsideCard = !(event.target instanceof Element && event.target.closest(".reward-notice__card"));
        if (!outsideCard) requestClose(true);
      }}
    >
      <div className="reward-notice__slot" style={mobile ? undefined : boardBounds ? { position: "fixed", ...boardBounds } : { width: BOARD_WIDTH * scale, height: BOARD_HEIGHT * scale }}>
        <div className="reward-notice__canvas" style={boardScale === null ? undefined : { transform: `scale(${boardScale})` }}>
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
              <div
                className="reward-notice__body"
                role={mobile ? "region" : undefined}
                aria-label={mobile ? "奖励内容，可滚动查看" : undefined}
                tabIndex={mobile ? 0 : undefined}
              >
                <h2 className="reward-notice__title" id={titleId}>心意已抵达</h2>
                <p className="reward-notice__english">A GIFT FOR OUR DAYS</p>
                <div className="reward-notice__gift-slot">
                  <img className="reward-notice__gift" src={reward.gift} onError={(event) => { const fallback = mobile ? rewardPlaceholderTouch : rewardPlaceholderPc; if (event.currentTarget.getAttribute("src") !== fallback) { console.warn("奖励图片加载失败", event.currentTarget.src); event.currentTarget.src = fallback; } }} width={reward.imageSize} height={reward.imageSize} alt="" draggable={false} />
                </div>
                <p className="reward-notice__name">{reward.title}</p>
                <p className="reward-notice__description" id={descriptionId}>累计签到 {days} 天奖励</p>
              </div>
              <button type="button" className="reward-notice__confirm" onClick={() => requestClose(true)}>收下这份心意</button>
              <button type="button" className="reward-notice__close" aria-label="关闭奖励通知" onClick={() => requestClose(true)}>
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
