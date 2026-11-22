import type { SignInAwardListView } from "./useSignInAwardList";
import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode, type RefObject } from "react";
import SignInBoard, { type SignInCalendarBinding, type FormalSignInBinding } from "./SignInBoard";
import DrawCardOverlay from "./DrawCardOverlay";
import type { SignInAddResponse } from "./sign-in-add";
import type { SignInStatView } from "./useSignInStat";
import type { SignInQuoteView } from "./useSignInQuote";
import { BOARD_HEIGHT, BOARD_WIDTH, readBoardScale, subscribeToViewport } from "./sign-in-viewport";
import "./sign-in.css";

import type { SignInAwardClaim } from "./useSignInAwardGet";

type SignInOverlayProps = {
  rewardAnchorRef?: RefObject<HTMLDivElement | null>;
  sceneRef?: RefObject<HTMLDivElement | null>;
  touchSceneScale?: number;
  awardClaim?: SignInAwardClaim;
  onOpenAward?: (awardId: number) => void;
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
  statView: SignInStatView;
  awardListView: SignInAwardListView;
  quoteView?: SignInQuoteView;
  quoteResult?: SignInAddResponse | null;
  calendar: SignInCalendarBinding;
  signIn: FormalSignInBinding;
  drawResult?: SignInAddResponse | null;
  onDismissDraw?: () => void;
};

function isOutsidePanel(
  panel: HTMLElement,
  clientX: number,
  clientY: number,
) {
  const bounds = panel.getBoundingClientRect();

  return (
    clientX < bounds.left ||
    clientX > bounds.right ||
    clientY < bounds.top ||
    clientY > bounds.bottom
  );
}

function readSignInBoardScale() {
  const viewportScale = readBoardScale();
  if (viewportScale === null) return null;

  // A1 fills the layout viewport: 100% width and 100dvh height.
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight;
  if (
    !Number.isFinite(viewportWidth) ||
    !Number.isFinite(viewportHeight) ||
    viewportWidth <= 0 ||
    viewportHeight <= 0
  ) return 0;

  return Math.min(1, viewportWidth / BOARD_WIDTH, viewportHeight / BOARD_HEIGHT);
}

function SignInOverlay({ rewardAnchorRef, sceneRef, touchSceneScale, open, onClose, children, statView, awardListView, awardClaim, onOpenAward, quoteView, quoteResult, calendar, signIn, drawResult, onDismissDraw }: SignInOverlayProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const backdropPressRef = useRef(false);
  const closeRequestedRef = useRef(false);
  const titleId = useId();
  const viewportBoardScale = useSyncExternalStore(subscribeToViewport, readSignInBoardScale);
  const [sceneBounds, setSceneBounds] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const boardScale = sceneRef && viewportBoardScale !== null && sceneBounds
    ? sceneBounds.width / 1920 : viewportBoardScale;
  const touchScale = sceneRef && viewportBoardScale === null && sceneBounds && touchSceneScale !== undefined
    ? touchSceneScale
    : null;
  const activeDrawResult = open && onDismissDraw ? drawResult : null;

  useLayoutEffect(() => {
    const scene = sceneRef?.current;
    if (!scene || !open) return;
    const measure = () => {
      const { left, top, width, height } = scene.getBoundingClientRect();
      setSceneBounds({ left, top, width, height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scene);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, sceneRef]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    backdropPressRef.current = false;
    closeRequestedRef.current = false;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }

    return () => {
      backdropPressRef.current = false;
      if (dialog.open) dialog.close();
    };
  }, [open]);

  function requestClose() {
    if (!open || closeRequestedRef.current) return;

    closeRequestedRef.current = true;
    onClose();
  }

  const signInDialog = (
    <dialog
      ref={dialogRef}
      className="xiao-yi-sign-in-dialog"
      data-pc-fit={boardScale !== null ? true : undefined}
      data-mobile={boardScale === null ? true : undefined}
      data-scene={sceneRef ? true : undefined}
      style={!sceneRef && boardScale !== null ? { width: BOARD_WIDTH * boardScale } : undefined}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClose={(event) => {
        // close events are queued: an earlier cleanup may have already reopened.
        if (!event.currentTarget.open) {
          requestClose();
        }
      }}
      onPointerDownCapture={(event) => {
        const panel = sceneRef || boardScale === null ? boardRef.current : event.currentTarget;
        backdropPressRef.current =
          panel !== null &&
          (!sceneRef || (sceneRef.current !== null && !isOutsidePanel(sceneRef.current, event.clientX, event.clientY))) &&
          event.isPrimary &&
          event.button === 0 &&
          isOutsidePanel(panel, event.clientX, event.clientY);
      }}
      onPointerCancel={() => {
        backdropPressRef.current = false;
      }}
      onClick={(event) => {
        const panel = sceneRef || boardScale === null ? boardRef.current : event.currentTarget;
        const clickedBackdrop =
          panel !== null &&
          (!sceneRef || (sceneRef.current !== null && !isOutsidePanel(sceneRef.current, event.clientX, event.clientY))) &&
          backdropPressRef.current &&
          isOutsidePanel(panel, event.clientX, event.clientY);

        backdropPressRef.current = false;
        if (clickedBackdrop) requestClose();
      }}
    >
      <div className="xiao-yi-sign-in-shell" style={sceneRef && sceneBounds ? {
        left: sceneBounds.left, top: sceneBounds.top, width: sceneBounds.width, height: sceneBounds.height,
      } as CSSProperties : undefined}>
        <div
          className="xiao-yi-sign-in-viewport"
          ref={rewardAnchorRef}
          role="region"
          aria-label={boardScale !== null ? "签到板内容" : "签到板内容，可滚动查看"}
          style={boardScale !== null ? { height: BOARD_HEIGHT * boardScale, ...(sceneRef ? { width: BOARD_WIDTH * boardScale } : {}) } : touchScale !== null ? { width: 448 * touchScale, height: 248.5 * touchScale } : undefined}
          tabIndex={0}
        >
          <div
            ref={boardRef}
            className="xiao-yi-sign-in-scale-layer"
            style={
              boardScale !== null
                ? {
                    width: BOARD_WIDTH,
                    height: BOARD_HEIGHT,
                    transform: `scale(${boardScale})`,
                  }
                : touchScale !== null ? { transform: `scale(${touchScale})` } : undefined
            }
          >
            <SignInBoard titleId={titleId} mobile={boardScale === null} statView={statView} awardListView={awardListView} awardClaim={awardClaim} onOpenAward={onOpenAward} quoteView={quoteView} quoteResult={quoteResult} calendar={calendar} signIn={signIn} />
          </div>
        </div>
        {children}
      </div>
    </dialog>
  );

  return (
    <>
      {signInDialog}
      {activeDrawResult && onDismissDraw && (
        <DrawCardOverlay result={activeDrawResult} open onCollect={onDismissDraw} onDismiss={onDismissDraw} sceneBounds={sceneBounds} sceneScale={boardScale} touchSceneScale={touchSceneScale} />
      )}
    </>
  );
}

export default SignInOverlay;
