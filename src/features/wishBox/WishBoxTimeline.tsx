import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import backDoubleChevron from "../../assets/wish-box/back-double-chevron.svg";
import edgeDecoration from "../../assets/wish-box/timeline-edge-decoration.png";
import gardenBackground from "../../assets/wish-box/timeline-garden-background.png";
import titleOrnamentLeft from "../../assets/wish-box/timeline-title-ornament-left.png";
import titleOrnamentRight from "../../assets/wish-box/timeline-title-ornament-right.png";
import vineTile from "../../assets/wish-box/timeline-vine-tile.png";
import type { ActivityReviewSelection } from "./WishBoxActivityReview";
import TimelineCard from "./TimelineCard";
import WishBoxLoading from "./WishBoxLoading";
import { useSupportRecords } from "./hooks/useSupportRecords";
import { mapSupportRecordsToTimeline } from "./timelineData";
import {
  deriveTimelinePresentation,
  getTimelineSlotX,
  type TimelinePresentation,
  type TimelineGlowMarkerPresentation,
  type TimelineMonthLabelPresentation,
} from "./timelinePresentation";

const DRAG_THRESHOLD_PX = 5;
// Web safety allowance for the final card's hover; not a frozen Figma dimension.
const PATH_END_PADDING = 32;

const TIMELINE_KIND_OPTIONS = [
  "全部种类",
  "节日",
  "联动",
  "纪念",
  "特别企划",
  "生日",
  "其他",
] as const;
const TIMELINE_FILTER_OPTIONS = {
  year: ["全部", "2026", "2025", "2024"],
  kind: TIMELINE_KIND_OPTIONS,
  form: ["全部", "线上", "线下", "周边制品"],
} as const;
const TIMELINE_FILTER_LABELS = { year: "年份", kind: "活动类型", form: "活动分类" };
const TIMELINE_MOBILE_MEDIA = "(orientation: landscape) and (max-width: 1100px) and (max-height: 600px) and (any-pointer: coarse)";

type TimelineYearOption = "全部" | "2026" | "2025" | "2024";
type TimelineKindOption = (typeof TIMELINE_KIND_OPTIONS)[number];
type TimelineFormOption = "全部" | "线上" | "线下" | "周边制品";

export type TimelineFilters = {
  year: TimelineYearOption;
  kind: TimelineKindOption;
  form: TimelineFormOption;
};

// Browsing intent identity is separate from the server-state Query key.
export type TimelineScrollIntent =
  | { id: number; kind: "latest"; filterKey: string }
  | { id: number; kind: "restore"; filterKey: string; scrollLeft: number };

export type TimelineScrollSnapshot = {
  filterKey: string;
  scrollLeft: number;
};

type TimelineMappingResult =
  | { status: "pending" }
  | { status: "success"; presentation: TimelinePresentation }
  | { status: "error"; error: unknown };

type TimelinePointerDrag = {
  pointerId: number;
  startClientX: number;
  startScrollLeft: number;
  isDragging: boolean;
};

type SuppressedTimelineClick = {
  pointerId: number;
};


const toSceneCqw = (designPixels: number) =>
  `${(designPixels / 19.2).toFixed(7)}cqw`;

function TimelineMarker({ marker }: { marker: TimelineMonthLabelPresentation }) {
  return (
    <div
      aria-hidden="true"
      data-timeline-marker={marker.text}
      data-timeline-marker-direction={marker.y === 266 ? "up" : "down"}
      className="pointer-events-none absolute flex items-center justify-center"
      style={{
        "--timeline-mobile-slot": marker.slotIndex,
        "--timeline-marker-pc-left": toSceneCqw(getTimelineSlotX(marker.slotIndex)),
        "--timeline-marker-pc-top": toSceneCqw(marker.y),
        boxSizing: "border-box",
        backgroundColor: "rgba(128, 106, 77, 0.88)",
        color: "#FFF4D5",
        fontFamily: '"Noto Serif SC", serif',
        fontWeight: 500,
        letterSpacing: 0,
        textAlign: "left",
        whiteSpace: "nowrap",
      } as CSSProperties}
    >
      <span
        style={{
          display: "block",
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
        "--timeline-mobile-slot": marker.slotIndex,
        "--timeline-glow-pc-left": toSceneCqw(getTimelineSlotX(marker.slotIndex) + 159),
        overflow: "visible",
      } as CSSProperties}
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
  field,
  last = false,
  wide = false,
  label,
  ariaLabel,
  left,
  selected,
  onClick,
}: {
  field: "year" | "form";
  last?: boolean;
  wide?: boolean;
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
      data-timeline-filter-pill
      data-timeline-filter-field={field}
      data-timeline-filter-last={last || undefined}
      data-timeline-filter-wide={wide || undefined}
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
  scrollIntent: TimelineScrollIntent | null;
  onScrollIntentSettled: (id: number) => void;
  onScrollSnapshot: (snapshot: TimelineScrollSnapshot) => void;
  filters: TimelineFilters;
  onFiltersChange: (updates: Partial<TimelineFilters>) => void;
  onOpenActivity: (
    activity: ActivityReviewSelection,
    snapshot: TimelineScrollSnapshot,
  ) => void;
};

function WishBoxTimeline({
  onBack,
  scrollIntent,
  onScrollIntentSettled,
  onScrollSnapshot,
  filters,
  onFiltersChange,
  onOpenActivity,
}: WishBoxTimelineProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const filterButtonRefs = useRef<Record<keyof TimelineFilters, HTMLButtonElement | null>>({ year: null, kind: null, form: null });
  const menuEntryRef = useRef<"first" | "last" | null>(null);
  const filterLayoutRef = useRef<string | null>(null);
  const filterFocusRef = useRef<{ element: HTMLButtonElement; field: keyof TimelineFilters } | null>(null);
  const timelineViewportRef = useRef<HTMLDivElement>(null);
  const timelinePointerDragRef = useRef<TimelinePointerDrag | null>(null);
  const suppressedTimelineClickRef = useRef<SuppressedTimelineClick | null>(null);
  const settledScrollIntentIdRef = useRef(0);
  const { year: selectedYear, kind: selectedKind, form: selectedForm } = filters;
  const [openMenu, setOpenMenu] = useState<keyof TimelineFilters | null>(null);
  const filterKey = JSON.stringify([selectedYear, selectedKind, selectedForm]);
  const query = useSupportRecords({
    plate: "timeline",
    year: selectedYear === "全部" ? undefined : selectedYear,
    act_kind: selectedKind === "全部种类" ? undefined : selectedKind,
    act_category: selectedForm === "全部" ? undefined : selectedForm,
  });
  const mappingResult = useMemo<TimelineMappingResult>(() => {
    if (query.data === undefined) return { status: "pending" };
    try {
      return {
        status: "success",
        presentation: deriveTimelinePresentation(mapSupportRecordsToTimeline(query.data)),
      };
    } catch (error) {
      return { status: "error", error };
    }
  }, [query.data]);
  const currentPresentation = mappingResult.status === "success" ? mappingResult.presentation : null;
  const [lastPresentation, setLastPresentation] = useState<TimelinePresentation | null>(null);
  // This is a display snapshot only; never write it into the target Query's cache.
  if (currentPresentation !== null && currentPresentation !== lastPresentation) {
    setLastPresentation(currentPresentation);
  }
  const previousPresentation = lastPresentation?.cards.length ? lastPresentation : null;
  const presentation = currentPresentation ?? previousPresentation;
  const showingPreviousResults = currentPresentation === null && previousPresentation !== null;
  const pathEndPadding = presentation && presentation.cards.length > 0 ? PATH_END_PADDING : 0;
  // Mobile geometry is a view of the same ordered records, not a second data model.
  const mobileContentWidth = presentation && presentation.cards.length > 0
    ? (presentation.cards.length - 1) * 120 + 200
    : 0;
  const hasMappingError = mappingResult.status === "error";
  const hasError = hasMappingError || query.isError;
  const isInitialError = hasError && presentation === null;
  const showCenterLoading =
    query.isLoading && presentation === null && !hasError;
  const showCornerLoading = showingPreviousResults && query.isFetching;
  const showEmpty = query.isSuccess && currentPresentation?.cards.length === 0;
  const hasActiveFilters = selectedYear !== "全部" || selectedKind !== "全部种类" || selectedForm !== "全部";

  const cancelPendingScrollIntent = () => {
    if (
      currentPresentation === null ||
      !scrollIntent || scrollIntent.filterKey !== filterKey ||
      scrollIntent.id <= settledScrollIntentIdRef.current
    ) return;

    settledScrollIntentIdRef.current = scrollIntent.id;
    onScrollIntentSettled(scrollIntent.id);
  };

  const closeFilterMenu = (restoreFocus = true) => {
    setOpenMenu(null);
    if (restoreFocus && openMenu) filterButtonRefs.current[openMenu]?.focus({ preventScroll: true });
  };

  useLayoutEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const media = window.matchMedia(TIMELINE_MOBILE_MEDIA);
    const filterBar = scene.querySelector<HTMLElement>("[data-timeline-filters]");
    const readFilterLayout = () => media.matches && filterBar
      ? getComputedStyle(filterBar).getPropertyValue("--timeline-filter-layout").trim()
      : "desktop";
    if (filterLayoutRef.current === null) filterLayoutRef.current = readFilterLayout();
    const updateLayout = () => {
      if (!media.matches) return;
      const bounds = scene.getBoundingClientRect();
      const title = scene.querySelector<HTMLElement>("[data-timeline-header-title]");
      const viewport = timelineViewportRef.current;
      const navigation = scene.querySelector<HTMLElement>("[data-timeline-navigation]");
      if (!title || !viewport || !navigation) return;
      const handset = readFilterLayout() === "handset";
      if (handset) {
        // Scale the whole 667 card/vine group, reserving its 106px top and 14px hint.
        const cardEnvelope = 115.826172 + 97.92;
        const cardScale = Math.max(0, Math.min(1, bounds.width / 667, (bounds.height - 106 - 14) / cardEnvelope));
        scene.style.setProperty("--timeline-667-scale", `${cardScale}`);
        // Keep the unmodified header's legacy unit; track geometry no longer reads it.
        scene.style.setProperty("--timeline-handset-unit", `${0.72 * cardScale}px`);
        scene.style.setProperty("--timeline-handset-card-scale", `${1920 * 144 * cardScale / (bounds.width * 350)}`);
        scene.dataset.timelineMobileCapacity = "handset";
      } else {
        const scale = bounds.width / 956;
        const titleBottom = title.getBoundingClientRect().bottom - bounds.top;
        const navTop = navigation.getBoundingClientRect().top - bounds.top;
        const viewportTop = viewport.getBoundingClientRect().top;
        const cards = [...viewport.querySelectorAll<HTMLButtonElement>("button[data-timeline-record-id]")];
        // Measure the actual interactive cards, not the taller viewport/ornament box.
        const cardBottom = cards.length
          ? Math.max(...cards.map((card) => card.getBoundingClientRect().bottom - viewportTop))
          : 299 * scale;
        const extra = Math.max(0, bounds.height - 440 * scale);
        const barHeight = 40 * scale;
        let paperTop = Math.max(65 * scale, titleBottom + 4);
        const baseTop = 110 * scale;
        const lower = Math.max(baseTop, paperTop + barHeight + 3);
        const upper = navTop - cardBottom - 1;
        let bodyTop = lower + Math.min(
          Math.max(0, (extra - (lower - baseTop)) / 2),
          Math.max(0, navTop - 308 * scale - lower - 4),
        );
        let capacity = "normal";
        if (bodyTop > upper) {
          bodyTop = upper;
          capacity = "body-cap";
          if (paperTop + barHeight + 3 > upper) {
            const availableGap = upper - titleBottom - barHeight;
            capacity = availableGap < 0 ? "insufficient" : "compact";
            paperTop = titleBottom + Math.max(0, Math.min(4, availableGap * 4 / 7));
          }
        }
        // Pure px variables cross containing blocks without re-resolving percentages.
        const hitHeight = Math.max(0, Math.min(44, bodyTop - titleBottom - 2));
        const visualCenter = paperTop + 20 * scale;
        const hitCenter = Math.min(bodyTop - 1 - hitHeight / 2,
          Math.max(titleBottom + 1 + hitHeight / 2, visualCenter));
        const variables = {
          "--timeline-filter-top": paperTop,
          "--timeline-body-top": bodyTop,
          "--timeline-card-envelope": cardBottom,
          "--timeline-filter-hit-height": hitHeight,
          "--timeline-filter-hit-offset": hitCenter - visualCenter,
        };
        for (const [name, value] of Object.entries(variables)) scene.style.setProperty(name, `${value}px`);
        scene.dataset.timelineMobileCapacity = capacity;
      }
      if (openMenu) {
        const owner = filterButtonRefs.current[openMenu];
        const trigger = owner?.getClientRects().length ? owner.getBoundingClientRect() : null;
        const paper = scene.querySelector("[data-timeline-filters]")?.getBoundingClientRect();
        if (trigger && paper) {
          const border = scene.querySelector<HTMLElement>("[data-timeline-filters]")!.clientLeft;
          const menuWidth = handset ? 180 : 160;
          const menuLeft = handset && openMenu === "form" ? trigger.right - menuWidth + 2 : trigger.left;
          const menuTop = trigger.bottom + (handset ? 3 : 1);
          scene.style.setProperty("--timeline-menu-left", `${Math.max(bounds.left + 12, Math.min(menuLeft, bounds.right - menuWidth - 12)) - paper.left - border}px`);
          scene.style.setProperty("--timeline-menu-top", `${menuTop - paper.top - border}px`);
          scene.style.setProperty("--timeline-menu-max-height", `${Math.max(0, bounds.bottom - menuTop - (handset ? 7 : 12))}px`);
        }
      }
    };
    const handleModeChange = () => {
      setOpenMenu(null);
      updateLayout();
    };
    updateLayout();
    if (openMenu && menuEntryRef.current) {
      const options = scene.querySelectorAll<HTMLButtonElement>(`#timeline-${openMenu}-options > button`);
      options[menuEntryRef.current === "first" ? 0 : options.length - 1]?.focus();
      menuEntryRef.current = null;
    }
    const observer = new ResizeObserver(() => {
      const layout = readFilterLayout();
      if (filterLayoutRef.current !== layout) {
        filterLayoutRef.current = layout;
        if (openMenu) setOpenMenu(null);
        const previous = filterFocusRef.current;
        const active = document.activeElement;
        const hidden = previous && previous.element.getClientRects().length === 0;
        // A hidden owner may already have blurred to body before this callback.
        if (previous && document.hasFocus() &&
          (active === previous.element || (active === document.body && hidden)) &&
          (hidden || previous.element.closest("[data-timeline-filter-menu]"))) {
          const selected = filterBar?.querySelector<HTMLButtonElement>(
            `[data-timeline-filter-field="${previous.field}"][aria-pressed="true"]`,
          );
          const target = [selected, filterButtonRefs.current[previous.field], filterButtonRefs.current.kind, backButtonRef.current]
            .find((button) => button && button.getClientRects().length > 0 && !button.disabled && !button.closest("[inert]"));
          target?.focus({ preventScroll: true });
        }
      }
      updateLayout();
    });
    observer.observe(scene);
    media.addEventListener("change", handleModeChange);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", handleModeChange);
    };
  }, [openMenu, presentation]);

  const clearSuppressedTimelineClick = () => {
    suppressedTimelineClickRef.current = null;
  };

  const setTimelineDraggingCursor = (viewport: HTMLDivElement, isDragging: boolean) => {
    viewport.style.cursor = isDragging ? "grabbing" : "";
    viewport
      .querySelectorAll<HTMLButtonElement>("button[data-timeline-record-id]")
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

    cancelPendingScrollIntent();

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

    if (event.isPrimary && (event.pointerType === "touch" ||
      (event.pointerType === "mouse" && event.button === 0))) {
      cancelPendingScrollIntent();
    }

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
    if (
      !scrollIntent || scrollIntent.filterKey !== filterKey ||
      scrollIntent.id <= settledScrollIntentIdRef.current ||
      !query.isSuccess || mappingResult.status !== "success"
    ) return;

    const viewport = timelineViewportRef.current;
    if (!viewport?.isConnected || viewport.clientWidth <= 0 || viewport.clientHeight <= 0) return;

    // Register before acknowledging; Strict Mode or stale props cannot replay this intent.
    settledScrollIntentIdRef.current = scrollIntent.id;
    if (mappingResult.presentation.cards.length > 0) {
      const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      viewport.scrollLeft = scrollIntent.kind === "latest"
        ? maxScrollLeft
        : Math.min(Math.max(0, scrollIntent.scrollLeft), maxScrollLeft);
    }
    onScrollSnapshot({ filterKey, scrollLeft: Math.max(0, viewport.scrollLeft) });
    onScrollIntentSettled(scrollIntent.id);
  }, [scrollIntent, filterKey, query.isSuccess, mappingResult, onScrollSnapshot, onScrollIntentSettled]);

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
          .querySelectorAll<HTMLButtonElement>("button[data-timeline-record-id]")
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
    cancelPendingScrollIntent();
    const viewport = timelineViewportRef.current;
    if (!viewport) return;

    viewport.scrollTo({
      left: end === "left" ? 0 : Math.max(0, viewport.scrollWidth - viewport.clientWidth),
      behavior: "smooth",
    });
  };

  const openActivity = (activity: ActivityReviewSelection) => {
    if (showingPreviousResults) return;
    onOpenActivity(activity, {
      filterKey,
      scrollLeft: Math.max(0, timelineViewportRef.current?.scrollLeft ?? 0),
    });
  };

  return (
    <>
    <div
      ref={sceneRef}
      className="wish-box-timeline absolute inset-0 isolate overflow-hidden bg-white"
      style={{ opacity: showCenterLoading ? 0.55 : 1 }}
      onKeyDown={(event) => {
        if (openMenu && event.key === "Escape") {
          event.stopPropagation();
          closeFilterMenu();
        }
      }}
    >
      <img
        src={gardenBackground}
        data-timeline-background
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <img
        src={edgeDecoration}
        data-timeline-edge-decoration
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <div
        ref={timelineViewportRef}
        role="region"
        aria-label="活动时间轴"
        data-timeline-viewport
        aria-busy={showCenterLoading || showCornerLoading}
        inert={openMenu !== null}
        tabIndex={0}
        onPointerDown={handleTimelinePointerDown}
        onPointerMove={handleTimelinePointerMove}
        onPointerLeave={handleTimelinePointerLeave}
        onPointerUp={handleTimelinePointerUp}
        onPointerCancel={handleTimelinePointerCancel}
        onLostPointerCapture={handleTimelineLostPointerCapture}
        onClickCapture={handleTimelineClickCapture}
        onWheel={cancelPendingScrollIntent}
        onKeyDown={(event) => {
          if (event.target === event.currentTarget &&
            ["ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown", " "].includes(event.key)) {
            cancelPendingScrollIntent();
          }
        }}
        onScroll={(event) => {
          if (currentPresentation) {
            onScrollSnapshot({ filterKey, scrollLeft: Math.max(0, event.currentTarget.scrollLeft) });
          }
        }}
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
        {presentation ? <div
          data-timeline-path
          className="pointer-events-none absolute left-0 top-0"
          style={{
            "--timeline-record-count": presentation.cards.length,
            "--timeline-pc-path-width": toSceneCqw(presentation.pathWidth + pathEndPadding),
            "--timeline-pc-content-width": toSceneCqw(presentation.pathWidth),
            "--timeline-pc-end-padding": toSceneCqw(pathEndPadding),
            "--timeline-mobile-content-width": mobileContentWidth,
            "--timeline-mobile-end-padding": pathEndPadding * 200 / 350,
            minWidth: presentation.cards.length > 0 || showEmpty ? "100%" : undefined,
          } as CSSProperties}
        >
          <div
            data-timeline-vine
            className="absolute left-0"
            style={{
              width: "100%",
              backgroundImage: `url(${vineTile})`,
              backgroundRepeat: "repeat-x",
              backgroundPosition: "0 0",
            }}
          />
          <div
            data-timeline-activity-group
            inert={showingPreviousResults}
            className="absolute top-0 h-full"
          >
            {presentation.cards.map((card) => (
              <div
                key={card.activity.recordId}
                data-timeline-card-slot
                data-timeline-direction={card.cardY === 28 ? "up" : "down"}
                className="contents"
                style={{ "--timeline-mobile-slot": card.slotIndex } as CSSProperties}
              >
                <TimelineCard
                  activity={card.activity}
                  coverThumbnailUrl={card.coverThumbnailUrl}
                  coverPosX={card.coverPosX}
                  coverPosY={card.coverPosY}
                  variant={card.variant}
                  cardY={card.cardY}
                  slotIndex={card.slotIndex}
                  slotLeft={toSceneCqw(getTimelineSlotX(card.slotIndex))}
                  onOpenActivity={openActivity}
                />
              </div>
            ))}
            {presentation.monthLabels.map((marker) => (
              <TimelineMarker key={marker.monthKey} marker={marker} />
            ))}
            {presentation.glowMarkers.map((marker) => (
              <TimelineGlowMarker key={marker.recordId} marker={marker} />
            ))}
          </div>
        </div> : null}
        {showEmpty ? (
          <div
            data-timeline-empty
            role="status"
            className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center"
            style={{
              gap: "clamp(10px, 0.625cqw, 12px)",
              fontFamily: '"Noto Serif SC", serif',
              textShadow: "-1px -1px 1px #FFFAEF, 1px -1px 1px #FFFAEF, -1px 1px 1px #FFFAEF, 1px 1px 1px #FFFAEF, 0 1px 6px #FFFAEF",
            }}
          >
            <h2
              className="m-0 font-semibold text-[#465B49]"
              style={{ marginBottom: "96px", fontSize: "clamp(24px, 1.6666667cqw, 32px)", lineHeight: 1.5 }}
            >
              这段花径还未盛放
            </h2>
            <p
              className="m-0 text-[#647568]"
              style={{ fontSize: "clamp(16px, 1.0416667cqw, 20px)", lineHeight: 1.5 }}
            >
              换一种筛选，寻找其他相遇
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  backButtonRef.current?.focus({ preventScroll: true });
                  onFiltersChange({ year: "全部", kind: "全部种类", form: "全部" });
                }}
                className="pointer-events-auto cursor-pointer rounded-full border border-[#9BA68F] bg-[#FAF8F0] px-7 py-2.5 text-[#465B49] transition-colors hover:bg-[#F0F2E9] active:bg-[#E5EADD] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#465B49] motion-reduce:transition-none"
                style={{
                  marginTop: "8px",
                  minWidth: "140px",
                  minHeight: "48px",
                  fontSize: "clamp(16px, 0.9375cqw, 18px)",
                  lineHeight: 1.5,
                  textShadow: "none",
                }}
              >
                清除筛选
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {showCornerLoading ? (
        <WishBoxLoading variant="corner" className="z-30" />
      ) : null}
      {!showCenterLoading && (hasError || (query.isPending && !showCornerLoading)) ? (
        <div
          role={hasError ? "alert" : "status"}
          data-timeline-query-status
          data-timeline-retained-error={hasError && presentation !== null ? "" : undefined}
          className="absolute flex items-center gap-2 rounded border border-[#C5B79E] bg-[#F3EDE1] px-3 py-1 text-[#614B35]"
          style={{
            left: "5.2604167%",
            top: presentation ? "21.6666667%" : "41.6666667%",
            maxWidth: "91.6666667%",
            fontSize: isInitialError ? `max(14px, ${toSceneCqw(16)})` : toSceneCqw(presentation ? 12 : 16),
            lineHeight: isInitialError ? `max(20px, ${toSceneCqw(24)})` : toSceneCqw(presentation ? 18 : 24),
            gap: isInitialError ? "12px" : undefined,
          }}
        >
          <span>
            {hasError
              ? hasMappingError
                ? showingPreviousResults
                  ? "活动内容暂时无法显示，已保留此前结果，暂不可打开"
                  : "活动内容暂时无法显示，请重试"
                : showingPreviousResults
                  ? "筛选结果加载失败，当前保留此前结果，暂不可打开活动。"
                  : presentation
                    ? "活动列表更新失败，已保留当前内容。"
                    : "活动列表加载失败，请重试"
              : "正在加载活动…"}
          </span>
          {hasError ? (
            <button
              type="button"
              disabled={query.isFetching}
              onClick={() => {
                backButtonRef.current?.focus({ preventScroll: true });
                void query.refetch();
              }}
              className={`shrink-0 cursor-pointer rounded border focus-visible:outline-2 disabled:cursor-wait ${isInitialError
                ? "border-[#C7944D] bg-[#FFF9E9] px-4 text-[#243D61] hover:bg-[#F3DDB0] focus-visible:outline-offset-2 focus-visible:outline-[#243D61]"
                : "border-[#C5B79E] bg-transparent px-2 focus-visible:outline-[#614B35]"}`}
              style={isInitialError ? { minWidth: "80px", minHeight: "44px" } : undefined}
            >
              {query.isFetching ? "重试中…" : "重试"}
            </button>
          ) : null}
        </div>
      ) : null}

      <div
        aria-hidden="true"
        data-timeline-title-glow
        className="pointer-events-none absolute"
      />

      <h1
        data-timeline-header-title
        className="absolute m-0 text-left"
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
        data-timeline-title-ornament="left"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute select-none"
        style={{
          objectFit: "contain",
          maxWidth: "none",
        }}
      />

      <img
        src={titleOrnamentRight}
        data-timeline-title-ornament="right"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute select-none"
        style={{
          objectFit: "contain",
          maxWidth: "none",
        }}
      />

      {openMenu ? (
        <button
          type="button"
          aria-label={`关闭${TIMELINE_FILTER_LABELS[openMenu]}选单`}
          data-timeline-menu-dismiss
          onClick={() => closeFilterMenu()}
          tabIndex={-1}
          className="absolute inset-0 z-10 cursor-default border-0 bg-transparent p-0"
        />
      ) : null}

      <div
        data-timeline-filters
        className="absolute"
        onFocusCapture={(event) => {
          const element = (event.target as HTMLElement).closest<HTMLButtonElement>("button");
          const field = element?.dataset.timelineFilterField ?? element?.dataset.timelineDropdownTrigger ??
            element?.closest<HTMLElement>("[data-timeline-filter-menu]")?.dataset.timelineFilterMenu;
          if (element && (field === "year" || field === "kind" || field === "form")) {
            filterFocusRef.current = { element, field };
          }
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            const hiddenBlur = (event.relatedTarget === null || event.relatedTarget === document.body) &&
              event.target.getClientRects().length === 0;
            if (!hiddenBlur) filterFocusRef.current = null;
            if (openMenu && !(event.relatedTarget instanceof Element && event.relatedTarget.hasAttribute("data-timeline-menu-dismiss"))) {
              closeFilterMenu(false);
            }
          }
        }}
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
          data-timeline-filter-label="year"
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
          field="year"
          label="全部"
          ariaLabel="年份：全部"
          left={98}
          selected={selectedYear === "全部"}
          onClick={() => onFiltersChange({ year: "全部" })}
        />
        <TimelineFilterPill
          field="year"
          label="2026"
          left={208}
          selected={selectedYear === "2026"}
          onClick={() => onFiltersChange({ year: "2026" })}
        />
        <TimelineFilterPill
          field="year"
          label="2025"
          left={318}
          selected={selectedYear === "2025"}
          onClick={() => onFiltersChange({ year: "2025" })}
        />
        <TimelineFilterPill
          field="year"
          last
          label="2024"
          left={428}
          selected={selectedYear === "2024"}
          onClick={() => onFiltersChange({ year: "2024" })}
        />

        <div
          aria-hidden="true"
          data-timeline-filter-separator="year"
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
          data-timeline-filter-label="kind"
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
        {(["year", "kind", "form"] as const).map((field) => (
        <button
          key={field}
          ref={(element) => { filterButtonRefs.current[field] = element; }}
          data-timeline-dropdown-trigger={field}
          data-timeline-kind-trigger={field === "kind" ? "" : undefined}
          type="button"
          onClick={() => setOpenMenu((open) => open === field ? null : field)}
          onKeyDown={(event) => {
            if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
            event.preventDefault();
            menuEntryRef.current = event.key === "ArrowDown" ? "first" : "last";
            setOpenMenu(field);
            if (openMenu === field) {
              const options = sceneRef.current?.querySelectorAll<HTMLButtonElement>(`#timeline-${field}-options > button`);
              options?.[event.key === "ArrowDown" ? 0 : options.length - 1]?.focus();
              menuEntryRef.current = null;
            }
          }}
          aria-label={`${TIMELINE_FILTER_LABELS[field]}：${filters[field]}`}
          aria-expanded={openMenu === field}
          aria-controls={`timeline-${field}-options`}
          className="absolute flex cursor-pointer items-center justify-center whitespace-nowrap p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#614B35]"
          style={{
            left: toSceneCqw(703),
            top: toSceneCqw(15),
            width: toSceneCqw(196),
            height: toSceneCqw(44),
            zIndex: openMenu === field ? 20 : undefined,
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
          <span data-timeline-filter-value>{filters[field]}</span>
          <span data-timeline-handset-value>
            {filters[field] === "全部" ? (field === "year" ? "全部年份" : "全部形式") : filters[field]}
          </span>
        </button>
        ))}

        {openMenu ? (
          <div
            id={`timeline-${openMenu}-options`}
            data-timeline-filter-menu={openMenu}
            role="group"
            aria-label={`${TIMELINE_FILTER_LABELS[openMenu]}选项`}
            onKeyDown={(event) => {
              if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
              const buttons = [...event.currentTarget.querySelectorAll("button")];
              const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
              const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1
                : (current + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
              event.preventDefault();
              buttons[next]?.focus();
            }}
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
            {TIMELINE_FILTER_OPTIONS[openMenu].map((option, index) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onFiltersChange({ [openMenu]: option });
                  closeFilterMenu();
                }}
                aria-pressed={filters[openMenu] === option}
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
          data-timeline-filter-separator="form"
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
          data-timeline-filter-label="form"
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
          field="form"
          label="全部"
          ariaLabel="活动分类：全部"
          left={1086}
          selected={selectedForm === "全部"}
          onClick={() => onFiltersChange({ form: "全部" })}
        />
        <TimelineFilterPill
          field="form"
          label="线上"
          left={1194}
          selected={selectedForm === "线上"}
          onClick={() => onFiltersChange({ form: "线上" })}
        />
        <TimelineFilterPill
          field="form"
          label="线下"
          left={1302}
          selected={selectedForm === "线下"}
          onClick={() => onFiltersChange({ form: "线下" })}
        />
        <TimelineFilterPill
          field="form"
          last
          wide
          label="周边制品"
          left={1410}
          selected={selectedForm === "周边制品"}
          onClick={() => onFiltersChange({ form: "周边制品" })}
        />
      </div>

      <div
        data-timeline-navigation
        className="absolute overflow-hidden"
      >
        <button
          type="button"
          data-timeline-nav="earlier"
          onClick={() => scrollToEnd("left")}
          className="absolute flex items-center justify-center overflow-hidden border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FFF5DD]"
        >
          {"←  更早的回忆"}
        </button>
        <button
          type="button"
          data-timeline-nav="latest"
          onClick={() => scrollToEnd("right")}
          className="absolute flex items-center justify-center overflow-hidden border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FFF5DD]"
        >
          {"最近的盛放  →"}
        </button>
        <p
          className="pointer-events-none absolute m-0"
        >
          {"←     左右滑动，探索更多活动     →"}
        </p>
      </div>

      <button
        ref={backButtonRef}
        type="button"
        onClick={onBack}
        aria-label="返回心愿盒主页"
        data-timeline-return
        className="absolute overflow-hidden border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4c392b]"
      >
        <img
          src={backDoubleChevron}
          alt=""
          aria-hidden="true"
          className="absolute"
        />
        <span
          className="absolute text-left text-white"
          style={{
            fontFamily: '"Noto Serif SC", serif',
            fontWeight: 600,
            letterSpacing: 0,
          }}
        >
          返回
        </span>
      </button>
    </div>
    {showCenterLoading ? <WishBoxLoading variant="center" className="z-30" /> : null}
    </>
  );
}

export default WishBoxTimeline;
