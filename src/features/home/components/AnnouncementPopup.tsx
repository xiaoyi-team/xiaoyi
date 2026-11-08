import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import iris from "../../../assets/home/announcement/iris-default.png";
import flame from "../../../assets/home/announcement/flame-expanded.png";
import sailboat from "../../../assets/home/announcement/sailboat-popup.png";
import orbit from "../../../assets/home/announcement/orbit-popup.svg";
import close from "../../../assets/home/announcement/close-popup.svg";
import type { Announcement } from "../types";
import "./AnnouncementPopup.css";

type AnnouncementPopupProps = {
  announcement: Announcement;
  isReadError: boolean;
  isReadPending: boolean;
  onRead: () => void;
  onDismiss: () => void;
  returnFocusRef: RefObject<HTMLElement | null>;
  fallbackFocusRef: RefObject<HTMLDivElement | null>;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Shanghai", month: "2-digit", day: "2-digit",
});

function AnnouncementPopup({
  announcement, isReadError, isReadPending, onRead, onDismiss,
  returnFocusRef, fallbackFocusRef,
}: AnnouncementPopupProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const parsedDate = announcement.created_at ? new Date(announcement.created_at) : null;
  const date = parsedDate && !Number.isNaN(parsedDate.getTime())
    ? dateFormatter.format(parsedDate) : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    const fallbackHome = fallbackFocusRef.current;
    const previous = returnFocusRef.current ??
      (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    closeButtonRef.current?.focus();
    return () => {
      // Wait until the parent has removed inert in the same React commit.
      queueMicrotask(() => {
        if (dialog?.isConnected) return;
        if (previous?.isConnected && !previous.closest("[inert]") && previous !== document.body) {
          previous.focus();
          if (document.activeElement === previous) return;
        }
        fallbackHome?.querySelector<HTMLElement>(
          'button:not(:disabled):not([inert]), a[href]',
        )?.focus();
      });
    };
  }, [returnFocusRef, fallbackFocusRef]);

  return (
    <div className="announcement-popup-layer">
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-popup-title"
        aria-describedby="announcement-popup-content"
        className="announcement-popup"
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            if (!isReadPending) onDismiss();
          }
          if (event.key !== "Tab") return;
          const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), [tabindex="0"]',
          ));
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (!first) { event.preventDefault(); event.currentTarget.focus(); return; }
          const active = document.activeElement as HTMLElement;
          if (event.shiftKey && (active === first || !controls.includes(active))) {
            event.preventDefault(); last.focus();
          } else if (!event.shiftKey && (active === last || !controls.includes(active))) {
            event.preventDefault(); first.focus();
          }
        }}
      >
        <img className="announcement-popup__iris" src={iris} alt="" aria-hidden="true" />
        <img className="announcement-popup__sailboat" src={sailboat} alt="" aria-hidden="true" />
        <img className="announcement-popup__orbit" src={orbit} alt="" aria-hidden="true" />
        <img className="announcement-popup__flame" src={flame} alt="" aria-hidden="true" />
        <header className="announcement-popup__header">
          <h2 id="announcement-popup-title">最新公告</h2>
          <p className="announcement-popup__english">ANNOUNCEMENT</p>
        </header>
        <button ref={closeButtonRef} className="announcement-popup__close" aria-label="关闭公告弹窗" disabled={isReadPending} onClick={onDismiss} type="button">
          <img src={close} alt="" />
        </button>
        <div className="announcement-popup__body" tabIndex={0} role="region" aria-label="公告正文">
          <h3 className="announcement-popup__headline">{announcement.title}</h3>
          <div id="announcement-popup-content" className="announcement-popup__content">
            {announcement.content.split(/\r?\n/).map((paragraph, index) => (
              <p key={index}>{paragraph || "\u00a0"}</p>
            ))}
          </div>
          {date ? <time className="announcement-popup__date" dateTime={announcement.created_at}>{date}</time> : null}
        </div>
        <footer className="announcement-popup__footer">
          {isReadError ? <p className="announcement-popup__error" role="alert">标记已读失败，请重试。</p> : null}
          <button className="announcement-popup__confirm" aria-busy={isReadPending} disabled={isReadPending} onClick={onRead} type="button">
            {isReadPending ? "正在标记已读…" : "我知道了"}
          </button>
          <p className="announcement-popup__hint">稍后可在顶部公告栏再次查看</p>
        </footer>
      </section>
    </div>
  );
}

export default AnnouncementPopup;
