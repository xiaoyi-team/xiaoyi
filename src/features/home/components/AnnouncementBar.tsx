import { useEffect, useRef, useState } from "react";
import arrow from "../../../assets/home/announcement/arrow.svg";
import close from "../../../assets/home/announcement/close.svg";
import flame from "../../../assets/home/announcement/flame-expanded.png";
import iris from "../../../assets/home/announcement/iris-default.png";
import orbitCorner from "../../../assets/home/announcement/orbit-corner-expanded.svg";
import orbit from "../../../assets/home/announcement/orbit.svg";
import sailboat from "../../../assets/home/announcement/sailboat-expanded.png";
import speaker from "../../../assets/home/announcement/speaker.svg";
import star from "../../../assets/home/announcement/star.svg";
import { useHomeAnnouncements } from "../hooks/useHomeAnnouncements";
import type { Announcement } from "../types";
import "./AnnouncementBar.css";

// Temporary low-fidelity value; replace it when the formal motion timing is confirmed.
const TEMPORARY_ROTATION_INTERVAL_MS = 3_000;
const DISSOLVE_DURATION_MS = 200;

type BarVisualProps = {
  announcement: Announcement | null;
  isLoading: boolean;
  isError: boolean;
};

function BarVisual({ announcement, isLoading, isError }: BarVisualProps) {
  return (
    <>
      <span className="announcement-bar__orbit" aria-hidden="true">
        <img src={orbit} alt="" />
      </span>
      <img className="announcement-bar__star announcement-bar__star--small" src={star} alt="" aria-hidden="true" />
      <img className="announcement-bar__star announcement-bar__star--large" src={star} alt="" aria-hidden="true" />
      <img className="announcement-bar__iris" src={iris} alt="" aria-hidden="true" />
      <span className="announcement-bar__icon" aria-hidden="true">
        <img src={speaker} alt="" />
      </span>
      <span className="announcement-bar__text" aria-live="polite">
        {isLoading ? (
          <span className="announcement-bar__line">公告加载中…</span>
        ) : isError ? (
          <span className="announcement-bar__line">公告暂时无法加载</span>
        ) : announcement ? (
          <span className="announcement-bar__line">
            <span>{announcement.title}：</span>
            <span>{announcement.content}</span>
          </span>
        ) : null}
      </span>
      <span className="announcement-bar__icon announcement-bar__icon--arrow" aria-hidden="true">
        <img src={arrow} alt="" />
      </span>
    </>
  );
}

function AnnouncementBar() {
  const { data, isLoading, isError } = useHomeAnnouncements();
  const announcements = data?.announcements ?? [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const restoreTriggerFocusRef = useRef(false);
  const currentAnnouncement =
    announcements.length > 0
      ? announcements[currentIndex % announcements.length]
      : null;
  const canExpand = !isLoading && !isError && announcements.length > 0;
  const showExpanded = isExpanded && canExpand;

  useEffect(() => {
    if (announcements.length <= 1) {
      return;
    }
    const intervalId = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % announcements.length);
    }, TEMPORARY_ROTATION_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [announcements.length]);

  useEffect(() => {
    if (showExpanded && !isClosing) {
      closeRef.current?.focus();
    } else if (!showExpanded && restoreTriggerFocusRef.current) {
      triggerRef.current?.focus();
      restoreTriggerFocusRef.current = false;
    }
  }, [showExpanded, isClosing]);

  useEffect(() => {
    if (!canExpand && isExpanded) {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      statusRef.current?.focus();
      const resetTimerId = window.setTimeout(() => {
        setIsExpanded(false);
        setIsClosing(false);
      }, 0);
      return () => window.clearTimeout(resetTimerId);
    }
  }, [canExpand, isExpanded]);

  useEffect(() => () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
  }, []);

  function finishClosing() {
    closeTimerRef.current = null;
    restoreTriggerFocusRef.current = true;
    setIsExpanded(false);
    setIsClosing(false);
  }

  function handleClose() {
    if (isClosing) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finishClosing();
      return;
    }
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(finishClosing, DISSOLVE_DURATION_MS);
  }

  if (!isLoading && !isError && announcements.length === 0) {
    return null;
  }

  return (
    <section
      aria-busy={isLoading}
      aria-label="首页公告"
      className={"announcement" + (showExpanded ? " announcement--expanded" : "")}
    >
      {canExpand ? (
        <button
          ref={triggerRef}
          aria-controls="home-announcement-panel"
          aria-expanded={showExpanded}
          aria-label="展开最新公告"
          className="announcement-bar announcement-bar--trigger"
          inert={showExpanded}
          onClick={() => setIsExpanded(true)}
          tabIndex={showExpanded ? -1 : 0}
          type="button"
        >
          <BarVisual announcement={currentAnnouncement} isLoading={isLoading} isError={isError} />
        </button>
      ) : (
        <div ref={statusRef} className="announcement-bar" tabIndex={-1}>
          <BarVisual announcement={currentAnnouncement} isLoading={isLoading} isError={isError} />
        </div>
      )}
      {showExpanded ? (
        <div className={"announcement__expanded" + (isClosing ? " announcement__expanded--closing" : "")}>
          <img className="announcement__sailboat" src={sailboat} alt="" aria-hidden="true" />
          <img className="announcement__corner-orbit" src={orbitCorner} alt="" aria-hidden="true" />
          <div className="announcement-bar announcement-bar--expanded">
            <BarVisual announcement={currentAnnouncement} isLoading={false} isError={false} />
          </div>
          <div id="home-announcement-panel" className="announcement__panel">
            <img className="announcement__flame" src={flame} alt="" aria-hidden="true" />
            <img className="announcement__panel-star announcement__panel-star--small" src={star} alt="" aria-hidden="true" />
            <img className="announcement__panel-star announcement__panel-star--large" src={star} alt="" aria-hidden="true" />
            <div className="announcement__panel-heading">
              <h2 className="announcement__panel-title">最新公告</h2>
              <span className="announcement__panel-english" aria-hidden="true">ANNOUNCEMENTS</span>
              <span className="announcement__panel-rule" aria-hidden="true" />
              <button
                ref={closeRef}
                aria-label="收起公告列表"
                className="announcement__close"
                onClick={handleClose}
                type="button"
              >
                <img src={close} alt="" aria-hidden="true" />
              </button>
            </div>
            <ul className="announcement__list" aria-label="最新公告列表">
              {announcements.map((announcement) => (
                <li className="announcement__item" key={announcement.id}>
                  <span className="announcement__item-title">{announcement.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AnnouncementBar;
