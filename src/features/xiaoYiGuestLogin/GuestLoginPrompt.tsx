import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import iris from "../../assets/xiao-yi-sign-in/iris.png";
import seal from "../../assets/xiao-yi-sign-in/seal.svg";
import "./guest-login-prompt.css";

type GuestLoginPromptProps = {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
  touchSceneScale?: number;
};

function isOutsideCard(dialog: HTMLDialogElement, x: number, y: number) {
  const bounds = dialog.getBoundingClientRect();
  return x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom;
}

function GuestLoginPrompt({ open, onClose, onLogin, touchSceneScale }: GuestLoginPromptProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [surfaceHeight, setSurfaceHeight] = useState<number>();
  const cancelRef = useRef<HTMLButtonElement>(null);
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
      cancelRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }

    return () => {
      backdropPressRef.current = false;
      if (dialog.open) dialog.close();
    };
  }, [open]);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!open || !surface || touchSceneScale === undefined) return;
    const measure = () => setSurfaceHeight(parseFloat(getComputedStyle(surface).height));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(surface);
    return () => observer.disconnect();
  }, [open, touchSceneScale]);

  function requestClose() {
    if (!open || closeRequestedRef.current) return;
    closeRequestedRef.current = true;
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className="guest-login-prompt"
      data-scene-scale={touchSceneScale !== undefined ? true : undefined}
      style={{ "--guest-scene-scale": touchSceneScale, "--guest-surface-height": surfaceHeight === undefined ? undefined : `${surfaceHeight}px` } as CSSProperties}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClose={(event) => {
        // A queued cleanup event may arrive after Strict Mode has reopened it.
        if (!event.currentTarget.open) requestClose();
      }}
      onPointerDownCapture={(event) => {
        backdropPressRef.current = event.isPrimary && event.button === 0 &&
          isOutsideCard(event.currentTarget, event.clientX, event.clientY);
      }}
      onPointerCancel={() => {
        backdropPressRef.current = false;
      }}
      onClick={(event) => {
        const clickedBackdrop = backdropPressRef.current &&
          isOutsideCard(event.currentTarget, event.clientX, event.clientY);
        backdropPressRef.current = false;
        if (clickedBackdrop) requestClose();
      }}
    >
      <div ref={surfaceRef} className="guest-login-prompt__surface">
        <div className="guest-login-prompt__decoration" aria-hidden="true">
          <div className="guest-login-prompt__paper" />
          <div className="guest-login-prompt__inner-border" />
          <img className="guest-login-prompt__seal" src={seal} alt="" />
          <img className="guest-login-prompt__iris" src={iris} alt="" />
        </div>
        <div className="guest-login-prompt__scroll">
          <div className="guest-login-prompt__content">
            <p className="guest-login-prompt__english">Daily Check In</p>
            <h2 className="guest-login-prompt__title" id={titleId}>登录后，开启每日逸签</h2>
            <p className="guest-login-prompt__description" id={descriptionId}>
              当前为游客模式，暂时无法使用每日签到。<br />
              登录后即可记录签到、领取奖励，收藏每日语录。
            </p>
            <div className="guest-login-prompt__actions">
              <button
                ref={cancelRef}
                type="button"
                className="guest-login-prompt__button guest-login-prompt__button--cancel"
                onClick={requestClose}
              >
                暂不登录
              </button>
              <button
                type="button"
                className="guest-login-prompt__button guest-login-prompt__button--login"
                onClick={onLogin}
              >
                去登录
              </button>
            </div>
            <p className="guest-login-prompt__helper">签到记录与每日语录将保存到你的账号。</p>
          </div>
        </div>
        <button
          type="button"
          className="guest-login-prompt__close"
          aria-label="关闭登录提示"
          onClick={requestClose}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </dialog>
  );
}

export default GuestLoginPrompt;
