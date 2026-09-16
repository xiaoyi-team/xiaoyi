import { useQuery } from "@tanstack/react-query";

import { getAnnouncementPopupStatus } from "../../../services/home";
import type { AnnouncementPopupStatusResponse } from "../types";

export const announcementPopupStatusQueryKey = [
  "home",
  "announcements",
  "popup-status",
] as const;

type UseAnnouncementPopupStatusOptions = {
  enabled: boolean;
};

export function useAnnouncementPopupStatus({
  enabled,
}: UseAnnouncementPopupStatusOptions) {
  return useQuery<AnnouncementPopupStatusResponse>({
    queryKey: announcementPopupStatusQueryKey,
    queryFn: getAnnouncementPopupStatus,
    enabled,
  });
}
