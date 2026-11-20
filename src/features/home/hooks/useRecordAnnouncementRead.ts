import { useMutation, useQueryClient } from "@tanstack/react-query";

import { recordAnnouncementRead } from "../../../services/home";
import { ApiError } from "../../../api/client";
import { announcementPopupStatusQueryKey } from "./useAnnouncementPopupStatus";

export function useRecordAnnouncementRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordAnnouncementRead,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: announcementPopupStatusQueryKey,
      }),
    onError: (error) => {
      if (error instanceof ApiError && (error.status === 409 || error.status === 404)) {
        void queryClient.invalidateQueries({ queryKey: ["home", "announcements"] });
      }
    },
  });
}
