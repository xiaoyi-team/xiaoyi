import type { Announcement } from "./types";

export function announcementVersion(announcement: Announcement): string {
  return JSON.stringify([
    announcement.id, announcement.title, announcement.content,
    announcement.effective_date, announcement.updated_at ?? announcement.created_at,
  ]);
}

export function announcementSeenKey(scope: string) {
  return `xiaoyi:home:announcements:seen-versions:v1:${scope}`;
}

export function readAnnouncementVersions(scope: string): Record<string, string> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(announcementSeenKey(scope)) ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([, version]) => typeof version === "string"));
  } catch { return {}; }
}

export function latestPopupAnnouncement(announcements: Announcement[]): Announcement | null {
  const timestamp = (item: Announcement) => Date.parse(item.updated_at || item.effective_date || item.created_at) || 0;
  return announcements.filter(item => item.is_popup).sort((a, b) => timestamp(b) - timestamp(a) || b.id - a.id)[0] ?? null;
}
