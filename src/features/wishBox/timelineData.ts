import type { SupportRecordListItem } from "../../services/wishBox";
import { formatTimelineDateRange, type TimelineDateParts } from "./timelinePresentation";

export type TimelineRecord = {
  recordId: number;
  title: string;
  startDate: TimelineDateParts;
  endDate: TimelineDateParts;
  coverThumbnailUrl: string | null;
  coverPosX: number;
  coverPosY: number;
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

function normalizeCoverPosition(value: unknown): number {
  // Match CMS preview defaults per axis; zero is a valid edge alignment.
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 100
    ? value
    : 50;
}

export function mapSupportRecordsToTimeline(
  records: readonly SupportRecordListItem[],
): TimelineRecord[] {
  // Backend order is start_time DESC, id DESC; never reverse the cached array in place.
  return [...records].reverse().map((record) => {
    if (typeof record.id !== "number" || !Number.isSafeInteger(record.id) || record.id <= 0) {
      throw new Error("Timeline mapping error, id: expected a positive safe integer.");
    }
    if (typeof record.title !== "string") {
      throw new Error(`Timeline mapping error for recordId ${record.id}, title: expected a string.`);
    }

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

    const cover = record.cover_img;
    const thumbnailUrl = cover?.thumbnail_url;
    return {
      recordId: record.id,
      title: record.title,
      startDate,
      endDate,
      coverThumbnailUrl: typeof thumbnailUrl === "string" && thumbnailUrl.trim() ? thumbnailUrl : null,
      coverPosX: normalizeCoverPosition(cover?.pos_x),
      coverPosY: normalizeCoverPosition(cover?.pos_y),
    };
  });
}
