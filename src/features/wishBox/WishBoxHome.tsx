import type { Ref } from "react";
import { Link } from "react-router";
import AnnouncementBoard, {
  type AnnouncementDisplayFixture,
} from "./AnnouncementBoard";
import backDoubleChevron from "../../assets/wish-box/back-double-chevron.svg";
import gardenBackground from "../../assets/wish-box/wish-box-home-background.png";
import wishlandSign from "../../assets/wish-box/wishland-sign.png";

type WishBoxHomeProps = {
  announcement: AnnouncementDisplayFixture;
  onOpenAnnouncement: () => void;
  announcementButtonRef: Ref<HTMLButtonElement>;
  onOpenTimeline: () => void;
  wishlandButtonRef: Ref<HTMLButtonElement>;
  inactive: boolean;
};

function WishBoxHome({
  announcement,
  onOpenAnnouncement,
  announcementButtonRef,
  onOpenTimeline,
  wishlandButtonRef,
  inactive,
}: WishBoxHomeProps) {
  return (
    <div
      className="absolute inset-0"
      style={{ opacity: inactive ? 0.41 : 1 }}
      inert={inactive}
      aria-hidden={inactive}
    >
      <img
        src={gardenBackground}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-contain"
      />

      <h1
        className="absolute"
        style={{
          left: "55.15625%",
          top: "35.74074%",
          width: "15.67708%",
          height: "13.33333%",
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
            className="h-full w-full object-contain"
          />
        </button>
      </h1>

      {!inactive ? (
        <Link
          to="/home"
          aria-label="返回首页"
          className="absolute focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          style={{
            left: "3.95833%",
            top: "2.31481%",
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
        </Link>
      ) : null}

      <div
        className="absolute"
        style={{
          left: "5.5729167%",
          top: "54.6296296%",
          width: "29.5833333%",
          height: "26.9444444%",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 aspect-video"
          style={{
            width: "113.52657%",
            transform: "perspective(90cqw) rotateY(15deg) scaleY(0.80227748)",
            transformOrigin: "top left",
          }}
        >
          <AnnouncementBoard announcement={announcement} />
        </div>
        <button
          ref={announcementButtonRef}
          type="button"
          onClick={onOpenAnnouncement}
          aria-label={`查看${announcement.title}详情`}
          className="absolute inset-0 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4c392b]"
        />
      </div>
    </div>
  );
}

export default WishBoxHome;
