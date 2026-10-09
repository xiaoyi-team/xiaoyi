import type { SupportRecordDetail } from "../../services/wishBox";
import { extractBeijingDate } from "./timelineData";
import { formatTimelineDateRange, type TimelineDateParts } from "./timelinePresentation";

export type ReviewPhoto = {
  imgKey: string;
  imgUrl: string;
  thumbnailUrl: string;
};

export type ReviewPhotos =
  | { status: "ready"; items: ReviewPhoto[] }
  | { status: "empty" }
  | { status: "invalid"; error: Error };

export type ActivityReviewViewModel = {
  recordId: number;
  title: string;
  startDate: TimelineDateParts;
  endDate: TimelineDateParts;
  location: string | null;
  content: string | null;
  photos: ReviewPhotos;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function reviewMappingError(recordId: number, field: string, reason: string, cause?: Error) {
  return new Error(`Activity Review mapping error for recordId ${recordId}, ${field}: ${reason}`, {
    cause,
  });
}

function extractReviewDate(
  value: string,
  recordId: number,
  field: "start_time" | "end_time",
): TimelineDateParts {
  try {
    return extractBeijingDate(value, recordId, field);
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    throw reviewMappingError(recordId, field, error.message, error);
  }
}

function invalidPhotos(recordId: number, field: string, reason: string): ReviewPhotos {
  return { status: "invalid", error: reviewMappingError(recordId, field, reason) };
}

function mapReviewPhotos(value: unknown, recordId: number): ReviewPhotos {
  if (!Array.isArray(value)) {
    return invalidPhotos(recordId, "content_photo_list", "expected an array.");
  }
  if (value.length === 0) return { status: "empty" };
  if (value.length > 6) {
    return invalidPhotos(recordId, "content_photo_list", `expected at most 6 photos, received ${value.length}.`);
  }

  const items: ReviewPhoto[] = [];
  const seenKeys = new Set<string>();
  for (let index = 0; index < value.length; index++) {
    const photo: unknown = value[index];
    const path = `content_photo_list[${index}]`;
    if (!isPlainObject(photo)) {
      return invalidPhotos(recordId, path, "expected a plain object.");
    }
    const { img_key: imgKey, img_url: imgUrl, thumbnail_url: thumbnailUrl } = photo;
    if (!isNonEmptyString(imgKey)) {
      return invalidPhotos(recordId, `${path}.img_key`, "expected a non-empty string.");
    }
    if (!isNonEmptyString(imgUrl)) {
      return invalidPhotos(recordId, `${path}.img_url`, "expected a non-empty string.");
    }
    if (!isNonEmptyString(thumbnailUrl)) {
      return invalidPhotos(recordId, `${path}.thumbnail_url`, "expected a non-empty string.");
    }
    if (seenKeys.has(imgKey)) {
      return invalidPhotos(recordId, `${path}.img_key`, "duplicate photo identity.");
    }
    seenKeys.add(imgKey);
    items.push({ imgKey, imgUrl, thumbnailUrl });
  }

  // Preserve response order; its business display-order guarantee is still unconfirmed.
  return { status: "ready", items };
}

export function mapSupportRecordDetailToReview(
  detail: SupportRecordDetail,
  requestedRecordId: number,
): ActivityReviewViewModel {
  if (!Number.isSafeInteger(requestedRecordId) || requestedRecordId <= 0) {
    throw reviewMappingError(requestedRecordId, "requestedRecordId", "expected a positive safe integer.");
  }
  if (!isPlainObject(detail)) {
    throw reviewMappingError(requestedRecordId, "response", "expected a plain object.");
  }
  if (!Number.isSafeInteger(detail.id) || detail.id <= 0) {
    throw reviewMappingError(requestedRecordId, "id", "expected a positive safe integer.");
  }
  if (detail.id !== requestedRecordId) {
    throw reviewMappingError(requestedRecordId, "id", `response ID ${detail.id} does not match the requested ID.`);
  }
  if (!isNonEmptyString(detail.title)) {
    throw reviewMappingError(requestedRecordId, "title", "expected a non-empty string.");
  }
  if (typeof detail.location !== "string" && detail.location !== null) {
    throw reviewMappingError(requestedRecordId, "location", "expected a string or null.");
  }
  if (typeof detail.content !== "string" && detail.content !== null) {
    throw reviewMappingError(requestedRecordId, "content", "expected a string or null.");
  }

  const startDate = extractReviewDate(detail.start_time, requestedRecordId, "start_time");
  const endDate = extractReviewDate(detail.end_time, requestedRecordId, "end_time");
  try {
    formatTimelineDateRange(startDate, endDate);
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    throw reviewMappingError(requestedRecordId, "end_time", error.message, error);
  }

  return {
    recordId: detail.id,
    title: detail.title,
    startDate,
    endDate,
    location: detail.location,
    content: detail.content,
    photos: mapReviewPhotos(detail.content_photo_list, detail.id),
  };
}
