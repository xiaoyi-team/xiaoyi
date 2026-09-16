import type {
  AnnouncementPopupStatusResponse,
  AnnouncementsResponse,
  RecordAnnouncementReadResponse,
} from "../features/home/types";

const activeAnnouncementsPath = "/api/v1/announcements/active";
const announcementPopupStatusPath = "/api/v1/announcements/popup-status";
const announcementReadPath = "/api/v1/announcements/read";
const temporaryAnnouncementUserId = "10001";

function getApiBaseUrl(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (!baseUrl) {
    throw new Error("VITE_API_BASE_URL is not configured.");
  }

  return baseUrl.replace(/\/+$/, "");
}

export async function getHomeAnnouncements(): Promise<AnnouncementsResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}${activeAnnouncementsPath}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch active announcements (HTTP ${response.status}).`,
    );
  }

  return (await response.json()) as AnnouncementsResponse;
}

export async function getAnnouncementPopupStatus(): Promise<AnnouncementPopupStatusResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}${announcementPopupStatusPath}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-User-Id": temporaryAnnouncementUserId,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch announcement popup status (HTTP ${response.status}).`,
    );
  }

  return (await response.json()) as AnnouncementPopupStatusResponse;
}

export async function recordAnnouncementRead(
  announcementId: number,
): Promise<RecordAnnouncementReadResponse> {
  const response = await fetch(`${getApiBaseUrl()}${announcementReadPath}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-User-Id": temporaryAnnouncementUserId,
    },
    body: JSON.stringify({ announcement_id: announcementId }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to record announcement read (HTTP ${response.status}).`,
    );
  }

  return (await response.json()) as RecordAnnouncementReadResponse;
}
