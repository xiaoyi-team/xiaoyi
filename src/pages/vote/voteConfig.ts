export type VoteMode = 'single' | 'multi';

export interface VoteConfig {
  title: string;
  description: string;
  mode: VoteMode;
  options: readonly string[];
}

function defineVote(config: VoteConfig): VoteConfig {
  const title = config.title.trim();
  const description = config.description.trim();
  const options = config.options.map(option => option.trim());
  if (!title || Array.from(title).length > 15) throw new Error('投票标题须为 1–15 字');
  if (Array.from(description).length > 48) throw new Error('投票介绍最多 48 字');
  if (options.length < 2 || options.some(option => !option)) throw new Error('请填写至少两个有效选项');
  return { ...config, title, description, options };
}

// 本地配置对应后台发布的一场投票。
export const demoVote = defineVote({
  title: '下次社团活动想体验的内容是？',
  description: '欢迎大家为下一次的社团活动出出主意！',
  mode: 'single',
  options: [
    'F1 观赛夜（一起看比赛直播）',
    '手作工坊（定制周边 / 小物 DIY）',
    '主题放映会（电影 / 纪录片）',
    '校园户外活动（骑行 / 野餐 / 城市漫步）',
  ],
});
