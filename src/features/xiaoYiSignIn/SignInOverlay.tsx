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
  // This local boundary preserves B2's scrolling layout on smaller viewports.
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

function isOutsideDialog(
  dialog: HTMLDialogElement,
  clientX: number,
  clientY: number,
) {
  const bounds = dialog.getBoundingClientRect();

  return (
    clientX < bounds.left ||
    clientX > bounds.right ||
    clientY < bounds.top ||
    clientY > bounds.bottom
  );
}

function SignInOverlay({ open, onClose }: SignInOverlayProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
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
        backdropPressRef.current =
          event.isPrimary &&
          event.button === 0 &&
          isOutsideDialog(event.currentTarget, event.clientX, event.clientY);
      }}
      onPointerCancel={() => {
        backdropPressRef.current = false;
      }}
      onClick={(event) => {
        const clickedBackdrop =
          backdropPressRef.current &&
          isOutsideDialog(event.currentTarget, event.clientX, event.clientY);

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
          关闭
        </button>
        <div
          className="xiao-yi-sign-in-viewport"
          role="region"
          aria-label={boardScale !== null ? "签到板内容" : "签到板内容，可滚动查看"}
          style={boardScale !== null ? { height: BOARD_HEIGHT * boardScale } : undefined}
          tabIndex={0}
        >
          <div
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
            <SignInBoard titleId={titleId} />
          </div>
        </div>
      </div>
    </dialog>
  );
}

export default SignInOverlay;
