import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AnnouncementView from "../features/wishBox/AnnouncementView";
import WishBoxActivityReview, {
  type ActivityReviewPhotoSelection,
  type ActivityReviewSelection,
} from "../features/wishBox/WishBoxActivityReview";
import WishBoxHome from "../features/wishBox/WishBoxHome";
import WishBoxTimeline, {
  type TimelineFilters,
  type TimelineScrollIntent,
  type TimelineScrollSnapshot,
} from "../features/wishBox/WishBoxTimeline";
import { useGlobalNotice } from "../features/wishBox/hooks/useGlobalNotice";
import { mapGlobalNoticeToAnnouncement } from "../features/wishBox/announcementData";
import "../features/wishBox/WishBoxMobile.css";

type WishBoxView = "home" | "timeline" | "activityReviewPreview" | "photoViewerPreview";

const DEFAULT_TIMELINE_FILTERS: TimelineFilters = {
  year: "全部",
  kind: "全部种类",
  form: "全部",
};

const getTimelineFilterKey = ({ year, kind, form }: TimelineFilters) =>
  JSON.stringify([year, kind, form]);

function isSamePhotoSelection(
  current: ActivityReviewPhotoSelection | null,
  expected: ActivityReviewPhotoSelection,
) {
  if (current?.source === "record" && expected.source === "record") {
    return current.recordId === expected.recordId && current.imgKey === expected.imgKey;
  }
  return current?.source === "preview" && expected.source === "preview" &&
    current.fixtureId === expected.fixtureId;
}

// DEV / TEMPORARY PREVIEW: open /wish-box?activityReviewPreview=1 for local visual calibration.
const activityReviewPreviewRequested =
  import.meta.env.DEV &&
  new URLSearchParams(window.location.search).get("activityReviewPreview") === "1";
const photoViewerPreviewRequested =
  import.meta.env.DEV &&
  new URLSearchParams(window.location.search).get("photoViewerPreview") === "1";

function WishBoxPage() {
  const [currentView, setCurrentView] = useState<WishBoxView>(() => {
    if (photoViewerPreviewRequested) return "photoViewerPreview";
    if (activityReviewPreviewRequested) return "activityReviewPreview";
    return "home";
  });
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityReviewSelection | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<ActivityReviewPhotoSelection | null>(() =>
    photoViewerPreviewRequested
      ? { source: "preview", fixtureId: "photo-viewer-dev-preview" }
      : null,
  );
  const [timelineFilters, setTimelineFilters] = useState<TimelineFilters>(DEFAULT_TIMELINE_FILTERS);
  const [timelineScrollIntent, setTimelineScrollIntent] = useState<TimelineScrollIntent | null>(null);
  const timelineScrollSnapshotRef = useRef<TimelineScrollSnapshot | null>(null);
  const timelineScrollIntentIdRef = useRef(0);
  const timelineFilterKey = getTimelineFilterKey(timelineFilters);
  const announcementButtonRef = useRef<HTMLButtonElement>(null);
  const wishlandButtonRef = useRef<HTMLButtonElement>(null);
  const restoreWishlandFocusRef = useRef(false);
  const globalNoticeQuery = useGlobalNotice(currentView === "home");
  const announcementResult = useMemo(() => {
    if (globalNoticeQuery.isError) return { status: "error" as const, data: null };
    if (globalNoticeQuery.data === undefined) return { status: "loading" as const, data: null };
    try {
      return { status: "ready" as const, data: mapGlobalNoticeToAnnouncement(globalNoticeQuery.data) };
    } catch {
      return { status: "error" as const, data: null };
    }
  }, [globalNoticeQuery.data, globalNoticeQuery.isError]);

  const saveTimelineScrollSnapshot = useCallback((snapshot: TimelineScrollSnapshot) => {
    if (snapshot.filterKey !== timelineFilterKey || !Number.isFinite(snapshot.scrollLeft)) return;
    timelineScrollSnapshotRef.current = { ...snapshot, scrollLeft: Math.max(0, snapshot.scrollLeft) };
  }, [timelineFilterKey]);

  const settleTimelineScrollIntent = useCallback((id: number) => {
    setTimelineScrollIntent((current) => current?.id === id ? null : current);
  }, []);

  useEffect(() => {
    if (currentView === "home" && restoreWishlandFocusRef.current) {
      wishlandButtonRef.current?.focus();
      restoreWishlandFocusRef.current = false;
    }
  }, [currentView]);

  function closeAnnouncement() {
    setAnnouncementOpen(false);
    requestAnimationFrame(() => announcementButtonRef.current?.focus());
  }

  function returnToHome() {
    setTimelineScrollIntent(null);
    timelineScrollSnapshotRef.current = null;
    restoreWishlandFocusRef.current = true;
    setCurrentView("home");
  }

  function openTimeline() {
    timelineScrollSnapshotRef.current = null;
    setTimelineFilters(DEFAULT_TIMELINE_FILTERS);
    createLatestTimelineIntent(getTimelineFilterKey(DEFAULT_TIMELINE_FILTERS));
    setCurrentView("timeline");
  }

  function updateTimelineFilters(updates: Partial<TimelineFilters>) {
    const nextFilters = { ...timelineFilters, ...updates };
    const nextFilterKey = getTimelineFilterKey(nextFilters);
    if (nextFilterKey === timelineFilterKey) return;

    timelineScrollSnapshotRef.current = null;
    setTimelineFilters(nextFilters);
    createLatestTimelineIntent(nextFilterKey);
  }

  function createLatestTimelineIntent(filterKey: string) {
    setTimelineScrollIntent({
      id: ++timelineScrollIntentIdRef.current,
      kind: "latest",
      filterKey,
    });
  }

  function openActivity(
    activity: ActivityReviewSelection,
    snapshot: TimelineScrollSnapshot,
  ) {
    if (snapshot.filterKey !== timelineFilterKey || !Number.isFinite(snapshot.scrollLeft)) return;
    saveTimelineScrollSnapshot(snapshot);
    setTimelineScrollIntent(null);
    setSelectedActivity(activity);
    setSelectedPhoto(null);
  }

  function openPhoto(photo: ActivityReviewPhotoSelection) {
    if (photo.source === "record") {
      if (currentView !== "timeline" || selectedActivity?.recordId !== photo.recordId) return;
    } else if (!import.meta.env.DEV || (
      currentView !== "activityReviewPreview" && currentView !== "photoViewerPreview"
    )) return;
    setSelectedPhoto(photo);
  }

  const closePhotoViewer = useCallback((expected: ActivityReviewPhotoSelection) => {
    setSelectedPhoto((current) => isSamePhotoSelection(current, expected) ? null : current);
    if (expected.source === "preview") {
      setCurrentView((current) => current === "photoViewerPreview" ? "activityReviewPreview" : current);
    }
  }, []);

  function returnToTimeline() {
    const snapshot = timelineScrollSnapshotRef.current;
    const id = ++timelineScrollIntentIdRef.current;
    setTimelineScrollIntent(snapshot?.filterKey === timelineFilterKey
      ? { id, kind: "restore", filterKey: timelineFilterKey, scrollLeft: snapshot.scrollLeft }
      : { id, kind: "latest", filterKey: timelineFilterKey });
    setSelectedActivity(null);
    setSelectedPhoto(null);
    setCurrentView("timeline");
  }

  return (
    <main className="grid h-dvh w-full place-items-center overflow-hidden bg-black">
      <section
        aria-label="心愿盒场景"
        data-wish-box-view={currentView}
        className="wish-box-scene relative w-full overflow-hidden bg-white"
        style={{
          aspectRatio: "var(--wish-box-scene-aspect-ratio, 16 / 9)",
          maxWidth: "var(--wish-box-scene-max-width, 177.7778dvh)",
          containerType: "inline-size",
        }}
      >
        {currentView === "home" ? (
          <>
            <WishBoxHome
              announcement={announcementResult.data}
              announcementStatus={announcementResult.status}
              onOpenAnnouncement={() => setAnnouncementOpen(true)}
              announcementButtonRef={announcementButtonRef}
              onOpenTimeline={openTimeline}
              wishlandButtonRef={wishlandButtonRef}
              inactive={announcementOpen}
            />
            {announcementOpen ? (
              <div className="absolute inset-0 z-10 grid place-items-center">
                <div
                  className="wish-box-announcement-legacy relative w-full overflow-hidden"
                  style={{
                    aspectRatio: "var(--wish-box-announcement-aspect-ratio, 16 / 9)",
                    maxWidth: "var(--wish-box-announcement-max-width, 177.7778dvh)",
                    containerType: "inline-size",
                  }}
                >
                  <AnnouncementView
                    announcement={announcementResult.data}
                    announcementStatus={announcementResult.status}
                    onRetryAnnouncement={() => { void globalNoticeQuery.refetch(); }}
                    onClose={closeAnnouncement}
                  />
                </div>
              </div>
            ) : null}
          </>
        ) : currentView === "timeline" ? (
          selectedActivity ? (
            <WishBoxActivityReview
              key={`record:${selectedActivity.recordId}`}
              source="record"
              recordId={selectedActivity.recordId}
              selectedPhoto={selectedPhoto}
              onOpenPhoto={openPhoto}
              onClosePhoto={closePhotoViewer}
              onBack={returnToTimeline}
            />
          ) : (
            <WishBoxTimeline
              scrollIntent={timelineScrollIntent}
              onScrollIntentSettled={settleTimelineScrollIntent}
              onScrollSnapshot={saveTimelineScrollSnapshot}
              filters={timelineFilters}
              onFiltersChange={updateTimelineFilters}
              onBack={returnToHome}
              onOpenActivity={openActivity}
            />
          )
        ) : (
          <WishBoxActivityReview
            key="preview"
            source="preview"
            selectedPhoto={selectedPhoto}
            onOpenPhoto={openPhoto}
            onClosePhoto={closePhotoViewer}
            onBack={returnToTimeline}
          />
        )}
      </section>
    </main>
  );
}

export default WishBoxPage;
