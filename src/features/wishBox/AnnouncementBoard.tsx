import { useRef } from "react";
import NoticeScrollbar from "./NoticeScrollbar";
import locationIcon from "../../assets/wish-box/announcement-location.svg";
import calendarIcon from "../../assets/wish-box/announcement-calendar.svg";
import titleStar from "../../assets/wish-box/announcement-title-star.svg";
import headerDecoration from "../../assets/wish-box/announcement-title-decoration.svg";
import decoration from "../../assets/wish-box/announcement-board-frame.png";
import { announcementSample, type AnnouncementViewData } from "./announcementSample";
export type AnnouncementDisplayFixture = {
  title: string;
  subtitle: string;
  eyebrow: string;
  summary: string;
  gifts: ReadonlyArray<string>;
  giftCaption: string;
  location: string;
  time: string;
  requirements: string;
  requirementsExtra: string;
  notes: string;
  footerDescription: string;
  footerTags: ReadonlyArray<string>;
  footerEnglishCaption: string;
};

function AnnouncementBoard({ data = announcementSample, interactive = false }: { announcement: AnnouncementDisplayFixture; data?: AnnouncementViewData; interactive?: boolean }) {
  const content = data;
  const scrollRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<HTMLDivElement>(null);
  return <div className="notice-board">
    <img className="notice-decoration" src={decoration} alt="" aria-hidden="true" />
    <div className="notice-border notice-border-outer" aria-hidden="true" />
    <div className="notice-border notice-border-inner" aria-hidden="true" />
    <header className="notice-header">
      {interactive && <img className="notice-header-ornament" src={headerDecoration} alt="" aria-hidden="true" />}
      <h1>{content.title}</h1>
      <p>Event Notice</p>
    </header>
    <section className="notice-info notice-location"><h2>{interactive ? <><img src={locationIcon} alt="" aria-hidden="true" /><span>活动地点</span></> : "活动地点"}</h2><div tabIndex={interactive ? 0 : -1}>{content.location}</div></section>
    <section className="notice-info notice-time"><h2>{interactive ? <><img src={calendarIcon} alt="" aria-hidden="true" /><span>活动时间</span></> : "活动时间"}</h2><div tabIndex={interactive ? 0 : -1}>{interactive
      ? content.time.split(/(\s+)/).map((part, index) => /^\s+$/.test(part)
        ? part : <span className="notice-time-token" key={index}>{part}</span>)
      : content.time}</div></section>
    <div ref={scrollRef} className="notice-scroll" role="region" aria-label="公告正文" tabIndex={interactive ? 0 : -1}>
      <div ref={blocksRef} className="notice-blocks">{content.blocks.map(block => <section key={block.id} className="notice-block" data-variant={block.variant}>
        <h2>{interactive ? <span className="notice-block-title"><img src={titleStar} alt="" aria-hidden="true" /><span className="notice-title-spaces" aria-hidden="true">{"  "}</span>{block.title}</span> : block.title}</h2><p>{block.content}</p>
      </section>)}</div>
    </div>
    <NoticeScrollbar scrollRef={scrollRef} contentRef={blocksRef} interactive={interactive} />
  </div>;
}
export default AnnouncementBoard;
