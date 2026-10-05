// UI fixture dates only; these names do not define backend wire fields.
export type TimelineDateParts = {
  year: number;
  month: number;
  day: number;
};

export type TimelineActivityFixture = {
  fixtureId: string;
  title: string;
  startDate: TimelineDateParts;
  endDate: TimelineDateParts;
};

export type TimelineCardVariant = "rose" | "iris";
type TimelineDirection = "up" | "down";

export type TimelineCardPresentation = {
  activity: { fixtureId: string; title: string; date: string };
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
  fixtureId: string;
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
  fixtures: readonly TimelineActivityFixture[],
): TimelinePresentation {
  const cards: TimelineCardPresentation[] = [];
  const monthLabels: TimelineMonthLabelPresentation[] = [];
  const glowMarkers: TimelineGlowMarkerPresentation[] = [];
  const seenMonths = new Set<string>();

  fixtures.forEach((fixture, slotIndex) => {
    let date: string;
    try {
      date = formatTimelineDateRange(fixture.startDate, fixture.endDate);
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      throw new Error(
        `Timeline fixture "${fixture.fixtureId}" at slot ${slotIndex}: ${error.message}`,
        { cause: error },
      );
    }
    const variant: TimelineCardVariant = slotIndex % 2 === 0 ? "rose" : "iris";
    const direction: TimelineDirection = slotIndex % 2 === 0 ? "up" : "down";
    const month = String(fixture.startDate.month).padStart(2, "0");
    const monthKey = `${fixture.startDate.year}-${month}`;
    const isMonthFirst = !seenMonths.has(monthKey);

    if (isMonthFirst) {
      seenMonths.add(monthKey);
      monthLabels.push({
        monthKey,
        slotIndex,
        text: `${fixture.startDate.year}·${month}`,
        y: direction === "up" ? 266 : 378,
      });
    }

    cards.push({
      activity: { fixtureId: fixture.fixtureId, title: fixture.title, date },
      slotIndex,
      variant,
      cardY: direction === "up" ? 28 : 378 + (isMonthFirst ? MONTH_LABEL_HEIGHT : 0),
    });
    glowMarkers.push({ fixtureId: fixture.fixtureId, slotIndex, lineDirection: direction });
  });

  return {
    cards,
    monthLabels,
    glowMarkers,
    pathWidth: fixtures.length > 0 ? getTimelineSlotX(fixtures.length - 1) + CARD_WIDTH : 0,
  };
}
