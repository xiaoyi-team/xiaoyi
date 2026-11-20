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
  scope: string;
  candidateVersion: string;
};

export function useAnnouncementPopupStatus({
  enabled,
  scope,
  candidateVersion,
}: UseAnnouncementPopupStatusOptions) {
  return useQuery<AnnouncementPopupStatusResponse>({
    queryKey: [...announcementPopupStatusQueryKey, scope, candidateVersion],
    queryFn: getAnnouncementPopupStatus,
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
    retry: false,
  });
}
