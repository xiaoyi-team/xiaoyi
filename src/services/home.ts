import { apiRequest, ApiError, getAccessToken } from "../api/client";
import type {
  AnnouncementPopupStatusResponse,
  AnnouncementsResponse,
  RecordAnnouncementReadResponse,
  ReadAnnouncementRequest,
} from "../features/home/types";

export async function getHomeAnnouncements(): Promise<AnnouncementsResponse> {
  const result = await apiRequest<AnnouncementsResponse>("/v1/announcements/active", { auth: false, cache: "no-store", responseType: "json" });
  if (!Array.isArray(result?.announcements) || result.announcements.some(item => !item || !validVersion(item.id) || !validVersion(item.version))) {
    throw new ApiError("公告数据缺少有效的公告 ID 或版本号。", 502);
  }
  return result;
}

function validVersion(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

export async function getAnnouncementPopupStatus(): Promise<AnnouncementPopupStatusResponse> {
  if (!getAccessToken()) throw new ApiError("请登录后同步公告状态。", 401);
  const result = await apiRequest<AnnouncementPopupStatusResponse>("/v1/announcements/popup-status", { cache: "no-store", responseType: "json" });
  if (typeof result?.should_popup !== "boolean" ||
      !(result.announcement_id === null && result.version === null && !result.should_popup || validVersion(result.announcement_id) && validVersion(result.version))) {
    throw new ApiError("公告弹窗状态缺少对应的公告 ID 或版本号。", 502);
  }
  return result;
}

export async function recordAnnouncementRead(request: ReadAnnouncementRequest): Promise<RecordAnnouncementReadResponse> {
  if (!getAccessToken()) throw new ApiError("请登录后同步公告阅读记录。", 401);
  if (!validVersion(request.announcement_id) || !validVersion(request.version)) throw new ApiError("公告 ID 或版本号无效，请刷新后重试。", 422);
  const result = await apiRequest<RecordAnnouncementReadResponse>("/v1/announcements/read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    responseType: "json",
  });
  if (result?.success !== true || result.announcement_id !== request.announcement_id || result.version !== request.version) {
    throw new ApiError("公告已读确认结果与提交的版本不一致，请重试。", 502);
  }
  return result;
}
