import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AnnouncementBar from "../features/home/components/AnnouncementBar";
import AnnouncementPopup from "../features/home/components/AnnouncementPopup";
import HomeMap from "../features/home/components/HomeMap";
import { useRecordAnnouncementRead } from "../features/home/hooks/useRecordAnnouncementRead";
import type { Announcement } from "../features/home/types";
import { getAccessToken } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useHomeAnnouncements } from "../features/home/hooks/useHomeAnnouncements";
import { useAnnouncementPopupStatus } from "../features/home/hooks/useAnnouncementPopupStatus";
import { announcementSeenKey, announcementVersion, latestPopupAnnouncement, readAnnouncementVersions } from "../features/home/announcementVersions";
import "../features/home/home-page.css";
import "../fonts/noto-serif-sc.css";
import "../fonts/cormorant-garamond.css";

function HomePage() {
  const [viewport, setViewport] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  const mobile = viewport.width < 1024;
  const width = mobile ? 667 : 1920;
  const height = mobile ? 375 : 1080;
  const scale = Math.min(viewport.width / width, viewport.height / height);
  const [detailAnnouncement, setDetailAnnouncement] = useState<Announcement | null>(null);
  useLayoutEffect(() => {
    const resize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  const previousHomeFocusRef = useRef<HTMLElement | null>(null);
  const homeContentRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const mismatchRef = useRef<string | null>(null);
  const confirmingRef = useRef(false);
  const readAnnouncementMutation = useRecordAnnouncementRead();
  const { user, initializing, isAuthenticated } = useAuth();
  const scope = isAuthenticated ? String(typeof user === "object" && user ? user.user_id ?? user.uid ?? user.username ?? "member" : user ?? "member") : "guest";
  const storedVersions = useMemo(() => readAnnouncementVersions(scope), [scope]);
  const [seen, setSeen] = useState<{ scope: string; versions: Record<string, string> }>({ scope, versions: storedVersions });
  const seenVersions = seen.scope === scope ? seen.versions : storedVersions;
  const announcements = useHomeAnnouncements();
  const { data } = announcements;
  const candidate = latestPopupAnnouncement(data?.announcements ?? []);
  const popupStatus = useAnnouncementPopupStatus({
    enabled: !initializing && isAuthenticated && announcements.isSuccess,
    scope,
    candidateVersion: candidate ? `${candidate.id}:${candidate.version}` : "none",
  });
  const status = popupStatus.isFetchedAfterMount && popupStatus.isSuccess ? popupStatus.data : null;
  const serverCandidate = data?.announcements.find(item => item.is_popup && item.id === status?.announcement_id && item.version === status.version) ?? null;
  const mismatch = !initializing && isAuthenticated && status?.should_popup && !serverCandidate
    ? `${scope}:${status.announcement_id}:${status.version}` : null;
  useEffect(() => {
    if (!mismatch) { mismatchRef.current = null; return; }
    if (mismatchRef.current === mismatch) return;
    mismatchRef.current = mismatch;
    // List and status may straddle an operator update. Never show or confirm a
    // different version from the one identified by the status response.
    void queryClient.invalidateQueries({ queryKey: ["home", "announcements"] });
  }, [mismatch, queryClient]);
  const automaticAnnouncement = initializing ? null : isAuthenticated
    ? (status?.should_popup ? serverCandidate : null)
    : (candidate && seenVersions[candidate.id] !== announcementVersion(candidate) ? candidate : null);
  const visibleAnnouncement = detailAnnouncement
    ? data?.announcements.find(item => item.id === detailAnnouncement.id) ?? detailAnnouncement
    : automaticAnnouncement;

  function rememberAnnouncement(announcement: Announcement) {
    const versions = { ...readAnnouncementVersions(scope), ...seenVersions, [announcement.id]: announcementVersion(announcement) };
    try { localStorage.setItem(announcementSeenKey(scope), JSON.stringify(versions)); }
    catch { /* A restricted browser still remembers confirmation until this page closes. */ }
    setSeen({ scope, versions });
  }

  function handleAnnouncementDismiss() {
    handleAnnouncementRead();
  }

  function handleAnnouncementRead() {
    if (visibleAnnouncement === null || readAnnouncementMutation.isPending || confirmingRef.current) {
      return;
    }

    const announcement = visibleAnnouncement;
    const authorization = getAccessToken();
    if (!authorization) {
      rememberAnnouncement(announcement);
      setDetailAnnouncement(null);
      return;
    }
    confirmingRef.current = true;
    readAnnouncementMutation.mutate({ announcement_id: announcement.id, version: announcement.version }, {
      onSuccess: () => {
        if (getAccessToken() !== authorization) return;
        setDetailAnnouncement(null);
      },
      onSettled: () => { confirmingRef.current = false; },
    });
  }

  return (
    <main className="home-page">
      <div className="home-page__window" style={{ width: width * scale, height: height * scale }}>
      <div className="home-page__scene" data-mobile={mobile} style={{
        width, height, transform: `scale(${scale})`,
      }}>
      <div
        ref={homeContentRef}
        inert={visibleAnnouncement !== null}
        onFocusCapture={(event) => {
          if (event.target instanceof HTMLElement) {
            previousHomeFocusRef.current = event.target;
          }
        }}
        className="home-page__content"
      >
        <h1 className="sr-only">萧与逸之恋首页</h1>
        <div className="home-page__announcements">
          <AnnouncementBar onOpenAnnouncement={setDetailAnnouncement} />
        </div>
        <HomeMap mobile={mobile} />
      </div>
      {visibleAnnouncement ? (
        <AnnouncementPopup
          announcement={visibleAnnouncement}
          isReadError={readAnnouncementMutation.isError}
          isReadPending={readAnnouncementMutation.isPending}
          onRead={handleAnnouncementRead}
          onDismiss={handleAnnouncementDismiss}
          returnFocusRef={previousHomeFocusRef}
          fallbackFocusRef={homeContentRef}
        />
      ) : null}
      </div>
      </div>
    </main>
  );
}

export default HomePage;
