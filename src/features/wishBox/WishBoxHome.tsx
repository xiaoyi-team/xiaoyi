import type { Ref } from "react";
import { Link } from "react-router";
import backDoubleChevron from "../../assets/wish-box/back-double-chevron.svg";
import gardenBackground from "../../assets/wish-box/wish-box-home-background.png";
import wishlandSign from "../../assets/wish-box/wishland-sign.png";

type WishBoxHomeProps = {
  title: string;
  summary: string;
  onOpenAnnouncement: () => void;
  announcementButtonRef: Ref<HTMLButtonElement>;
  inactive: boolean;
};

function WishBoxHome({
  title,
  summary,
  onOpenAnnouncement,
  announcementButtonRef,
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
          top: "37.59259%",
          width: "12.86458%",
          height: "10%",
        }}
      >
        <img
          src={wishlandSign}
          alt="心愿盒 Wishland"
          className="h-full w-full object-contain"
        />
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

      <button
        ref={announcementButtonRef}
        type="button"
        onClick={onOpenAnnouncement}
        aria-label={`查看${title}详情`}
        className="absolute flex flex-col items-center justify-center overflow-hidden text-center text-[#352c22] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4c392b]"
        style={{
          // Implementation calibration value measured from the supplied background image,
          // not a Figma node bound. Preview and hotspot intentionally share this region.
          left: "4.6875%",
          top: "51.85185%",
          width: "31.25%",
          height: "32.40741%",
          padding: "4.2cqw 1cqw 2.2cqw",
        }}
      >
        <span
          className="block w-full truncate font-serif font-semibold"
          style={{ fontSize: "1.45cqw", lineHeight: 1.15 }}
        >
          {title}
        </span>
        <span
          className="mt-[0.55cqw] block w-full line-clamp-2"
          style={{ fontSize: "1.05cqw", lineHeight: 1.35 }}
        >
          {summary}
        </span>
      </button>
    </div>
  );
}

export default WishBoxHome;
