export type Announcement = {
  id: number;
  title: string;
  content: string;
  version: number;
  is_popup: boolean;
  effective_date: string;
  created_at: string;
  updated_at: string;
};

export type AnnouncementsResponse = {
  announcements: Announcement[];
};

export type AnnouncementPopupStatusResponse = {
  should_popup: boolean;
  announcement_id: number | null;
  version: number | null;
};

export type ReadAnnouncementRequest = { announcement_id: number; version: number };

export type RecordAnnouncementReadResponse = {
  success: boolean;
  announcement_id: number;
  version: number;
  read_at: string;
};
