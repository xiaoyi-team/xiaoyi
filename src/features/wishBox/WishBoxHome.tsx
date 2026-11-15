import type { Ref } from "react";
import { Link } from "react-router";
import AnnouncementBoard from "./AnnouncementBoard";
import type { AnnouncementViewData } from "./announcementSample";
import backDoubleChevron from "../../assets/wish-box/back-double-chevron.svg";
import gardenBackground from "../../assets/wish-box/wish-box-home-background.png";
import wishlandSign from "../../assets/wish-box/wishland-sign.png";
import mobileHatchLeft from "../../assets/wish-box/mobile-wishland-hatch-left.svg";
import mobileHatchRight from "../../assets/wish-box/mobile-wishland-hatch-right.svg";
import mobileScript from "../../assets/wish-box/mobile-wishland-script.png";

type WishBoxHomeProps = {
  announcement: AnnouncementViewData | null;
  announcementStatus: "loading" | "error" | "ready";
  onOpenAnnouncement: () => void;
  announcementButtonRef: Ref<HTMLButtonElement>;
  onOpenTimeline: () => void;
  wishlandButtonRef: Ref<HTMLButtonElement>;
  inactive: boolean;
};

function WishBoxHome({
  announcement,
  announcementStatus,
  onOpenAnnouncement,
  announcementButtonRef,
  onOpenTimeline,
  wishlandButtonRef,
  inactive,
}: WishBoxHomeProps) {
  return (
    <div
      className="wish-box-home absolute inset-0"
      inert={inactive}
      aria-hidden={inactive}
    >
      <div className="wish-box-home-plane absolute inset-0">
        <img
          src={gardenBackground}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-contain"
        />

        <h1
          className="wish-box-home-sign absolute"
          style={{
            left: "55.15625%",
            top: "35.74074%",
            width: "var(--wish-box-home-sign-width, 15.67708%)",
            height: "var(--wish-box-home-sign-height, 13.33333%)",
          }}
        >
          <button
            ref={wishlandButtonRef}
            type="button"
            onClick={onOpenTimeline}
            aria-label="进入时间轴"
            className="block h-full w-full cursor-pointer border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4c392b]"
          >
            <img
              src={wishlandSign}
              alt="心愿盒 Wishland"
              className="wish-box-home-sign-image h-full w-full object-contain"
            />
            <span className="wish-box-home-wordmark" aria-hidden="true">
              <img
                src={mobileHatchLeft}
                alt=""
                width={64}
                height={10}
                className="wish-box-home-wordmark-hatch-left"
              />
              <img
                src={mobileHatchRight}
                alt=""
                width={64}
                height={10}
                className="wish-box-home-wordmark-hatch-right"
              />
              <img
                src={mobileScript}
                alt=""
                width={62}
                height={35}
                className="wish-box-home-wordmark-script"
              />
              <span className="wish-box-home-wordmark-chinese">心愿盒</span>
              <span className="wish-box-home-wordmark-rule" />
              <span className="wish-box-home-wordmark-english">Wishland</span>
            </span>
          </button>
        </h1>

        {!inactive ? (
          <Link
            to="/home"
            aria-label="返回首页"
            className="wish-box-home-return absolute focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            style={{
              left: "var(--wish-box-home-return-left, 3.95833%)",
              top: "var(--wish-box-home-return-top, 2.31481%)",
              width: "var(--wish-box-home-return-width, 8.85417%)",
              height: "var(--wish-box-home-return-height, 6.85185%)",
              borderRadius: "var(--wish-box-home-return-radius, 1.14583cqw)",
            }}
          >
            <img
              src={backDoubleChevron}
              alt=""
              aria-hidden="true"
              className="absolute"
              style={{
                left: "var(--wish-box-home-return-icon-left, 4.11765%)",
                top: "var(--wish-box-home-return-content-top, 6.75676%)",
                width: "var(--wish-box-home-return-icon-width, 43.52941%)",
                height: "var(--wish-box-home-return-content-height, 86.48649%)",
              }}
            />
            <span
              className="absolute text-white"
              style={{
                left: "var(--wish-box-home-return-text-left, 52.35294%)",
                top: "var(--wish-box-home-return-content-top, 20.27027%)",
                width: "var(--wish-box-home-return-text-width, 35.29412%)",
                height: "var(--wish-box-home-return-content-height, 58.10811%)",
                fontFamily: '"Noto Serif SC", serif',
                fontSize: "var(--wish-box-home-return-font-size, 1.5625cqw)",
                lineHeight: "var(--wish-box-home-return-line-height, 1.43333)",
                letterSpacing: 0,
              }}
            >
              返回
            </span>
          </Link>
        ) : null}

        <div
          className="wish-box-home-announcement absolute"
          style={{
            left: "5.5729167%",
            top: "54.6296296%",
            width: "29.5833333%",
            height: "26.9444444%",
          }}
        >
          <div
            aria-hidden="true"
            className="wish-box-home-announcement-preview pointer-events-none absolute left-0 top-0 aspect-video"
            style={{
              width: "113.52657%",
              transform: "perspective(90cqw) rotateY(15deg) scaleY(0.80227748)",
              transformOrigin: "top left",
            }}
          >
            {announcement ? <AnnouncementBoard data={announcement} /> : null}
          </div>
          <button
            ref={announcementButtonRef}
            type="button"
            onClick={onOpenAnnouncement}
            aria-label={announcement
              ? `查看${announcement.title}详情`
              : announcementStatus === "loading"
                ? "公告加载中，打开查看状态"
                : "公告加载失败，打开重试"}
            className="absolute inset-0 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4c392b]"
          />
        </div>
      </div>
    </div>
  );
}

export default WishBoxHome;
