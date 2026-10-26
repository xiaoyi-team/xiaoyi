import { useEffect, useId, useRef } from "react";
import "./sign-in.css";

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
  const descriptionId = useId();

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
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
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
      <h2 id={titleId} className="xiao-yi-sign-in-dialog__title">
        签到模块预览
      </h2>
      <p id={descriptionId} className="xiao-yi-sign-in-dialog__description">
        签到板将在后续阶段接入。
      </p>
      <button
        type="button"
        className="xiao-yi-sign-in-button"
        onClick={requestClose}
      >
        关闭
      </button>
    </dialog>
  );
}

export default SignInOverlay;
