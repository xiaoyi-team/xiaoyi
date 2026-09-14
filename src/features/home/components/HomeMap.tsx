import { Link } from "react-router";

import homeBackground from "../../../assets/home/home-background.png";
import homeLabelBar from "../../../assets/home/home-label-bar.png";
import homeLabelCandyHouse from "../../../assets/home/home-label-candy-house.png";
import homeLabelVote from "../../../assets/home/home-label-vote.png";
import homeLabelWishBox from "../../../assets/home/home-label-wish-box.png";
import homeLabelXiaoyi from "../../../assets/home/home-label-xiaoyi.png";
import homeOverlayBar from "../../../assets/home/home-overlay-bar.png";
import homeOverlayCandyHouse from "../../../assets/home/home-overlay-candy-house.png";
import homeOverlayVote from "../../../assets/home/home-overlay-vote.png";
import homeOverlayWishBox from "../../../assets/home/home-overlay-wish-box.png";
import homeOverlayXiaoyi from "../../../assets/home/home-overlay-xiaoyi.png";

const homeEntries = [
  {
    label: "萧逸家",
    to: "/xiaoyi",
    overlay: homeOverlayXiaoyi,
    sign: homeLabelXiaoyi,
    hotspot: {
      left: "21.82%",
      top: "38.43%",
      width: "11.15%",
      height: "16.48%",
      zIndex: 13,
    },
    hover: {
      left: "21.27%",
      top: "37.6%",
      width: "12.26%",
      height: "18.13%",
    },
    signPosition: {
      left: "12.4%",
      top: "45%",
      width: "12.86%",
      height: "10%",
    },
  },
  {
    label: "心愿盒",
    to: "/wish-box",
    overlay: homeOverlayWishBox,
    sign: homeLabelWishBox,
    hotspot: {
      left: "25.16%",
      top: "30.65%",
      width: "19.11%",
      height: "22.69%",
      zIndex: 10,
    },
    hover: {
      left: "24.43%",
      top: "29.07%",
      width: "21.03%",
      height: "24.95%",
    },
    signPosition: {
      left: "24.43%",
      top: "28.43%",
      width: "12.86%",
      height: "10%",
    },
  },
  {
    label: "报告老师我要玩萧与逸之恋",
    to: "/vote",
    overlay: homeOverlayVote,
    sign: homeLabelVote,
    hotspot: {
      left: "36.93%",
      top: "21.02%",
      width: "29.32%",
      height: "34.72%",
      zIndex: 12,
    },
    hover: {
      left: "33.96%",
      top: "16.11%",
      width: "35.48%",
      height: "42.01%",
    },
    signPosition: {
      left: "54.53%",
      top: "20.65%",
      width: "14.32%",
      height: "10%",
    },
  },
  {
    label: "杂草酒吧",
    to: "/bar",
    overlay: homeOverlayBar,
    sign: homeLabelBar,
    hotspot: {
      left: "54.53%",
      top: "42.41%",
      width: "16.56%",
      height: "19.63%",
      zIndex: 14,
    },
    hover: {
      left: "53.23%",
      top: "38.15%",
      width: "20.04%",
      height: "23.75%",
    },
    signPosition: {
      left: "64.32%",
      top: "59.26%",
      width: "14.32%",
      height: "10%",
    },
  },
  {
    label: "糖果屋",
    to: "/candy-house",
    overlay: homeOverlayCandyHouse,
    sign: homeLabelCandyHouse,
    hotspot: {
      left: "71.51%",
      top: "41.11%",
      width: "9.69%",
      height: "17.22%",
      zIndex: 11,
    },
    hover: {
      left: "70.36%",
      top: "39.26%",
      width: "11.72%",
      height: "20.84%",
    },
    signPosition: {
      left: "76.72%",
      top: "37.04%",
      width: "12.86%",
      height: "10%",
    },
  },
] as const;

function HomeMap() {
  return (
    <section
      aria-label="首页地图"
      className="relative aspect-video max-w-[1920px] overflow-hidden"
      style={{ width: "min(100vw, calc(100vh * 16 / 9))" }}
    >
      <img
        src={homeBackground}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
        draggable={false}
      />

      {homeEntries.map((entry) => (
        <div
          key={entry.to}
          className="group pointer-events-none absolute inset-0"
        >
          <img
            src={entry.overlay}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute select-none object-contain opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
            draggable={false}
            style={entry.hover}
          />
          <img
            src={entry.sign}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute select-none object-contain opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
            draggable={false}
            style={entry.signPosition}
          />
          <Link
            to={entry.to}
            aria-label={entry.label}
            className="pointer-events-auto absolute cursor-pointer rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            style={entry.hotspot}
          >
            <span className="sr-only">{entry.label}</span>
          </Link>
        </div>
      ))}
    </section>
  );
}

export default HomeMap;
