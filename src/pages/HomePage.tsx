import AnnouncementBar from "../features/home/components/AnnouncementBar";
import AnnouncementPopup from "../features/home/components/AnnouncementPopup";
import HomeMap from "../features/home/components/HomeMap";
import { useAnnouncementPopupStatus } from "../features/home/hooks/useAnnouncementPopupStatus";
import { useHomeAnnouncements } from "../features/home/hooks/useHomeAnnouncements";
import { useRecordAnnouncementRead } from "../features/home/hooks/useRecordAnnouncementRead";

function HomePage() {
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
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black">
      <h1 className="sr-only">萧与逸之恋首页地图</h1>
      <AnnouncementBar />
      <HomeMap />
      {shouldShowPopup ? (
        <AnnouncementPopup
          announcement={popupCandidate}
          isReadError={readAnnouncementMutation.isError}
          isReadPending={readAnnouncementMutation.isPending}
          onRead={handleAnnouncementRead}
        />
      ) : null}
    </main>
  );
}

export default HomePage;
