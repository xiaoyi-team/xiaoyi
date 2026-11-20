import type { Announcement } from "./types";

export function announcementVersion(announcement: Announcement): string {
  return String(announcement.version);
}

export function announcementSeenKey(scope: string) {
  return `xiaoyi:home:announcements:seen-versions:v2:${scope}`;
}

export function readAnnouncementVersions(scope: string): Record<string, string> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(announcementSeenKey(scope)) ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([, version]) => typeof version === "string"));
  } catch { return {}; }
}

export function latestPopupAnnouncement(announcements: Announcement[]): Announcement | null {
  // The backend returns the authoritative order by latest update.
  return announcements.find(item => item.is_popup) ?? null;
}
