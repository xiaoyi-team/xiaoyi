import { useEffect, useRef } from "react";
import backTouch from "../../assets/wish-box/announcement-back-touch.svg";
import backDoubleChevron from "../../assets/wish-box/back-double-chevron.svg";
import AnnouncementBoard from "./AnnouncementBoard";
import type { AnnouncementViewData } from "./announcementSample";

type AnnouncementViewProps = {
  announcement: AnnouncementViewData | null;
  announcementStatus: "loading" | "error" | "ready";
  onRetryAnnouncement: () => void;
  onClose: () => void;
};

function AnnouncementView({ announcement, announcementStatus, onRetryAnnouncement, onClose }: AnnouncementViewProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  return (
    <section
      aria-label="当期活动公告详情"
      className="wish-box-announcement-detail notice-zoom absolute inset-0 z-10 overflow-hidden"
    >
      <button
        type="button"
        onClick={onClose}
        tabIndex={-1}
        aria-label="关闭公告返回心愿盒"
        className="wish-box-announcement-dismiss absolute inset-0"
      />
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label="返回心愿盒"
        className="wish-box-announcement-return absolute z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <picture>
          <source media="(orientation: landscape) and (max-width: 1100px) and (max-height: 600px) and (any-pointer: coarse)" srcSet={backTouch} />
          <img src={backDoubleChevron} alt="" aria-hidden="true" />
        </picture>
        <span className="absolute text-white">
          返回
        </span>
      </button>

      <div className="wish-box-announcement-scroll">
        <article
          className="wish-box-announcement-article absolute"
          style={{
            left: "var(--announcement-article-left, 8.33333%)",
            top: "var(--announcement-article-top, 7.77778%)",
            width: "var(--announcement-article-width, 83.33333%)",
            height: "var(--announcement-article-height, 83.33333%)",
          }}
        >
          {announcement && announcementStatus === "ready" ? (
            <AnnouncementBoard data={announcement} interactive />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-center" role={announcementStatus === "error" ? "alert" : "status"}>
              <div className="flex flex-col items-center gap-3">
                <p>{announcementStatus === "error" ? "公告加载失败" : "公告加载中"}</p>
                {announcementStatus === "error" ? (
                  <button type="button" onClick={onRetryAnnouncement} className="rounded border px-3 py-1">
                    重试
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

export default AnnouncementView;
