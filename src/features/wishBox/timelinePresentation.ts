import type { TimelineRecord } from "./timelineData";

// UI calendar dates; these names do not define backend wire fields.
export type TimelineDateParts = {
  year: number;
  month: number;
  day: number;
};

export type TimelineCardVariant = "rose" | "iris";
type TimelineDirection = "up" | "down";

export type TimelineCardPresentation = {
  activity: { recordId: number; title: string; date: string };
  coverThumbnailUrl: string | null;
  slotIndex: number;
  variant: TimelineCardVariant;
  cardY: number;
};

export type TimelineMonthLabelPresentation = {
  monthKey: string;
  slotIndex: number;
  text: string;
  y: number;
};

export type TimelineGlowMarkerPresentation = {
  recordId: number;
  slotIndex: number;
  lineDirection: TimelineDirection;
};

export type TimelinePresentation = {
  cards: TimelineCardPresentation[];
  monthLabels: TimelineMonthLabelPresentation[];
  glowMarkers: TimelineGlowMarkerPresentation[];
  pathWidth: number;
};

export const CARD_WIDTH = 350;
export const MONTH_LABEL_HEIGHT = 36;
const SLOT_SPACING = 215;
const CARD_VARIANT_PATTERN = ["rose", "iris", "iris", "rose"] as const;

export const getTimelineSlotX = (slotIndex: number) => slotIndex * SLOT_SPACING;

function validateTimelineDate(date: TimelineDateParts, label: string) {
  const { year, month, day } = date;
  if (
    !Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day) ||
    year <= 0 || month < 1 || month > 12
  ) {
    throw new Error(`Invalid Timeline fixture ${label}: expected an integer calendar date.`);
  }

  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day < 1 || day > daysInMonth[month - 1]) {
    throw new Error(`Invalid Timeline fixture ${label}: day is outside the calendar month.`);
  }
}

export function formatTimelineDateRange(start: TimelineDateParts, end: TimelineDateParts): string {
  validateTimelineDate(start, "startDate");
  validateTimelineDate(end, "endDate");
  if (
    end.year < start.year ||
    (end.year === start.year && end.month < start.month) ||
    (end.year === start.year && end.month === start.month && end.day < start.day)
  ) {
    throw new Error("Invalid Timeline fixture date range: endDate precedes startDate.");
  }

  const startText = `${start.year}.${start.month}.${start.day}`;
  if (start.year === end.year && start.month === end.month && start.day === end.day) {
    return startText;
  }
  const endText = start.year === end.year
    ? `${end.month}.${end.day}`
    : `${end.year}.${end.month}.${end.day}`;
  return `${startText}-${endText}`;
}

export function deriveTimelinePresentation(
  records: readonly TimelineRecord[],
): TimelinePresentation {
  const cards: TimelineCardPresentation[] = [];
  const monthLabels: TimelineMonthLabelPresentation[] = [];
  const glowMarkers: TimelineGlowMarkerPresentation[] = [];
  const seenMonths = new Set<string>();

  records.forEach((record, slotIndex) => {
    let date: string;
    try {
      date = formatTimelineDateRange(record.startDate, record.endDate);
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      throw new Error(
        `Timeline recordId ${record.recordId} at slot ${slotIndex}: ${error.message}`,
        { cause: error },
      );
    }
    const variant: TimelineCardVariant = CARD_VARIANT_PATTERN[slotIndex % CARD_VARIANT_PATTERN.length];
    const direction: TimelineDirection = slotIndex % 2 === 0 ? "up" : "down";
    const month = String(record.startDate.month).padStart(2, "0");
    const monthKey = `${record.startDate.year}-${month}`;
    const isMonthFirst = !seenMonths.has(monthKey);

    if (isMonthFirst) {
      seenMonths.add(monthKey);
      monthLabels.push({
        monthKey,
        slotIndex,
        text: `${record.startDate.year}·${month}`,
        y: direction === "up" ? 266 : 378,
      });
    }

    cards.push({
      activity: { recordId: record.recordId, title: record.title, date },
      coverThumbnailUrl: record.coverThumbnailUrl,
      slotIndex,
      variant,
      cardY: direction === "up" ? 28 : 378 + (isMonthFirst ? MONTH_LABEL_HEIGHT : 0),
    });
    glowMarkers.push({ recordId: record.recordId, slotIndex, lineDirection: direction });
  });

  return {
    cards,
    monthLabels,
    glowMarkers,
    pathWidth: records.length > 0 ? getTimelineSlotX(records.length - 1) + CARD_WIDTH : 0,
  };
}
