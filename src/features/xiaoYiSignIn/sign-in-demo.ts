// Fixed Figma prototype fixtures, not real sign-in history or the system date.
export const DEMO_YEAR = 2026;
export const DEMO_MONTH = 9;
export const DEMO_TODAY = 24;
const todaySigned = false;

const signedQuotes: Record<number, string> = {
  7: "两个世界又有什么关系。",
  8: "未来还那么长，我们一定会再见的。",
  9: "我虽然一直往前走，心却留在了身后。",
  10: "有你在的地方，才是我的故乡，我永远的终点。",
  11: "赛车的终点是赛道的尽头，而我的终点是你的身边。",
  12: "就算世间纷纷扰扰，也挡不住我要在下一秒赶到你的面前。",
  13: "赏金猎人萧逸接受委托，不限时间，任凭差遣。",
  14: "我来找你是因为立刻就想见到你，这位新婚小姐，你今天很美，不知道我有没有这个荣幸为我的新娘带上戒指，我来迎接你了，我的新娘，现在，我已经牢牢抱住了我的未来。",
  15: "刚刚联系了宇宙中每个角落每种形态的萧逸，每一个身边都有一个你。",
  16: "唯独在你面前，我才愿意暴露那个真实的、不堪的自己。",
  17: "他人的眼光确实无法避免，但也不用太在意，毕竟生活是自己的，活出想要的样子就够了。",
  18: "两个世界又有什么关系。",
  19: "未来还那么长，我们一定会再见的。",
  20: "我虽然一直往前走，心却留在了身后。",
};

// Explicit PC prototype assignments, independent of quote length. All other
// dates and both Return Today branches restore 30px / 45px.
const pcQuoteTypography: Partial<Record<number, { fontSize: number; lineHeight: number }>> = {
  14: { fontSize: 21, lineHeight: 34 },
  17: { fontSize: 26, lineHeight: 41 },
};

export function getDemoDay(day: number) {
  const { fontSize: quoteFontSize, lineHeight: quoteLineHeight } =
    pcQuoteTypography[day] ?? { fontSize: 30, lineHeight: 45 };
  const signed = day === DEMO_TODAY ? todaySigned : day in signedQuotes;
  const status = day === DEMO_TODAY
    ? "待签到"
    : day > DEMO_TODAY ? "未来日期" : signed ? "已签到" : "未签到";
  const quote = day === DEMO_TODAY
    ? "签到获取今日语录"
    : day > DEMO_TODAY
      ? "这一天还未到来，\n期待与你一起解锁新的语录。"
      : signed ? signedQuotes[day] : "这一天没有签到，\n未获得当日语录。";
  const footer = day === DEMO_TODAY
    ? "与你相伴，收藏每一天的心动。"
    : day > DEMO_TODAY
      ? "未来的心意，留给未来的我们。"
      : signed ? "已珍藏 · 萧逸的每日心意" : "未签到 · 暂无语录";
  const weekday = ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."][
    new Date(Date.UTC(DEMO_YEAR, DEMO_MONTH - 1, day)).getUTCDay()
  ];

  return { signed, status, quote, footer, weekday, quoteFontSize, quoteLineHeight };
}
