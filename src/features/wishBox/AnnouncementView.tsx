import { useEffect, useRef } from "react";
import backDoubleChevron from "../../assets/wish-box/back-double-chevron.svg";
import AnnouncementBoard, {
  type AnnouncementDisplayFixture,
} from "./AnnouncementBoard";

export type { AnnouncementDisplayFixture } from "./AnnouncementBoard";

type AnnouncementViewProps = {
  announcement: AnnouncementDisplayFixture;
  onClose: () => void;
};

function AnnouncementView({ announcement, onClose }: AnnouncementViewProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  return (
    <section
      aria-label="当期活动公告详情"
      className="wish-box-announcement-detail absolute inset-0 z-10 overflow-hidden"
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
        style={{
          left: "var(--announcement-return-left, 0%)",
          top: "var(--announcement-return-top, 2.5%)",
          width: "var(--announcement-return-width, 8.85417%)",
          height: "var(--announcement-return-height, 6.85185%)",
          borderRadius: "var(--announcement-return-radius, 1.14583cqw)",
        }}
      >
        <img
          src={backDoubleChevron}
          alt=""
          aria-hidden="true"
          className="absolute"
          style={{
            left: "var(--announcement-return-icon-left, 4.11765%)",
            top: "var(--announcement-return-icon-top, 6.75676%)",
            width: "var(--announcement-return-icon-width, 43.52941%)",
            height: "var(--announcement-return-icon-height, 86.48649%)",
          }}
        />
        <span
          className="absolute text-white"
          style={{
            left: "var(--announcement-return-text-left, 52.35294%)",
            top: "var(--announcement-return-text-top, 20.27027%)",
            width: "var(--announcement-return-text-width, 35.29412%)",
            height: "var(--announcement-return-text-height, 58.10811%)",
            fontFamily: '"Noto Serif SC", serif',
            fontWeight: "var(--announcement-return-weight, 500)",
            fontSize: "var(--announcement-return-font-size, 1.5625cqw)",
            lineHeight: "var(--announcement-return-line-height, 1.43333)",
            letterSpacing: 0,
            textShadow: "0 0 0.10417cqw #000",
          }}
        >
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
            boxShadow: "0 0.20833cqw 0.96875cqw 0 #000",
          }}
        >
          <AnnouncementBoard announcement={announcement} />
        </article>
      </div>
    </section>
  );
}

export default AnnouncementView;
