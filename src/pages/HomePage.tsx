import { useLayoutEffect, useMemo, useRef, useState } from "react";
import AnnouncementBar from "../features/home/components/AnnouncementBar";
import AnnouncementPopup from "../features/home/components/AnnouncementPopup";
import HomeMap from "../features/home/components/HomeMap";
import { useRecordAnnouncementRead } from "../features/home/hooks/useRecordAnnouncementRead";
import type { Announcement } from "../features/home/types";
import { getAccessToken } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useHomeAnnouncements } from "../features/home/hooks/useHomeAnnouncements";
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
  const readAnnouncementMutation = useRecordAnnouncementRead();
  const { user, initializing, isAuthenticated } = useAuth();
  const scope = isAuthenticated ? String(typeof user === "object" && user ? user.user_id ?? user.uid ?? user.username ?? "member" : user ?? "member") : "guest";
  const storedVersions = useMemo(() => readAnnouncementVersions(scope), [scope]);
  const [seen, setSeen] = useState<{ scope: string; versions: Record<string, string> }>({ scope, versions: storedVersions });
  const seenVersions = seen.scope === scope ? seen.versions : storedVersions;
  const { data } = useHomeAnnouncements();
  const candidate = latestPopupAnnouncement(data?.announcements ?? []);
  const automaticAnnouncement = !initializing && candidate && seenVersions[candidate.id] !== announcementVersion(candidate) ? candidate : null;
  const visibleAnnouncement = detailAnnouncement ?? automaticAnnouncement;

  function rememberAnnouncement(announcement: Announcement) {
    const versions = { ...readAnnouncementVersions(scope), ...seenVersions, [announcement.id]: announcementVersion(announcement) };
    try { localStorage.setItem(announcementSeenKey(scope), JSON.stringify(versions)); }
    catch { /* A restricted browser still remembers confirmation until this page closes. */ }
    setSeen({ scope, versions });
  }

  function handleAnnouncementDismiss() {
    if (readAnnouncementMutation.isPending) return;
    if (visibleAnnouncement) rememberAnnouncement(visibleAnnouncement);
    setDetailAnnouncement(null);
  }

  function handleAnnouncementRead() {
    if (visibleAnnouncement === null || readAnnouncementMutation.isPending) {
      return;
    }

    const announcementId = visibleAnnouncement.id;
    if (!getAccessToken()) {
      rememberAnnouncement(visibleAnnouncement);
      setDetailAnnouncement(null);
      return;
    }
    readAnnouncementMutation.mutate(announcementId, {
      onSuccess: () => {
        rememberAnnouncement(visibleAnnouncement);
        setDetailAnnouncement(null);
      },
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
