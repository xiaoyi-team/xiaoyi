import { useEffect, useState } from "react";
import { useHomeAnnouncements } from "../hooks/useHomeAnnouncements";

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
      className="relative z-20 mx-auto w-full max-w-3xl rounded-md bg-black/65 px-4 py-2 text-sm text-white shadow-md backdrop-blur-sm"
    >
      {isLoading ? (
        <p className="text-center">公告加载中…</p>
      ) : isError ? (
        <p className="text-center">公告暂时无法加载</p>
      ) : currentAnnouncement ? (
        <p className="text-center">
          <span className="font-medium">{currentAnnouncement.title}：</span>
          <span>{currentAnnouncement.content}</span>
        </p>
      ) : null}
    </section>
  );
}

export default AnnouncementBar;
