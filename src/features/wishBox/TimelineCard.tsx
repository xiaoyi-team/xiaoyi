import { useState } from "react";
import type { CSSProperties } from "react";
import irisCardFrame from "../../assets/wish-box/timeline-card-frame-iris.png";
import roseCardFrame from "../../assets/wish-box/timeline-card-frame-rose.png";
import type { ActivityReviewSelection } from "./WishBoxActivityReview";
import { CARD_WIDTH, type TimelineCardVariant } from "./timelinePresentation";

type TimelineCardLayout = {
  photo: { x: number; y: number; width: number; height: number };
  frame: {
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

const CARD_HOVER_WIDTH = 358;
const CARD_VISUAL_HEIGHT = 225;

const TIMELINE_CARD_LAYOUTS: Record<TimelineCardVariant, TimelineCardLayout> = {
  rose: {
    photo: { x: 14, y: 14, width: 322, height: 151 },
    frame: {
      src: roseCardFrame,
      x: 0,
      y: 0,
      width: 350,
      height: 225,
    },
  },
  iris: {
    photo: { x: 14, y: 14, width: 322, height: 151 },
    frame: {
      src: irisCardFrame,
      x: -11.06543,
      y: -14.510489,
      width: 372.131744,
      height: 261.874115,
    },
  },
};

const toSceneCqw = (designPixels: number) =>
  `${(designPixels / 19.2).toFixed(7)}cqw`;

function TimelineCard({
  activity,
  coverThumbnailUrl,
  coverPosX,
  coverPosY,
  variant,
  cardY,
  slotIndex,
  slotLeft,
  onOpenActivity,
}: {
  activity: ActivityReviewSelection;
  coverThumbnailUrl: string | null;
  coverPosX: number;
  coverPosY: number;
  variant: TimelineCardVariant;
  cardY: number;
  slotIndex: number;
  slotLeft: string;
  onOpenActivity: (activity: ActivityReviewSelection) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const layout = TIMELINE_CARD_LAYOUTS[variant];
  return (
    <div
      data-timeline-card={variant}
      data-timeline-slot-index={slotIndex}
      data-timeline-card-hovered={isHovered || undefined}
      className="pointer-events-none absolute"
      style={{
        "--timeline-card-pc-left": slotLeft,
        "--timeline-card-pc-top": toSceneCqw(cardY),
      } as CSSProperties}
    >
      <div
        aria-hidden="true"
        data-timeline-card-shadow-source
        className="pointer-events-none absolute left-0 top-0"
        style={{
          left: toSceneCqw(7),
          top: toSceneCqw(8.5),
          width: toSceneCqw(336),
          height: toSceneCqw(207.5),
          borderRadius: toSceneCqw(8),
          backgroundColor: "transparent",
          boxShadow: isHovered
            ? `0 ${toSceneCqw(5)} ${toSceneCqw(22)} ${toSceneCqw(2)} rgba(166, 133, 191, 0.5)`
            : `0 ${toSceneCqw(5)} ${toSceneCqw(22)} ${toSceneCqw(2)} rgba(194, 176, 138, 0.2)`,
        }}
      />
      <div
        aria-hidden="true"
        data-timeline-card-visual
        className="pointer-events-none absolute left-0 top-0"
        style={{
          width: toSceneCqw(CARD_WIDTH),
          height: toSceneCqw(CARD_VISUAL_HEIGHT),
          borderRadius: toSceneCqw(8),
          transform: `scale(${isHovered ? CARD_HOVER_WIDTH / CARD_WIDTH : 1})`,
          transformOrigin: "left center",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute"
          style={{
            left: toSceneCqw(layout.photo.x),
            top: toSceneCqw(layout.photo.y),
            width: toSceneCqw(layout.photo.width),
            height: toSceneCqw(layout.photo.height),
            backgroundColor: "#E6E1D7",
          }}
        >
          {coverThumbnailUrl ? (
            <img
              key={coverThumbnailUrl}
              src={coverThumbnailUrl}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="pointer-events-none h-full w-full select-none object-cover"
              style={{ objectPosition: `${coverPosX}% ${coverPosY}%` }}
              onError={(event) => { event.currentTarget.style.visibility = "hidden"; }}
            />
          ) : null}
        </div>
        <img
          src={layout.frame.src}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute select-none"
          style={{
            left: toSceneCqw(layout.frame.x),
            top: toSceneCqw(layout.frame.y),
            width: toSceneCqw(layout.frame.width),
            height: toSceneCqw(layout.frame.height),
            maxWidth: "none",
          }}
        />
        <div
          data-timeline-card-title
          className="absolute truncate text-center"
        >
          {activity.title}
        </div>
        <div
          data-timeline-card-date
          className="absolute flex items-center justify-center text-center"
        >
          {activity.date}
        </div>
      </div>
      <button
        type="button"
        data-timeline-record-id={activity.recordId}
        aria-label={`查看活动回顾：${activity.title}（${activity.date}）`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onOpenActivity({
          recordId: activity.recordId,
          title: activity.title,
          date: activity.date,
        })}
        className="pointer-events-auto absolute inset-0 cursor-pointer border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#4c392b]"
        style={{ borderRadius: "inherit" }}
      />
    </div>
  );
}

export default TimelineCard;
