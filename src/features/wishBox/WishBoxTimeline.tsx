import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import backDoubleChevron from "../../assets/wish-box/back-double-chevron.svg";
import edgeDecoration from "../../assets/wish-box/timeline-edge-decoration.png";
import gardenBackground from "../../assets/wish-box/timeline-garden-background.png";
import titleOrnamentLeft from "../../assets/wish-box/timeline-title-ornament-left.png";
import titleOrnamentRight from "../../assets/wish-box/timeline-title-ornament-right.png";
import vineTile from "../../assets/wish-box/timeline-vine-tile.png";
import type { ActivityReviewSelectionFixture } from "./WishBoxActivityReview";
import TimelineCard from "./TimelineCard";
import {
  deriveTimelinePresentation,
  getTimelineSlotX,
  MONTH_LABEL_HEIGHT,
  type TimelineActivityFixture,
  type TimelineGlowMarkerPresentation,
  type TimelineMonthLabelPresentation,
} from "./timelinePresentation";

const DRAG_THRESHOLD_PX = 5;
const PATH_HEIGHT = 670;
const VINE_Y = 198;
const VINE_HEIGHT = 288;

const TIMELINE_KIND_OPTIONS = [
  "全部种类",
  "节日",
  "联动",
  "纪念",
  "特别企划",
  "生日",
  "其他",
] as const;

type TimelineYearOption = "全部" | "2026" | "2025" | "2024";
type TimelineKindOption = (typeof TIMELINE_KIND_OPTIONS)[number];
type TimelineFormOption = "全部" | "线上" | "线下" | "周边制品";

export type TimelineFilters = {
  year: TimelineYearOption;
  kind: TimelineKindOption;
  form: TimelineFormOption;
};

type TimelinePointerDrag = {
  pointerId: number;
  startClientX: number;
  startScrollLeft: number;
  isDragging: boolean;
};

type SuppressedTimelineClick = {
  pointerId: number;
};

// Stable UI-only fixture IDs, not backend IDs or a business item limit.
const TIMELINE_ACTIVITY_FIXTURE: readonly TimelineActivityFixture[] = [
  {
    fixtureId: "timeline-snow-letter",
    title: "雪落时的来信",
    startDate: { year: 2024, month: 12, day: 20 },
    endDate: { year: 2025, month: 1, day: 5 },
  },
  {
    fixtureId: "timeline-birthday-promise",
    title: "生日里的约定",
    startDate: { year: 2025, month: 11, day: 23 },
    endDate: { year: 2025, month: 12, day: 7 },
  },
  {
    fixtureId: "timeline-winter-together",
    title: "冬日共赴",
    startDate: { year: 2025, month: 12, day: 12 },
    endDate: { year: 2026, month: 1, day: 2 },
  },
  {
    fixtureId: "timeline-new-year",
    title: "新岁与你",
    startDate: { year: 2026, month: 1, day: 1 },
    endDate: { year: 2026, month: 1, day: 18 },
  },
  {
    fixtureId: "timeline-heart-letter",
    title: "心动来信",
    startDate: { year: 2026, month: 2, day: 14 },
    endDate: { year: 2026, month: 3, day: 1 },
  },
  {
    fixtureId: "timeline-spring-walk",
    title: "春日漫游",
    startDate: { year: 2026, month: 3, day: 18 },
    endDate: { year: 2026, month: 4, day: 8 },
  },
  {
    fixtureId: "timeline-floral-prelude",
    title: "花间序曲",
    startDate: { year: 2026, month: 4, day: 20 },
    endDate: { year: 2026, month: 5, day: 10 },
  },
  {
    fixtureId: "timeline-fifth-season",
    title: "与你的第五季",
    startDate: { year: 2026, month: 5, day: 20 },
    endDate: { year: 2026, month: 6, day: 15 },
  },
  {
    fixtureId: "timeline-summer-breeze",
    title: "夏日的风",
    startDate: { year: 2026, month: 6, day: 21 },
    endDate: { year: 2026, month: 7, day: 12 },
  },
  {
    fixtureId: "timeline-starlight-photo",
    title: "星光留影",
    startDate: { year: 2026, month: 7, day: 18 },
    endDate: { year: 2026, month: 8, day: 8 },
  },
  {
    fixtureId: "timeline-qixi-letter",
    title: "七夕花笺",
    startDate: { year: 2026, month: 8, day: 19 },
    endDate: { year: 2026, month: 9, day: 2 },
  },
  {
    fixtureId: "timeline-iris-bloom",
    title: "鸢尾盛放之时",
    startDate: { year: 2026, month: 9, day: 1 },
    endDate: { year: 2026, month: 9, day: 28 },
  },
];

const TIMELINE_PRESENTATION = deriveTimelinePresentation(TIMELINE_ACTIVITY_FIXTURE);

const toSceneCqw = (designPixels: number) =>
  `${(designPixels / 19.2).toFixed(7)}cqw`;

function TimelineMarker({ marker }: { marker: TimelineMonthLabelPresentation }) {
  return (
    <div
      aria-hidden="true"
      data-timeline-marker={marker.text}
      className="pointer-events-none absolute flex items-center justify-center"
      style={{
        left: toSceneCqw(getTimelineSlotX(marker.slotIndex)),
        top: toSceneCqw(marker.y),
        width: toSceneCqw(122),
        height: toSceneCqw(MONTH_LABEL_HEIGHT),
        boxSizing: "border-box",
        padding: `${toSceneCqw(6)} ${toSceneCqw(30)}`,
        border: `${toSceneCqw(1)} solid #F3DDB0`,
        borderRadius: toSceneCqw(16),
        backgroundColor: "rgba(128, 106, 77, 0.88)",
        color: "#FFF4D5",
        fontFamily: '"Noto Serif SC", serif',
        fontSize: toSceneCqw(16),
        fontWeight: 500,
        lineHeight: toSceneCqw(24),
        letterSpacing: 0,
        textAlign: "left",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          display: "block",
          width: toSceneCqw(60),
          height: toSceneCqw(24),
          lineHeight: toSceneCqw(24),
        }}
      >
        {marker.text}
      </span>
    </div>
  );
}

function TimelineGlowMarker({ marker }: { marker: TimelineGlowMarkerPresentation }) {
  const filterId = `timeline-gold-glow-filter-${marker.slotIndex}`;
  const clipId = `timeline-gold-glow-clip-${marker.slotIndex}`;
  const lineStartY = marker.lineDirection === "up" ? 39 : 104;
  const lineEndY = marker.lineDirection === "up" ? 3 : 68;

  return (
    <div
      aria-hidden="true"
      data-timeline-gold-glow={marker.slotIndex}
      className="pointer-events-none absolute"
      style={{
        left: toSceneCqw(getTimelineSlotX(marker.slotIndex) + 159),
        top: toSceneCqw(276),
        width: toSceneCqw(32),
        height: toSceneCqw(96),
        overflow: "visible",
      }}
    >
      <svg
        aria-hidden="true"
        width="100%"
        height="100%"
        viewBox="0 0 32 96"
        style={{ overflow: "visible" }}
      >
        <defs>
          <filter
            id={filterId}
            x="-13"
            y="-13"
            width="58"
            height="122"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feMorphology
              radius="1"
              operator="dilate"
              in="SourceAlpha"
              result="effect1_dropShadow"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="6" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1 0 0 0 0 0.88 0 0 0 0 0.55 0 0 0 0.8 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow"
              result="shape"
            />
          </filter>
          <clipPath id={clipId}>
            <rect width="32" height="96" />
          </clipPath>
        </defs>
        <g filter={`url(#${filterId})`}>
          <g clipPath={`url(#${clipId})`}>
            <line
              x1="15.5"
              y1={lineStartY}
              x2="15.5"
              y2={lineEndY}
              stroke="#FEF3C4"
              strokeWidth="3"
            />
            <path
              d="M16 68C23.732 68 30 61.732 30 54C30 46.268 23.732 40 16 40C8.268 40 2 46.268 2 54C2 61.732 8.268 68 16 68Z"
              fill="#F3D590"
              fillOpacity="0.18"
              stroke="#F7D994"
            />
            <path
              d="M16 65C22.0751 65 27 60.0751 27 54C27 47.9249 22.0751 43 16 43C9.9249 43 5 47.9249 5 54C5 60.0751 9.9249 65 16 65Z"
              fill="none"
              stroke="#FFF8D8"
              strokeWidth="2"
            />
            <path
              d="M16 57C17.6569 57 19 55.6569 19 54C19 52.3431 17.6569 51 16 51C14.3431 51 13 52.3431 13 54C13 55.6569 14.3431 57 16 57Z"
              fill="#FFF8D8"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

function TimelineFilterPill({
  label,
  ariaLabel,
  left,
  selected,
  onClick,
}: {
  label: string;
  ariaLabel?: string;
  left: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={selected}
      className="absolute flex cursor-pointer items-center justify-center whitespace-nowrap p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#614B35]"
      style={{
        left: toSceneCqw(left),
        top: toSceneCqw(15),
        width: toSceneCqw(102),
        height: toSceneCqw(44),
        boxSizing: "border-box",
        border: `${toSceneCqw(1)} solid rgba(181, 165, 139, 0.65)`,
        borderRadius: toSceneCqw(24),
        backgroundColor: selected ? "#927A54" : "#F3EDE1",
        color: selected ? "#FFF9E9" : "#614B35",
        fontFamily: '"Noto Serif SC", serif',
        fontSize: toSceneCqw(16),
        fontWeight: 500,
        lineHeight: toSceneCqw(24),
        letterSpacing: 0,
        textAlign: "left",
      }}
    >
      {label}
    </button>
  );
}

type WishBoxTimelineProps = {
  onBack: () => void;
  initialScrollLeft: number | null;
  filters: TimelineFilters;
  onFiltersChange: (updates: Partial<TimelineFilters>) => void;
  onOpenActivity: (
    activity: ActivityReviewSelectionFixture,
    timelineScrollLeft: number,
  ) => void;
};

function WishBoxTimeline({
  onBack,
  initialScrollLeft,
  filters,
  onFiltersChange,
  onOpenActivity,
}: WishBoxTimelineProps) {
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const kindButtonRef = useRef<HTMLButtonElement>(null);
  const timelineViewportRef = useRef<HTMLDivElement>(null);
  const timelinePointerDragRef = useRef<TimelinePointerDrag | null>(null);
  const suppressedTimelineClickRef = useRef<SuppressedTimelineClick | null>(null);
  const { year: selectedYear, kind: selectedKind, form: selectedForm } = filters;
  const [kindMenuOpen, setKindMenuOpen] = useState(false);

  const closeKindMenu = () => {
    setKindMenuOpen(false);
    kindButtonRef.current?.focus({ preventScroll: true });
  };

  const clearSuppressedTimelineClick = () => {
    suppressedTimelineClickRef.current = null;
  };

  const setTimelineDraggingCursor = (viewport: HTMLDivElement, isDragging: boolean) => {
    viewport.style.cursor = isDragging ? "grabbing" : "";
    viewport
      .querySelectorAll<HTMLButtonElement>("button[data-timeline-activity-fixture]")
      .forEach((button) => {
        button.style.cursor = isDragging ? "grabbing" : "";
      });
  };

  const finishTimelinePointer = (
    viewport: HTMLDivElement,
    pointerId: number,
    suppressClick: boolean,
  ) => {
    const drag = timelinePointerDragRef.current;
    if (!drag || drag.pointerId !== pointerId) return;

    timelinePointerDragRef.current = null;
    setTimelineDraggingCursor(viewport, false);

    if (suppressClick && drag.isDragging) {
      suppressedTimelineClickRef.current = { pointerId };
    }

    try {
      if (viewport.hasPointerCapture(pointerId)) {
        viewport.releasePointerCapture(pointerId);
      }
    } catch {
      // The browser may already have released capture during cancellation.
    }
  };

  const updateTimelinePointerDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;

    const drag = timelinePointerDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startClientX;
    if (!drag.isDragging) {
      if (Math.abs(deltaX) < DRAG_THRESHOLD_PX) return;

      drag.isDragging = true;
      setTimelineDraggingCursor(event.currentTarget, true);

      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Continue tracking while events still reach the viewport.
      }
    }

    if (event.cancelable) event.preventDefault();
    event.currentTarget.scrollLeft = drag.startScrollLeft - deltaX;
  };

  const handleTimelinePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    // A new pointer sequence means any previous drag-generated click is stale.
    clearSuppressedTimelineClick();

    if (
      event.pointerType !== "mouse" ||
      event.button !== 0 ||
      !event.isPrimary ||
      timelinePointerDragRef.current
    ) {
      return;
    }

    timelinePointerDragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startScrollLeft: event.currentTarget.scrollLeft,
      isDragging: false,
    };
  };

  const handleTimelinePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    updateTimelinePointerDrag(event);
  };

  const handleTimelinePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = timelinePointerDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || event.pointerType !== "mouse") return;

    if (!drag.isDragging) updateTimelinePointerDrag(event);

    const currentDrag = timelinePointerDragRef.current;
    if (!currentDrag || currentDrag.pointerId !== event.pointerId) return;

    if (!currentDrag.isDragging) {
      finishTimelinePointer(event.currentTarget, event.pointerId, false);
      return;
    }

    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      finishTimelinePointer(event.currentTarget, event.pointerId, true);
    }
  };

  const handleTimelinePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    finishTimelinePointer(event.currentTarget, event.pointerId, true);
  };

  const handleTimelinePointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    finishTimelinePointer(event.currentTarget, event.pointerId, true);
  };

  const handleTimelineLostPointerCapture = (event: ReactPointerEvent<HTMLDivElement>) => {
    finishTimelinePointer(event.currentTarget, event.pointerId, true);
  };

  const handleTimelineClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    const suppressedClick = suppressedTimelineClickRef.current;
    if (!suppressedClick) return;

    if (event.detail === 0) {
      clearSuppressedTimelineClick();
      return;
    }

    const nativePointerEvent = event.nativeEvent as MouseEvent & { pointerId?: number };
    if (
      typeof nativePointerEvent.pointerId === "number" &&
      nativePointerEvent.pointerId >= 0 &&
      nativePointerEvent.pointerId !== suppressedClick.pointerId
    ) {
      return;
    }

    clearSuppressedTimelineClick();
    if (event.cancelable) event.preventDefault();
    event.stopPropagation();
  };

  useLayoutEffect(() => {
    const viewport = timelineViewportRef.current;
    if (viewport) {
      const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      viewport.scrollLeft = initialScrollLeft === null
        ? maxScrollLeft
        : Math.min(Math.max(0, initialScrollLeft), maxScrollLeft);
    }
  }, [initialScrollLeft]);

  useEffect(() => {
    const viewport = timelineViewportRef.current;
    backButtonRef.current?.focus();

    return () => {
      const drag = timelinePointerDragRef.current;

      timelinePointerDragRef.current = null;
      suppressedTimelineClickRef.current = null;

      if (viewport) {
        viewport.style.cursor = "";
        viewport
          .querySelectorAll<HTMLButtonElement>("button[data-timeline-activity-fixture]")
          .forEach((button) => {
            button.style.cursor = "";
          });

        try {
          if (drag && viewport.hasPointerCapture(drag.pointerId)) {
            viewport.releasePointerCapture(drag.pointerId);
          }
        } catch {
          // The viewport may already be detached or have lost capture.
        }
      }
    };
  }, []);

  const scrollToEnd = (end: "left" | "right") => {
    const viewport = timelineViewportRef.current;
    if (!viewport) return;

    viewport.scrollTo({
      left: end === "left" ? 0 : Math.max(0, viewport.scrollWidth - viewport.clientWidth),
      behavior: "smooth",
    });
  };

  const openActivity = (activity: ActivityReviewSelectionFixture) => {
    onOpenActivity(activity, timelineViewportRef.current?.scrollLeft ?? 0);
  };

  return (
    <div className="absolute inset-0 isolate overflow-hidden bg-white">
      <img
        src={gardenBackground}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <img
        src={edgeDecoration}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <div
        ref={timelineViewportRef}
        role="region"
        aria-label="活动时间轴"
        tabIndex={0}
        onPointerDown={handleTimelinePointerDown}
        onPointerMove={handleTimelinePointerMove}
        onPointerLeave={handleTimelinePointerLeave}
        onPointerUp={handleTimelinePointerUp}
        onPointerCancel={handleTimelinePointerCancel}
        onLostPointerCapture={handleTimelineLostPointerCapture}
        onClickCapture={handleTimelineClickCapture}
        className="absolute cursor-grab [&::-webkit-scrollbar]:hidden focus-visible:outline-2 focus-visible:outline-[#4c392b]"
        style={{
          left: "5.2604167%",
          top: "23.7962963%",
          width: "91.6666667%",
          height: "65.7407407%",
          overflowX: "auto",
          overflowY: "hidden",
          scrollbarWidth: "none",
        }}
      >
        <div
          data-timeline-path
          className="pointer-events-none absolute left-0 top-0"
          style={{
            width: toSceneCqw(TIMELINE_PRESENTATION.pathWidth),
            height: toSceneCqw(PATH_HEIGHT),
          }}
        >
          <div
            className="absolute left-0"
            style={{
              top: toSceneCqw(VINE_Y),
              width: "100%",
              height: toSceneCqw(VINE_HEIGHT),
              backgroundImage: `url(${vineTile})`,
              backgroundRepeat: "repeat-x",
              backgroundPosition: "0 0",
              backgroundSize: "45cqw 15cqw",
            }}
          />
          {TIMELINE_PRESENTATION.cards.map((card) => (
            <TimelineCard
              key={card.activity.fixtureId}
              activity={card.activity}
              variant={card.variant}
              cardY={card.cardY}
              slotIndex={card.slotIndex}
              slotLeft={toSceneCqw(getTimelineSlotX(card.slotIndex))}
              onOpenActivity={openActivity}
            />
          ))}
          {TIMELINE_PRESENTATION.monthLabels.map((marker) => (
            <TimelineMarker key={marker.monthKey} marker={marker} />
          ))}
          {TIMELINE_PRESENTATION.glowMarkers.map((marker) => (
            <TimelineGlowMarker key={marker.fixtureId} marker={marker} />
          ))}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          left: "34.4270833%",
          top: "0.3703704%",
          width: "31.1458333%",
          height: "14.4444444%",
          boxSizing: "border-box",
          border: `${toSceneCqw(1)} solid #000000`,
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.54)",
          filter: `blur(${toSceneCqw(25.1)})`,
        }}
      />

      <h1
        data-timeline-header-title
        className="absolute m-0 text-left"
        style={{
          left: "43.3333333%",
          top: "0.7407407%",
          width: "13.3333333%",
          height: "7.7777778%",
          fontFamily: '"Noto Serif SC", serif',
          fontSize: toSceneCqw(64),
          fontWeight: 700,
          lineHeight: toSceneCqw(84),
          letterSpacing: 0,
          color: "#5B4129",
          textShadow: `0 ${toSceneCqw(1)} ${toSceneCqw(5)} rgba(255, 250, 232, 0.9)`,
        }}
      >
        时光花径
      </h1>

      <p
        data-timeline-header-subtitle
        className="absolute m-0 text-left"
        style={{
          left: "41.875%",
          top: "9.537037%",
          width: "15%",
          height: "3.7037037%",
          fontFamily: '"Noto Serif SC", serif',
          fontSize: toSceneCqw(24),
          fontWeight: 400,
          lineHeight: toSceneCqw(40),
          letterSpacing: 0,
          color: "#604C35",
        }}
      >
        沿着花径，重温每一次相遇
      </p>

      <img
        src={titleOrnamentLeft}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute select-none"
        style={{
          left: "33.8541667%",
          top: "2.5%",
          width: "9.3229167%",
          height: "7.037037%",
          objectFit: "contain",
          maxWidth: "none",
        }}
      />

      <img
        src={titleOrnamentRight}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute select-none"
        style={{
          left: "56.8229167%",
          top: "2.5%",
          width: "9.2708333%",
          height: "7.037037%",
          objectFit: "contain",
          maxWidth: "none",
        }}
      />

      {kindMenuOpen ? (
        <button
          type="button"
          aria-label="关闭活动种类选单"
          onClick={closeKindMenu}
          className="absolute inset-0 z-10 cursor-default border-0 bg-transparent p-0"
        />
      ) : null}

      <div
        className="absolute"
        style={{
          left: "9.8958333%",
          top: "14.8148148%",
          width: "80.7291667%",
          height: "6.8518519%",
          boxSizing: "border-box",
          border: `${toSceneCqw(1)} solid rgba(255, 247, 222, 0.7)`,
          borderRadius: toSceneCqw(25),
          backgroundColor: "rgba(247, 242, 230, 0.86)",
        }}
      >
        <div
          className="absolute whitespace-nowrap"
          style={{
            left: toSceneCqw(35),
            top: toSceneCqw(20),
            width: toSceneCqw(48),
            height: toSceneCqw(28),
            color: "#614B35",
            fontFamily: '"Noto Serif SC", serif',
            fontSize: toSceneCqw(16),
            fontWeight: 500,
            lineHeight: toSceneCqw(28),
            letterSpacing: 0,
          }}
        >
          年份：
        </div>
        <TimelineFilterPill
          label="全部"
          ariaLabel="年份：全部"
          left={98}
          selected={selectedYear === "全部"}
          onClick={() => onFiltersChange({ year: "全部" })}
        />
        <TimelineFilterPill
          label="2026"
          left={208}
          selected={selectedYear === "2026"}
          onClick={() => onFiltersChange({ year: "2026" })}
        />
        <TimelineFilterPill
          label="2025"
          left={318}
          selected={selectedYear === "2025"}
          onClick={() => onFiltersChange({ year: "2025" })}
        />
        <TimelineFilterPill
          label="2024"
          left={428}
          selected={selectedYear === "2024"}
          onClick={() => onFiltersChange({ year: "2024" })}
        />

        <div
          aria-hidden="true"
          className="absolute"
          style={{
            left: toSceneCqw(565),
            top: toSceneCqw(20),
            width: toSceneCqw(1),
            height: toSceneCqw(35),
            backgroundColor: "#A89272",
          }}
        />

        <div
          className="absolute whitespace-nowrap"
          style={{
            left: toSceneCqw(592),
            top: toSceneCqw(20),
            width: toSceneCqw(80),
            height: toSceneCqw(28),
            color: "#614B35",
            fontFamily: '"Noto Serif SC", serif',
            fontSize: toSceneCqw(16),
            fontWeight: 500,
            lineHeight: toSceneCqw(28),
            letterSpacing: 0,
          }}
        >
          活动类型：
        </div>
        <button
          ref={kindButtonRef}
          type="button"
          onClick={() => setKindMenuOpen((open) => !open)}
          aria-expanded={kindMenuOpen}
          aria-controls="timeline-kind-options"
          className="absolute flex cursor-pointer items-center justify-center whitespace-nowrap p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#614B35]"
          style={{
            left: toSceneCqw(703),
            top: toSceneCqw(15),
            width: toSceneCqw(196),
            height: toSceneCqw(44),
            zIndex: kindMenuOpen ? 20 : undefined,
            boxSizing: "border-box",
            border: `${toSceneCqw(1)} solid #C5B79E`,
            borderRadius: toSceneCqw(22),
            backgroundColor: "rgba(255, 249, 237, 0.7)",
            color: "#614C37",
            fontFamily: '"Noto Serif SC", serif',
            fontSize: toSceneCqw(16),
            fontWeight: 500,
            lineHeight: toSceneCqw(24),
            letterSpacing: 0,
          }}
        >
          {selectedKind}
        </button>

        {kindMenuOpen ? (
          <div
            id="timeline-kind-options"
            role="group"
            aria-label="活动种类选项"
            className="absolute"
            style={{
              left: toSceneCqw(703),
              top: toSceneCqw(68),
              width: toSceneCqw(200),
              height: toSceneCqw(400),
              zIndex: 20,
              boxSizing: "border-box",
              border: `${toSceneCqw(1)} solid #D9C299`,
              borderRadius: toSceneCqw(12),
              backgroundColor: "rgba(255, 249, 236, 0.97)",
            }}
          >
            {TIMELINE_KIND_OPTIONS.map((option, index) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onFiltersChange({ kind: option });
                  closeKindMenu();
                }}
                aria-pressed={selectedKind === option}
                className="absolute flex cursor-pointer items-center justify-center whitespace-nowrap p-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#465B49]"
                style={{
                  left: toSceneCqw(12),
                  top: toSceneCqw(12 + index * 54),
                  width: toSceneCqw(176),
                  height: toSceneCqw(44),
                  boxSizing: "border-box",
                  border: `${toSceneCqw(1)} solid #B7B49A`,
                  borderRadius: toSceneCqw(22),
                  backgroundColor: "#FAF8F0",
                  color: "#465B49",
                  fontFamily: '"Noto Sans SC", sans-serif',
                  fontSize: toSceneCqw(17),
                  fontWeight: 400,
                  whiteSpace: "nowrap",
                }}
              >
                {option}
              </button>
            ))}
          </div>
        ) : null}

        <div
          aria-hidden="true"
          className="absolute"
          style={{
            left: toSceneCqw(941),
            top: toSceneCqw(20),
            width: toSceneCqw(1),
            height: toSceneCqw(35),
            backgroundColor: "#A89272",
          }}
        />

        <div
          className="absolute whitespace-nowrap"
          style={{
            left: toSceneCqw(969),
            top: toSceneCqw(20),
            width: toSceneCqw(80),
            height: toSceneCqw(28),
            color: "#614B35",
            fontFamily: '"Noto Serif SC", serif',
            fontSize: toSceneCqw(16),
            fontWeight: 500,
            lineHeight: toSceneCqw(28),
            letterSpacing: 0,
          }}
        >
          活动分类：
        </div>
        <TimelineFilterPill
          label="全部"
          ariaLabel="活动分类：全部"
          left={1086}
          selected={selectedForm === "全部"}
          onClick={() => onFiltersChange({ form: "全部" })}
        />
        <TimelineFilterPill
          label="线上"
          left={1194}
          selected={selectedForm === "线上"}
          onClick={() => onFiltersChange({ form: "线上" })}
        />
        <TimelineFilterPill
          label="线下"
          left={1302}
          selected={selectedForm === "线下"}
          onClick={() => onFiltersChange({ form: "线下" })}
        />
        <TimelineFilterPill
          label="周边制品"
          left={1410}
          selected={selectedForm === "周边制品"}
          onClick={() => onFiltersChange({ form: "周边制品" })}
        />
      </div>

      <div
        className="absolute overflow-hidden"
        style={{
          left: "4.1666667%",
          top: "91.6666667%",
          width: "91.6666667%",
          height: "4.8148148%",
        }}
      >
        <button
          type="button"
          onClick={() => scrollToEnd("left")}
          className="absolute flex items-center justify-center overflow-hidden border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FFF5DD]"
          style={{
            left: 0,
            top: 0,
            width: toSceneCqw(190),
            height: toSceneCqw(44),
            borderRadius: toSceneCqw(22),
            color: "#FFF5DD",
            fontFamily: '"Noto Serif SC", serif',
            fontSize: toSceneCqw(16),
            fontWeight: 500,
            lineHeight: toSceneCqw(24),
            letterSpacing: 0,
            textShadow: `0 0 ${toSceneCqw(2)} #000000`,
            whiteSpace: "pre",
          }}
        >
          {"←  更早的回忆"}
        </button>
        <button
          type="button"
          onClick={() => scrollToEnd("right")}
          className="absolute flex items-center justify-center overflow-hidden border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FFF5DD]"
          style={{
            left: toSceneCqw(1570),
            top: 0,
            width: toSceneCqw(190),
            height: toSceneCqw(44),
            borderRadius: toSceneCqw(22),
            color: "#FFF5DD",
            fontFamily: '"Noto Serif SC", serif',
            fontSize: toSceneCqw(16),
            fontWeight: 500,
            lineHeight: toSceneCqw(24),
            letterSpacing: 0,
            textShadow: `0 ${toSceneCqw(1)} ${toSceneCqw(2)} #594229`,
            whiteSpace: "pre",
          }}
        >
          {"最近的盛放  →"}
        </button>
        <p
          className="pointer-events-none absolute m-0"
          style={{
            left: toSceneCqw(717),
            top: toSceneCqw(7),
            width: toSceneCqw(249),
            height: toSceneCqw(24),
            color: "#FFF5DD",
            fontFamily: '"Noto Serif SC", serif',
            fontSize: toSceneCqw(16),
            fontWeight: 500,
            lineHeight: toSceneCqw(24),
            letterSpacing: 0,
            textShadow: `0 ${toSceneCqw(1)} ${toSceneCqw(2)} #594229`,
            whiteSpace: "pre",
          }}
        >
          {"←     左右滑动，探索更多活动     →"}
        </p>
      </div>

      <button
        ref={backButtonRef}
        type="button"
        onClick={onBack}
        aria-label="返回心愿盒主页"
        className="absolute overflow-hidden border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4c392b]"
        style={{
          left: "3.8541667%",
          top: "2.1296296%",
          width: "8.8541667%",
          height: "6.8518519%",
          borderRadius: "1.1458333cqw",
        }}
      >
        <img
          src={backDoubleChevron}
          alt=""
          aria-hidden="true"
          className="absolute"
          style={{
            left: "4.1176471%",
            top: "6.7567568%",
            width: "43.5294118%",
            height: "86.4864865%",
          }}
        />
        <span
          className="absolute text-left text-white"
          style={{
            left: "47.6470588%",
            top: "22.972973%",
            width: "32.9411765%",
            height: "54.0540541%",
            fontFamily: '"Noto Serif SC", serif',
            fontWeight: 600,
            fontSize: toSceneCqw(28),
            lineHeight: toSceneCqw(40),
            letterSpacing: 0,
            textShadow: "0 0 0.1041667cqw #000",
          }}
        >
          返回
        </span>
      </button>
    </div>
  );
}

export default WishBoxTimeline;
