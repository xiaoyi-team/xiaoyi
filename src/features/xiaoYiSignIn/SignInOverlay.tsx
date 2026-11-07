import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import SignInBoard from "./SignInBoard";
import DrawCardOverlay from "./DrawCardOverlay";
import { DEMO_DRAW_QUOTE, type SignInDemoState } from "./sign-in-demo";
import type { SignInStatView } from "./useSignInStat";
import { BOARD_HEIGHT, BOARD_WIDTH, readBoardScale, subscribeToViewport } from "./sign-in-viewport";
import "./sign-in.css";

type SignInOverlayProps = {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
  statView?: SignInStatView;
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

  const sceneScale = Math.min(1, viewportWidth / 1920, viewportHeight / 1080);

  // Both rectangles are centered. Their intersection takes the smaller span;
  // viewportScale already includes the 16px safety margin, so do not deduct it again.
  return Math.min(
    viewportScale,
    1920 * sceneScale / BOARD_WIDTH,
    1080 * sceneScale / BOARD_HEIGHT,
  );
}

function SignInOverlay({ open, onClose, children, statView }: SignInOverlayProps) {
  const [demo, setDemo] = useState<SignInDemoState>({ todaySigned: false, totalDays: 14, todayQuote: null });
  const [drawOpen, setDrawOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const backdropPressRef = useRef(false);
  const closeRequestedRef = useRef(false);
  const titleId = useId();
  const boardScale = useSyncExternalStore(subscribeToViewport, readSignInBoardScale);

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

  function handleSignIn() {
    if (!open || drawOpen) return;

    setDemo((previous) => previous.todaySigned
      ? previous
      : { ...previous, todaySigned: true, totalDays: previous.totalDays + 1 });
    setDrawOpen(true);
  }

  function handleCollect() {
    if (!open || !drawOpen) return;

    setDemo((previous) => previous.todayQuote === DEMO_DRAW_QUOTE
      ? previous
      : { ...previous, todayQuote: DEMO_DRAW_QUOTE });
    setDrawOpen(false);
  }

  const signInDialog = (
    <dialog
      ref={dialogRef}
      className="xiao-yi-sign-in-dialog"
      data-pc-fit={boardScale !== null ? true : undefined}
      data-mobile={boardScale === null ? true : undefined}
      style={boardScale !== null ? { width: BOARD_WIDTH * boardScale } : undefined}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClose={(event) => {
        // close events are queued: an earlier cleanup may have already reopened.
        if (!event.currentTarget.open) {
          setDrawOpen(false);
          requestClose();
        }
      }}
      onPointerDownCapture={(event) => {
        const panel = boardScale === null ? boardRef.current : event.currentTarget;
        backdropPressRef.current =
          panel !== null &&
          event.isPrimary &&
          event.button === 0 &&
          isOutsidePanel(panel, event.clientX, event.clientY);
      }}
      onPointerCancel={() => {
        backdropPressRef.current = false;
      }}
      onClick={(event) => {
        const panel = boardScale === null ? boardRef.current : event.currentTarget;
        const clickedBackdrop =
          panel !== null &&
          backdropPressRef.current &&
          isOutsidePanel(panel, event.clientX, event.clientY);

        backdropPressRef.current = false;
        if (clickedBackdrop) requestClose();
      }}
    >
      <div className="xiao-yi-sign-in-shell">
        <button
          type="button"
          className="xiao-yi-sign-in-button xiao-yi-sign-in-close"
          onClick={requestClose}
        >
          <span className="xiao-yi-sign-in-close__label">关闭</span>
          <svg className="xiao-yi-sign-in-close__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
        <div
          className="xiao-yi-sign-in-viewport"
          role="region"
          aria-label={boardScale !== null ? "签到板内容" : "签到板内容，可滚动查看"}
          style={boardScale !== null ? { height: BOARD_HEIGHT * boardScale } : undefined}
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
                : undefined
            }
          >
            <SignInBoard titleId={titleId} mobile={boardScale === null} demo={demo} statView={statView} onSignIn={handleSignIn} />
          </div>
        </div>
        {children}
      </div>
    </dialog>
  );

  return (
    <>
      {signInDialog}
      <DrawCardOverlay open={open && drawOpen} autoPlay onCollect={handleCollect} />
    </>
  );
}

export default SignInOverlay;
