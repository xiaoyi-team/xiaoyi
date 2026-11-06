import { Link } from "react-router";

import candyHouseTitle from "../../../assets/home/candy-house-home-title.png";
import pitStopTitle from "../../../assets/home/pit-stop-home-title.png";
import weedsBarTitle from "../../../assets/home/weeds-bar-home-title.png";
import wishBoxTitle from "../../../assets/home/wish-box-home-title.png";
import xiaoyiTitle from "../../../assets/home/xiaoyi-home-title.png";
import xiaoyiLoveTitle from "../../../assets/home/xiaoyi-love-home-title.png";

const homeEntries = [
  {
    id: "xiao-yi",
    title: "萧逸家",
    image: xiaoyiTitle,
    to: "/xiao-yi",
    ariaLabel: "进入萧逸家",
  },
  {
    id: "wish-box",
    title: "心愿盒",
    image: wishBoxTitle,
    to: "/wish-box",
    ariaLabel: "进入心愿盒",
  },
  {
    id: "Osborn-acheive",
    title: "糖果屋",
    image: candyHouseTitle,
    to: "/Osborn-acheive",
    ariaLabel: "进入糖果屋",
  },
  {
    id: "GasStationList",
    title: "加油站",
    image: pitStopTitle,
    to: "/GasStationList",
    ariaLabel: "进入加油站",
  },
  {
    id: "bar",
    title: "杂草酒吧",
    image: weedsBarTitle,
    to: "/bar",
    ariaLabel: "进入杂草酒吧",
  },
  {
    id: "vote",
    title: "萧与逸之恋",
    image: xiaoyiLoveTitle,
    to: "/vote",
    ariaLabel: "进入萧与逸之恋",
  },
] as const;

function HomeMap() {
  return (
    <nav
      aria-label="首页主题入口"
      className="grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-6"
    >
      {homeEntries.map((entry) => (
        <Link
          key={entry.id}
          to={entry.to}
          aria-label={entry.ariaLabel}
          title={entry.title}
          className="block w-full max-w-[821px] justify-self-center rounded-sm outline-none transition-opacity duration-200 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-white motion-reduce:transition-none"
        >
          <img
            src={entry.image}
            alt=""
            aria-hidden="true"
            className="pointer-events-none block h-auto w-full select-none"
            draggable={false}
            width={821}
            height={234}
          />
        </Link>
      ))}
    </nav>
  );
}

export default HomeMap;
