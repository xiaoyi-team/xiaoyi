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
