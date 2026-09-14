import { useQuery } from "@tanstack/react-query";

import { getHomeAnnouncements } from "../../../services/home";
import type { AnnouncementsResponse } from "../types";

export function useHomeAnnouncements() {
  return useQuery<AnnouncementsResponse>({
    queryKey: ["home", "announcements"],
    queryFn: getHomeAnnouncements,
  });
}
