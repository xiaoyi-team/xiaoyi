import { useHomeAnnouncements } from "../hooks/useHomeAnnouncements";

function AnnouncementBar() {
  const { data, isLoading, isError } = useHomeAnnouncements();
  const announcements = data?.announcements ?? [];

  if (!isLoading && !isError && announcements.length === 0) {
    return null;
  }

  return (
    <section
      aria-busy={isLoading}
      aria-label="首页公告"
      aria-live="polite"
      className="absolute inset-x-4 top-4 z-20 mx-auto max-w-3xl rounded-md bg-black/65 px-4 py-2 text-sm text-white shadow-md backdrop-blur-sm"
    >
      {isLoading ? (
        <p className="text-center">公告加载中…</p>
      ) : isError ? (
        <p className="text-center">公告暂时无法加载</p>
      ) : (
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
          {announcements.map((announcement) => (
            <li key={announcement.id}>
              <span className="font-medium">{announcement.title}：</span>
              <span>{announcement.content}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default AnnouncementBar;
