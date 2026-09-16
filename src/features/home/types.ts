export type Announcement = {
  id: number;
  title: string;
  content: string;
  is_popup: boolean;
  effective_date: string;
  created_at: string;
};

export type AnnouncementsResponse = {
  announcements: Announcement[];
};

export type AnnouncementPopupStatusResponse = {
  should_popup: boolean;
  check_date: string;
};

export type RecordAnnouncementReadResponse = {
  success: boolean;
  announcement_id: number;
  read_date: string;
};
