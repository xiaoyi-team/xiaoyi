import { apiRequest, ApiError, getAccessToken } from "../api/client";
import type {
  AnnouncementPopupStatusResponse,
  AnnouncementsResponse,
  RecordAnnouncementReadResponse,
} from "../features/home/types";

export function getHomeAnnouncements(): Promise<AnnouncementsResponse> {
  return apiRequest("/v1/announcements/active", { auth: false, responseType: "json" });
}

export function getAnnouncementPopupStatus(): Promise<AnnouncementPopupStatusResponse> {
  if (!getAccessToken()) {
    return Promise.resolve({ should_popup: true, check_date: "" });
  }
  return apiRequest("/v1/announcements/popup-status", { cache: "no-store", responseType: "json" });
}

export function recordAnnouncementRead(announcementId: number): Promise<RecordAnnouncementReadResponse> {
  if (!getAccessToken()) throw new ApiError("请登录后同步公告阅读记录。", 401);
  return apiRequest("/v1/announcements/read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ announcement_id: announcementId }),
    responseType: "json",
  });
}
