import type { Announcement } from "../types";

type AnnouncementPopupProps = {
  announcement: Announcement;
  isReadError: boolean;
  isReadPending: boolean;
  onRead: () => void;
};

function AnnouncementPopup({
  announcement,
  isReadError,
  isReadPending,
  onRead,
}: AnnouncementPopupProps) {
  return (
    <section
      aria-describedby="announcement-popup-content"
      aria-labelledby="announcement-popup-title"
      className="fixed left-1/2 top-1/2 z-30 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-md border border-neutral-300 bg-white p-5 text-neutral-900 shadow-lg"
      role="dialog"
    >
      <h2 id="announcement-popup-title" className="text-lg font-semibold">
        {announcement.title}
      </h2>
      <p id="announcement-popup-content" className="mt-3 whitespace-pre-wrap">
        {announcement.content}
      </p>

      {isReadError ? (
        <p className="mt-3 text-sm text-red-700" role="alert">
          标记已读失败，请重试。
        </p>
      ) : null}

      <button
        aria-busy={isReadPending}
        className="mt-5 rounded border border-neutral-500 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isReadPending}
        onClick={onRead}
        type="button"
      >
        {isReadPending ? "正在标记已读…" : "关闭并标记已读"}
      </button>
    </section>
  );
}

export default AnnouncementPopup;
