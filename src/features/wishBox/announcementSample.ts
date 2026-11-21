// Local UI data only; not a backend DTO.
export type AnnouncementBlockView = {
  id: string;
  title: string;
  content: string;
  variant: "blue" | "pink";
  fontSize: string | null;
  fontColor: string | null;
  fontWeight: "normal" | "bold" | null;
};
export type AnnouncementViewData = {
  title: string;
  location: string | null;
  time: string;
  layoutConfig: { leftRatio: number; rightRatio: number } | null;
  blocks: AnnouncementBlockView[];
};
export const announcementSample: AnnouncementViewData = {
  title: "活动公告", location: "上海市\n静安区江场路1228号\n协信星光广场北里瑞幸咖啡", time: "2026年7月4日 13:30–16:30\n2026年7月5日 13:30–16:30", layoutConfig: null,
  blocks: [
    { id: "intro", title: "活动简介", content: "为庆祝光夜五周年特别举办的线下音乐应援活动，\n现场将设置主题布置、限定打卡区及特别互动环节，\n诚邀各位设计师一同参与，共度纪念时刻。", variant: "blue", fontSize: null, fontColor: null, fontWeight: null },
    { id: "content", title: "现场内容", content: "主题布置与摊位展示\n限定周边领取\n互动打卡装置\n五周年纪念留影区", variant: "pink", fontSize: null, fontColor: null, fontWeight: null },
    { id: "join", title: "参与方式", content: "活动免费参与，无需提前报名，现场出示活动页面即可领取纪念物料一份（数量有限，先到先得）。", variant: "blue", fontSize: null, fontColor: null, fontWeight: null },
    { id: "notes", title: "注意事项", content: "请遵守现场秩序，配合工作人员指引。\n理性应援，禁止任何影响公共安全的行为。\n现场物料为限定发放，不支持邮寄或预留。", variant: "pink", fontSize: null, fontColor: null, fontWeight: null },
    { id: "long", title: "长文测试 · 本地样本", content: "此段为独立开发展示样本，用于检查中文换行及滚动末端可达性。\n".repeat(8), variant: "blue", fontSize: null, fontColor: null, fontWeight: null },
    { id: "english", title: "英文测试 · 本地样本", content: "AnnouncementCompatibility".repeat(20), variant: "pink", fontSize: null, fontColor: null, fontWeight: null },
  ],
};
