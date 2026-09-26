import { useRef, useState } from "react";
import AnnouncementView, {
  type AnnouncementDisplayFixture,
} from "../features/wishBox/AnnouncementView";
import WishBoxHome from "../features/wishBox/WishBoxHome";

// UI-only fixture for Phase 1B layout and interaction; not a Backend contract.
const currentAnnouncement: AnnouncementDisplayFixture = {
  title: "光夜五周年&音乐会 · 限定应援",
  subtitle: "Happy 5th Anniversary",
  eyebrow: "✦  SPECIAL EVENT NOTICE  ✦",
  summary: "传说有个漂亮哥哥站在花的后面，英俊得要命，需要一支鸢尾才能一睹真容。\n7月4日和7月5日，静安区协信星光广场将出现漂亮哥哥送的花和饮品，\n在鸢尾花香中开启无限幸福的第六年吧。",
  gifts: [
    "1. 一支鸢尾花",
    "2. 瑞幸咖啡 /\n    轻乳茶饮品二选一",
    "3. 定制杯贴",
  ],
  giftCaption: "GIFT LIST  ·  Little Gifts, Big Love",
  location: "上海市静安区江场路1228号\n协信星光广场北里瑞幸咖啡",
  time: "2026年7月4日    13:30–16:30\n2026年7月5日    13:30–16:30",
  requirements: "1  游戏内萧逸好感度第一（不含并列）且 ≥111\n2  游戏内萧逸图鉴收集度第一（不含并列）且 ≥50%\n3  携带任意一件萧逸官谷\n4  拍摄鸢尾花发布微博 / 小红书 / 抖音等任一平台，\n   并在内容里 @萧逸生日心愿盒｜生贺组。",
  requirementsExtra: "发布内容为：萧逸五周年快乐，永远自由浪漫 💙💙 #萧逸#",
  notes: "1  每日数量99份，发完即止。\n2  活动两日期间每人限领一份物料，不得重复领取，不得代领。\n3  本次活动非IP授权联动，店内无相关美陈，请有序领取物料，领取后及时离店。",
  footerDescription: "更多详细内容请见公告，禁止一切有偿行为。",
  footerTags: ["#萧逸", "#光与夜之恋萧逸", "#光与夜之恋", "#萧与逸之恋", "#光夜音乐会"],
  footerEnglishCaption: "A MORE BEAUTIFUL WORLD                 IN FULL BLOOM",
};

function WishBoxPage() {
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const announcementButtonRef = useRef<HTMLButtonElement>(null);

  function closeAnnouncement() {
    setAnnouncementOpen(false);
    requestAnimationFrame(() => announcementButtonRef.current?.focus());
  }

  return (
    <main className="grid h-dvh w-full place-items-center overflow-hidden bg-slate-100">
      <section
        aria-label="心愿盒场景"
        className="relative w-full overflow-hidden bg-white"
        style={{
          aspectRatio: "16 / 9",
          maxWidth: "177.7778dvh",
          containerType: "inline-size",
        }}
      >
        <WishBoxHome
          announcement={currentAnnouncement}
          onOpenAnnouncement={() => setAnnouncementOpen(true)}
          announcementButtonRef={announcementButtonRef}
          inactive={announcementOpen}
        />
        {announcementOpen ? (
          <AnnouncementView
            announcement={currentAnnouncement}
            onClose={closeAnnouncement}
          />
        ) : null}
      </section>
    </main>
  );
}

export default WishBoxPage;
