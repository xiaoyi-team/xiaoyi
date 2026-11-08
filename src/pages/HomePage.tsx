import { useRef, useState } from "react";
import AnnouncementBar from "../features/home/components/AnnouncementBar";
import AnnouncementPopup from "../features/home/components/AnnouncementPopup";
import HomeMap from "../features/home/components/HomeMap";
import { useAnnouncementPopupStatus } from "../features/home/hooks/useAnnouncementPopupStatus";
import { useHomeAnnouncements } from "../features/home/hooks/useHomeAnnouncements";
import { useRecordAnnouncementRead } from "../features/home/hooks/useRecordAnnouncementRead";

const dismissedAnnouncementsStorageKey = "xiaoyi:home:announcements:dismissed-ids:v1";

function readDismissedAnnouncementIds(): number[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(dismissedAnnouncementsStorageKey) ?? "[]");
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((id): id is number =>
      typeof id === "number" && Number.isSafeInteger(id) && id > 0,
    ))];
  } catch {
    return [];
  }
}

function HomePage() {
  const previousHomeFocusRef = useRef<HTMLElement | null>(null);
  const homeContentRef = useRef<HTMLDivElement>(null);
  const [dismissedAnnouncementIds, setDismissedAnnouncementIds] = useState(readDismissedAnnouncementIds);
  const [acknowledgedAnnouncementId, setAcknowledgedAnnouncementId] = useState<number | null>(null);
  const { popupCandidate } = useHomeAnnouncements();
  const popupStatusQuery = useAnnouncementPopupStatus({
    enabled: popupCandidate !== null,
  });
  const readAnnouncementMutation = useRecordAnnouncementRead();

  const shouldShowPopup =
    popupCandidate !== null &&
    popupStatusQuery.isSuccess &&
    popupStatusQuery.data.should_popup === true &&
    !dismissedAnnouncementIds.includes(popupCandidate.id) &&
    popupCandidate.id !== acknowledgedAnnouncementId;

  function handleAnnouncementDismiss() {
    if (popupCandidate === null || readAnnouncementMutation.isPending) return;
    const ids = [...new Set([
      ...readDismissedAnnouncementIds(), ...dismissedAnnouncementIds, popupCandidate.id,
    ])];
    try {
      localStorage.setItem(dismissedAnnouncementsStorageKey, JSON.stringify(ids));
    } catch {
      // Storage restrictions must not prevent closing in the current page.
    }
    setDismissedAnnouncementIds(ids);
  }

  function handleAnnouncementRead() {
    if (popupCandidate === null || readAnnouncementMutation.isPending) {
      return;
    }

    const announcementId = popupCandidate.id;
    readAnnouncementMutation.mutate(announcementId, {
      onSuccess: () => setAcknowledgedAnnouncementId(announcementId),
    });
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-black px-4 py-4 text-white md:py-6">
      <div
        ref={homeContentRef}
        inert={shouldShowPopup}
        onFocusCapture={(event) => {
          if (event.target instanceof HTMLElement) {
            previousHomeFocusRef.current = event.target;
          }
        }}
        className="flex w-full flex-col items-center gap-4 md:gap-6"
      >
        <h1 className="sr-only">萧与逸之恋首页</h1>
        <AnnouncementBar />
        <HomeMap />
      </div>
      {shouldShowPopup ? (
        <AnnouncementPopup
          announcement={popupCandidate}
          isReadError={readAnnouncementMutation.isError}
          isReadPending={readAnnouncementMutation.isPending}
          onRead={handleAnnouncementRead}
          onDismiss={handleAnnouncementDismiss}
          returnFocusRef={previousHomeFocusRef}
          fallbackFocusRef={homeContentRef}
        />
      ) : null}
    </main>
  );
}

export default HomePage;
