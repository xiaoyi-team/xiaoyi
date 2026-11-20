import { useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import DesktopMapArtwork from "./DesktopMapArtwork";
import MobileMapArtwork from "./MobileMapArtwork";

const entries = [
  { name: "心愿盒", to: "/wish-box", x: 419, y: 181, width: 746, height: 577 },
  { name: "糖果屋", to: "/candy", x: 1027, y: 159, width: 431, height: 311 },
  { name: "杂草酒吧", to: "/bar", x: 204, y: 199, width: 287, height: 268 },
  { name: "萧逸家", to: "/xiaoyi", x: 86, y: 451, width: 295, height: 243 },
  { name: "加油站", to: "/pit-signal", x: 1127, y: 540, width: 324, height: 250 },
  { name: "海事高中", to: "/school-vote", x: 1356, y: 291, width: 547, height: 249 },
] as const;

export default function HomeMap({ mobile }: { mobile: boolean }) {
  const [active, setActive] = useState<string | null>(null);

  function activate(event: MouseEvent<HTMLAnchorElement>, name: string) {
    if (mobile && active !== name && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      setActive(name);
    }
  }

  return (
    <nav className="home-map" aria-label="首页主题入口" data-active={active ?? undefined}
      onPointerLeave={event => { if (event.pointerType === "mouse") setActive(null); }}>
      <div className="home-map__artwork" aria-hidden="true">
        {mobile ? <MobileMapArtwork /> : <DesktopMapArtwork />}
      </div>
      <button className="home-map__clear" type="button" tabIndex={-1}
        aria-label="恢复首页地图" onClick={() => setActive(null)} />
      {entries.map(entry => (
        <Link key={entry.name} to={entry.to} className="home-map__entry" aria-label={`进入${entry.name}`}
          style={{ left: `${entry.x / 1920 * 100}%`, top: `${entry.y / 1080 * 100}%`,
            width: `${entry.width / 1920 * 100}%`, height: `${entry.height / 1080 * 100}%` }}
          onPointerEnter={event => { if (event.pointerType === "mouse") setActive(entry.name); }}
          onPointerLeave={event => { if (event.pointerType === "mouse") setActive(null); }}
          onFocus={event => { if (event.currentTarget.matches(":focus-visible")) setActive(entry.name); }}
          onBlur={() => setActive(null)} onClick={event => activate(event, entry.name)} />
      ))}
    </nav>
  );
}
