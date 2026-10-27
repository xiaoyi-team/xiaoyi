import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import SignInBoard from "./SignInBoard";
import "./sign-in.css";

const BOARD_WIDTH = 1765;
const BOARD_HEIGHT = 909;
const VIEWPORT_MARGIN = 16;

function subscribeToViewport(onResize: () => void) {
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}

function readBoardScale() {
  // Local module boundary; PC's R1 scaling remains unchanged.
  if (window.innerWidth <= 1024) return null;

  return Math.min(
    1,
    Math.max(0, document.documentElement.clientWidth - VIEWPORT_MARGIN * 2) /
      BOARD_WIDTH,
    Math.max(0, window.innerHeight - VIEWPORT_MARGIN * 2) / BOARD_HEIGHT,
  );
}

type SignInOverlayProps = {
  open: boolean;
  onClose: () => void;
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

function SignInOverlay({ open, onClose }: SignInOverlayProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const backdropPressRef = useRef(false);
  const closeRequestedRef = useRef(false);
  const titleId = useId();
  const boardScale = useSyncExternalStore(subscribeToViewport, readBoardScale);

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

  return (
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
        if (!event.currentTarget.open) requestClose();
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
            <SignInBoard titleId={titleId} mobile={boardScale === null} />
          </div>
        </div>
      </div>
    </dialog>
  );
}

export default SignInOverlay;
