import type { AnnouncementsResponse } from "../features/home/types";

const activeAnnouncementsPath = "/api/v1/announcements/active";

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
