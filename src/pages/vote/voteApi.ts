import { apiRequest } from '../../api/client';

export interface Vote {
  id: number;
  title: string;
  description: string;
  selection_mode: 'single' | 'multiple';
  options: { id: number; content: string; vote_count: number }[];
  total_votes: number;
  deadline: string;
  status: 'ongoing' | 'ended';
  has_voted: boolean | null;
  selected_option_ids: number[] | null;
}

export async function getVotes(auth: boolean, signal: AbortSignal) {
  const data = await apiRequest<{ votes: Vote[] }>('/v1/votes?status=all', {
    auth, signal, cache: 'no-store', responseType: 'json',
  });
  if (!Array.isArray(data?.votes)) throw new Error('投票列表返回格式不正确。');
  return data.votes;
}

export async function submitVote(voteId: number, optionIds: number[], signal: AbortSignal) {
  const data = await apiRequest<{ success: boolean; vote_id: number; option_ids: number[] }>(
    `/v1/votes/${voteId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option_ids: optionIds }),
      signal,
      responseType: 'json',
    },
  );
  if (data?.success !== true || data.vote_id !== voteId || !Array.isArray(data.option_ids)) {
    throw new Error('投票结果暂时无法确认，请刷新列表查看。');
  }
  return data.option_ids;
}

const deadlineFormat = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai', month: 'long', day: 'numeric',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

export function formatDeadline(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : deadlineFormat.format(date);
}
