import { useRef } from "react";
import AnnouncementBar from "../features/home/components/AnnouncementBar";
import AnnouncementPopup from "../features/home/components/AnnouncementPopup";
import HomeMap from "../features/home/components/HomeMap";
import { useAnnouncementPopupStatus } from "../features/home/hooks/useAnnouncementPopupStatus";
import { useHomeAnnouncements } from "../features/home/hooks/useHomeAnnouncements";
import { useRecordAnnouncementRead } from "../features/home/hooks/useRecordAnnouncementRead";

function HomePage() {
  const previousHomeFocusRef = useRef<HTMLElement | null>(null);
  const { popupCandidate } = useHomeAnnouncements();
  const popupStatusQuery = useAnnouncementPopupStatus({
    enabled: popupCandidate !== null,
  });
  const readAnnouncementMutation = useRecordAnnouncementRead();

  const shouldShowPopup =
    popupCandidate !== null &&
    popupStatusQuery.isSuccess &&
    popupStatusQuery.data.should_popup === true;

  function handleAnnouncementRead() {
    if (popupCandidate === null || readAnnouncementMutation.isPending) {
      return;
    }

    readAnnouncementMutation.mutate(popupCandidate.id);
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-black px-4 py-4 text-white md:py-6">
      <div
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
          returnFocusRef={previousHomeFocusRef}
        />
      ) : null}
    </main>
  );
}

export default HomePage;
