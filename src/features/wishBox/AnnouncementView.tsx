import { useEffect, useLayoutEffect, useRef, useState } from "react";
import backTouch from "../../assets/wish-box/announcement-back-touch.svg";
import backDoubleChevron from "../../assets/wish-box/back-double-chevron.svg";
import AnnouncementBoard from "./AnnouncementBoard";
import WishBoxLoading from "./WishBoxLoading";
import gardenBackground from "../../assets/wish-box/wish-box-home-background.png";
import type { AnnouncementViewData } from "./announcementSample";

type AnnouncementViewProps = {
  announcement: AnnouncementViewData | null;
  announcementStatus: "loading" | "error" | "ready";
  onRetryAnnouncement: () => Promise<unknown>;
  onClose: () => void;
};

function AnnouncementView({ announcement, announcementStatus, onRetryAnnouncement, onClose }: AnnouncementViewProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const detailRef = useRef<HTMLElement>(null);
  const wasCenterLoadingRef = useRef(false);
  const retryInFlightRef = useRef(false);
  const closingRef = useRef(false);
  const [retryInFlight, setRetryInFlight] = useState(false);
  const showCenterLoading = announcementStatus === "loading" && !retryInFlight;

  useLayoutEffect(() => {
    const detail = detailRef.current;
    if (!detail) return;
    if (showCenterLoading && !wasCenterLoadingRef.current && window.matchMedia("(max-width: 1024px)").matches) {
      detail.focus({ preventScroll: true });
    } else if (!showCenterLoading && wasCenterLoadingRef.current && document.activeElement === detail) {
      closeButtonRef.current?.focus({ preventScroll: true });
    }
    wasCenterLoadingRef.current = showCenterLoading;
  }, [showCenterLoading]);

  useEffect(() => {
    if (detailRef.current?.dataset.announcementCenterLoading !== "true" || !window.matchMedia("(max-width: 1024px)").matches) {
      closeButtonRef.current?.focus();
    }
  }, []);

  const retryAnnouncement = () => {
    if (retryInFlightRef.current) return;
    retryInFlightRef.current = true;
    setRetryInFlight(true);
    void onRetryAnnouncement().finally(() => {
      retryInFlightRef.current = false;
      setRetryInFlight(false);
    });
  };

  const closeAnnouncement = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    onClose();
  };

  return (
    <section
      ref={detailRef}
      tabIndex={-1}
      aria-busy={showCenterLoading || undefined}
      data-announcement-center-loading={showCenterLoading ? "true" : undefined}
      aria-label="当期活动公告详情"
      className="wish-box-announcement-detail notice-zoom absolute inset-0 z-10 overflow-hidden"
      style={announcementStatus === "loading" ? { backgroundColor: "#fff" } : undefined}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          closeAnnouncement();
          return;
        }
        if (showCenterLoading && window.matchMedia("(max-width: 1024px)").matches && event.key === "Tab") {
          event.preventDefault();
        }
      }}
    >
      {announcementStatus === "loading" ? (
        <img src={gardenBackground} alt="" aria-hidden="true" className="wish-box-home-background pointer-events-none absolute left-0 top-0 w-full object-contain opacity-55" />
      ) : null}
      <button
        type="button"
        onClick={closeAnnouncement}
        tabIndex={-1}
        aria-label="关闭公告返回心愿盒"
        className="wish-box-announcement-dismiss absolute inset-0"
      />
      <button data-return-feedback
        ref={closeButtonRef}
        type="button"
        onClick={closeAnnouncement}
        aria-label="返回心愿盒"
        className="wish-box-announcement-return absolute z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <picture>
          <source media="(max-width: 1024px)" srcSet={backTouch} />
          <img src={backDoubleChevron} alt="" aria-hidden="true" />
        </picture>
        <span className="absolute text-white">
          返回
        </span>
      </button>

      <div className="wish-box-announcement-scroll">
        <article
          hidden={announcementStatus === "loading"}
          className="wish-box-announcement-article absolute"
          style={{
            left: "var(--announcement-article-left, 8.33333%)",
            top: "var(--announcement-article-top, 7.77778%)",
            width: "var(--announcement-article-width, 83.33333%)",
            height: "var(--announcement-article-height, 83.33333%)",
          }}
        >
          <AnnouncementBoard
            data={announcementStatus === "ready" ? announcement : null}
            interactive
            statusContent={announcementStatus === "error" ? <>
                <p>公告加载失败</p>
                  <button type="button" onClick={retryAnnouncement} disabled={retryInFlight} className="rounded border px-3 py-1">
                    重试
                  </button>
            </> : undefined}
          />
        </article>
      </div>
      {announcementStatus === "loading" ? <WishBoxLoading variant="center" className="z-10" /> : null}
    </section>
  );
}

export default AnnouncementView;
