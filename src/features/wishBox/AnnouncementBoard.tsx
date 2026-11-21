import { useRef, type CSSProperties, type ReactNode } from "react";
import NoticeScrollbar from "./NoticeScrollbar";
import locationIcon from "../../assets/wish-box/announcement-location.svg";
import calendarIcon from "../../assets/wish-box/announcement-calendar.svg";
import titleStar from "../../assets/wish-box/announcement-title-star.svg";
import headerDecoration from "../../assets/wish-box/announcement-title-decoration.svg";
import decoration from "../../assets/wish-box/announcement-board-frame.png";
import type { AnnouncementViewData } from "./announcementSample";

type AnnouncementBoardProps = {
  data: AnnouncementViewData | null;
  interactive?: boolean;
  statusContent?: ReactNode;
};

function noticeFontSizeStyle(value: string | null | undefined): CSSProperties & { "--notice-cms-font-size"?: number } {
  if (value == null) return {};
  const match = /^\s*(\d+(?:\.\d+)?|\.\d+)px\s*$/i.exec(value);
  if (match) {
    const size = Number(match[1]);
    if (Number.isFinite(size)) return { "--notice-cms-font-size": size };
  }
  // Unsupported values use the same responsive default as null.
  return {};
}

function AnnouncementBoard({ data, interactive = false, statusContent }: AnnouncementBoardProps) {
  const content = data;
  const scrollRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<HTMLDivElement>(null);
  const layoutStyle: CSSProperties & Record<`--${string}`, string> = content?.layoutConfig
    ? {
        "--notice-layout-left-divisor": String(
          (content.layoutConfig.leftRatio + content.layoutConfig.rightRatio) / content.layoutConfig.leftRatio,
        ),
        "--notice-layout-right-divisor": String(
          (content.layoutConfig.leftRatio + content.layoutConfig.rightRatio) / content.layoutConfig.rightRatio,
        ),
      }
    : {};
  return <div
    className="notice-board"
    data-layout-config={content?.layoutConfig ? "configured" : undefined}
    style={layoutStyle}
  >
    <img className="notice-decoration" src={decoration} alt="" aria-hidden="true" />
    <div className="notice-border notice-border-outer" aria-hidden="true" />
    <div className="notice-border notice-border-inner" aria-hidden="true" />
    <header className="notice-header">
      {interactive && <img className="notice-header-ornament" src={headerDecoration} alt="" aria-hidden="true" />}
      <h1>活动公告</h1>
      <p>Event Notice</p>
    </header>
    {!content || content.location?.trim() ? <section className="notice-info notice-location"><h2>{interactive ? <><img src={locationIcon} alt="" aria-hidden="true" /><span>活动坐标</span></> : "活动坐标"}</h2><div tabIndex={interactive && content ? 0 : -1}>{content?.location}</div></section> : null}
    <section className="notice-info notice-time"><h2>{interactive ? <><img src={calendarIcon} alt="" aria-hidden="true" /><span>活动时间</span></> : "活动时间"}</h2><div tabIndex={interactive && content ? 0 : -1}>{interactive
      ? content?.time.split(/(\s+)/).map((part, index) => /^\s+$/.test(part)
        ? part : <span className="notice-time-token" key={index}>{part}</span>)
      : content?.time}</div></section>
    <div ref={scrollRef} className="notice-scroll" role="region" aria-label="公告正文" tabIndex={interactive ? 0 : -1}>
      <div ref={blocksRef} className="notice-blocks" role={statusContent ? "alert" : undefined}
        style={statusContent ? { alignItems: "center", gap: "0.75rem", textAlign: "center" } : undefined}
      >{statusContent ?? content?.blocks.map(block => <section key={block.id} className="notice-block" data-variant={block.variant}>
        <h2>{interactive ? <span className="notice-block-title"><img src={titleStar} alt="" aria-hidden="true" /><span className="notice-title-spaces" aria-hidden="true">{"  "}</span>{block.title}</span> : block.title}</h2><p style={{
          ...noticeFontSizeStyle(block.fontSize),
          ...(block.fontColor === null ? {} : { color: block.fontColor }),
          ...(block.fontWeight === null ? {} : { fontWeight: block.fontWeight }),
        }}>{block.content}</p>
      </section>)}</div>
    </div>
    <NoticeScrollbar scrollRef={scrollRef} contentRef={blocksRef} interactive={interactive} />
  </div>;
}
export default AnnouncementBoard;
