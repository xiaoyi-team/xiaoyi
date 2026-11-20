import { useMutation, useQueryClient } from "@tanstack/react-query";

import { recordAnnouncementRead } from "../../../services/home";
import { announcementPopupStatusQueryKey } from "./useAnnouncementPopupStatus";

export function useRecordAnnouncementRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordAnnouncementRead,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: announcementPopupStatusQueryKey,
        exact: true,
      }),
  });
}
