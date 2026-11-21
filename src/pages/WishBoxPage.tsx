import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useWishBoxViewport } from "../features/wishBox/hooks/useWishBoxViewport";
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
import { isRecoverableWishBoxError } from "../features/wishBox/hooks/requestPolicy";
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
  const viewportRef = useWishBoxViewport();
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
  const announcementFocusFrameRef = useRef<number | null>(null);
  const announcementOpenRef = useRef(announcementOpen);
  const currentViewRef = useRef(currentView);
  const wishlandButtonRef = useRef<HTMLButtonElement>(null);
  const restoreWishlandFocusRef = useRef(false);
  const globalNoticeQuery = useGlobalNotice(currentView === "home");
  const announcementResult = useMemo(() => {
    if (globalNoticeQuery.isError && !isRecoverableWishBoxError(globalNoticeQuery.error)) return { status: "error" as const, data: null };
    if (globalNoticeQuery.isError && globalNoticeQuery.data === undefined) return { status: "error" as const, data: null };
    if (globalNoticeQuery.data === undefined) return { status: "loading" as const, data: null };
    try {
      return { status: "ready" as const, data: mapGlobalNoticeToAnnouncement(globalNoticeQuery.data) };
    } catch {
      return { status: "error" as const, data: null };
    }
  }, [globalNoticeQuery.data, globalNoticeQuery.isError, globalNoticeQuery.error]);

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

  useLayoutEffect(() => {
    announcementOpenRef.current = announcementOpen;
    currentViewRef.current = currentView;
  }, [announcementOpen, currentView]);

  useEffect(() => () => {
    if (announcementFocusFrameRef.current !== null) {
      cancelAnimationFrame(announcementFocusFrameRef.current);
    }
  }, []);

  useEffect(() => {
    const restoreKeyboardFocusStyle = (event: KeyboardEvent) => {
      if (["Tab", "Enter", " ", "Escape", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
        viewportRef.current?.removeAttribute("data-wish-box-pointer-focus");
      }
    };
    window.addEventListener("keydown", restoreKeyboardFocusStyle, true);
    return () => window.removeEventListener("keydown", restoreKeyboardFocusStyle, true);
  }, [viewportRef]);

  function openAnnouncement() {
    if (announcementFocusFrameRef.current !== null) {
      cancelAnimationFrame(announcementFocusFrameRef.current);
      announcementFocusFrameRef.current = null;
    }
    announcementOpenRef.current = true;
    setAnnouncementOpen(true);
  }

  function closeAnnouncement() {
    announcementOpenRef.current = false;
    setAnnouncementOpen(false);
    if (announcementFocusFrameRef.current !== null) cancelAnimationFrame(announcementFocusFrameRef.current);
    announcementFocusFrameRef.current = requestAnimationFrame(() => {
      announcementFocusFrameRef.current = null;
      const target = announcementButtonRef.current;
      const active = document.activeElement;
      if (currentViewRef.current !== "home" || announcementOpenRef.current || !target?.isConnected ||
        target.getClientRects().length === 0 || target.closest("[inert], [aria-hidden='true']") ||
        (active && active !== document.body && active !== target && active instanceof HTMLElement && active.isConnected)) return;
      target.focus({ preventScroll: true });
    });
  }

  function returnToHome() {
    setTimelineScrollIntent(null);
    timelineScrollSnapshotRef.current = null;
    restoreWishlandFocusRef.current = true;
    setCurrentView("home");
  }

  function openTimeline() {
    timelineScrollSnapshotRef.current = null;
    createLatestTimelineIntent(timelineFilterKey);
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
    <main
      ref={viewportRef}
      data-wish-box-focus-scope
      className="relative grid h-dvh w-full place-items-center overflow-hidden bg-black"
      onPointerDownCapture={() => { viewportRef.current?.setAttribute("data-wish-box-pointer-focus", ""); }}
    >
      {currentView === "home" ? (
        <WishBoxHome
          announcement={announcementResult.data}
          announcementStatus={announcementResult.status}
          onOpenAnnouncement={openAnnouncement}
          announcementButtonRef={announcementButtonRef}
          onOpenTimeline={openTimeline}
          wishlandButtonRef={wishlandButtonRef}
          inactive={announcementOpen}
        />
      ) : null}
      <section
        aria-label="心愿盒场景"
        data-wish-box-view={currentView}
        className={`wish-box-scene relative w-full overflow-hidden ${currentView === "home" ? "z-10" : "bg-white"}`}
        hidden={currentView === "home" && !announcementOpen}
        style={{
          aspectRatio: "var(--wish-box-scene-aspect-ratio, 16 / 9)",
          maxWidth: "var(--wish-box-scene-max-width, 177.7778dvh)",
          containerType: "inline-size",
        }}
      >
        {currentView === "home" ? (
          announcementOpen ? (
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
                  onRetryAnnouncement={() => globalNoticeQuery.refetch()}
                  onClose={closeAnnouncement}
                />
              </div>
            </div>
          ) : null
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
