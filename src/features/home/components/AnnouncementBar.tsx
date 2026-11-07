import { useEffect, useState } from "react";
import arrow from "../../../assets/home/announcement/arrow.svg";
import iris from "../../../assets/home/announcement/iris-default.png";
import orbit from "../../../assets/home/announcement/orbit.svg";
import speaker from "../../../assets/home/announcement/speaker.svg";
import star from "../../../assets/home/announcement/star.svg";
import { useHomeAnnouncements } from "../hooks/useHomeAnnouncements";
import "./AnnouncementBar.css";

// Temporary low-fidelity value; replace it when the formal motion timing is confirmed.
const TEMPORARY_ROTATION_INTERVAL_MS = 3_000;

function AnnouncementBar() {
  const { data, isLoading, isError } = useHomeAnnouncements();
  const announcements = data?.announcements ?? [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentAnnouncement =
    announcements.length > 0
      ? announcements[currentIndex % announcements.length]
      : null;

  useEffect(() => {
    if (announcements.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % announcements.length);
    }, TEMPORARY_ROTATION_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [announcements.length]);

  if (!isLoading && !isError && announcements.length === 0) {
    return null;
  }

  return (
    <section
      aria-busy={isLoading}
      aria-label="首页公告"
      aria-live="polite"
      className="announcement-bar"
    >
      <span className="announcement-bar__orbit" aria-hidden="true">
        <img src={orbit} alt="" />
      </span>
      <img className="announcement-bar__star announcement-bar__star--small" src={star} alt="" aria-hidden="true" />
      <img className="announcement-bar__star announcement-bar__star--large" src={star} alt="" aria-hidden="true" />
      <img className="announcement-bar__iris" src={iris} alt="" aria-hidden="true" />

      <span className="announcement-bar__icon" aria-hidden="true">
        <img src={speaker} alt="" />
      </span>
      <div className="announcement-bar__text">
        {isLoading ? (
          <p>公告加载中…</p>
        ) : isError ? (
          <p>公告暂时无法加载</p>
        ) : currentAnnouncement ? (
          <p>
            <span>{currentAnnouncement.title}：</span>
            <span>{currentAnnouncement.content}</span>
          </p>
        ) : null}
      </div>
      <span className="announcement-bar__icon announcement-bar__icon--arrow" aria-hidden="true">
        <img src={arrow} alt="" />
      </span>
    </section>
  );
}

export default AnnouncementBar;
