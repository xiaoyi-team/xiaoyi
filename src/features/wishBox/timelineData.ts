import type { SupportRecordListItem } from "../../services/wishBox";
import { formatTimelineDateRange, type TimelineDateParts } from "./timelinePresentation";

export type TimelineRecord = {
  recordId: number;
  title: string;
  startDate: TimelineDateParts;
  endDate: TimelineDateParts;
  coverThumbnailUrl: string | null;
};

const BEIJING_DATETIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?$/;

export function extractBeijingDate(
  value: string,
  recordId: number,
  field: "start_time" | "end_time",
): TimelineDateParts {
  try {
    const match = typeof value === "string" ? BEIJING_DATETIME_PATTERN.exec(value) : null;
    if (!match || match[0] !== value) {
      throw new Error("expected YYYY-MM-DDTHH:mm:ss with optional fractional seconds and no timezone marker.");
    }

    const [, year, month, day, hour, minute, second] = match;
    if (Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59) {
      throw new Error("time must be within 00:00:00-23:59:59.");
    }

    // Offsetless backend datetimes already represent Beijing calendar dates.
    const date = { year: Number(year), month: Number(month), day: Number(day) };
    // Reuse the existing calendar validation without changing its private helper.
    formatTimelineDateRange(date, date);
    return date;
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    throw new Error(`Timeline mapping error for recordId ${recordId}, ${field}: ${error.message}`, {
      cause: error,
    });
  }
}

export function mapSupportRecordsToTimeline(
  records: readonly SupportRecordListItem[],
): TimelineRecord[] {
  // Backend order is start_time DESC, id DESC; never reverse the cached array in place.
  return [...records].reverse().map((record) => {
    const startDate = extractBeijingDate(record.start_time, record.id, "start_time");
    const endDate = extractBeijingDate(record.end_time, record.id, "end_time");
    try {
      formatTimelineDateRange(startDate, endDate);
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      throw new Error(`Timeline mapping error for recordId ${record.id}, end_time: ${error.message}`, {
        cause: error,
      });
    }

    return {
      recordId: record.id,
      title: record.title,
      startDate,
      endDate,
      coverThumbnailUrl: record.cover_thumbnail_url,
    };
  });
}
