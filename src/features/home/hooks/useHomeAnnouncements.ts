import { useQuery } from "@tanstack/react-query";

import { getHomeAnnouncements } from "../../../services/home";
import type { AnnouncementsResponse } from "../types";

export function useHomeAnnouncements() {
  const query = useQuery<AnnouncementsResponse>({
    queryKey: ["home", "announcements"],
    queryFn: getHomeAnnouncements,
  });

  const popupCandidate =
    query.data?.announcements.find((announcement) => announcement.is_popup === true) ??
    null;

  return { ...query, popupCandidate };
}
