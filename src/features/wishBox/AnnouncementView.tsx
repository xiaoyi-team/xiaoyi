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
      className="absolute inset-0 z-10 overflow-hidden"
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label="返回心愿盒"
        className="absolute z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        style={{
          left: "0%",
          top: "2.5%",
          width: "8.85417%",
          height: "6.85185%",
          borderRadius: "1.14583cqw",
        }}
      >
        <img
          src={backDoubleChevron}
          alt=""
          aria-hidden="true"
          className="absolute"
          style={{
            left: "4.11765%",
            top: "6.75676%",
            width: "43.52941%",
            height: "86.48649%",
          }}
        />
        <span
          className="absolute text-white"
          style={{
            left: "52.35294%",
            top: "20.27027%",
            width: "35.29412%",
            height: "58.10811%",
            fontFamily: '"Noto Serif SC", serif',
            fontWeight: 500,
            fontSize: "1.5625cqw",
            lineHeight: 1.43333,
            letterSpacing: 0,
            textShadow: "0 0 0.10417cqw #000",
          }}
        >
          返回
        </span>
      </button>

      <article
        className="absolute"
        style={{
          left: "8.33333%",
          top: "7.77778%",
          width: "83.33333%",
          height: "83.33333%",
          boxShadow: "0 0.20833cqw 0.96875cqw 0 #000",
        }}
      >
        <AnnouncementBoard announcement={announcement} />
      </article>
    </section>
  );
}

export default AnnouncementView;
