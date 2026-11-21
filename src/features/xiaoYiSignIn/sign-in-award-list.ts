import { apiRequest } from "../../api/client";

export type SignInAward = {
  award_id: number;
  award_name: string;
  day_count: number;
  reward_img_url: string | null;
  is_get: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseSignInAwardList(value: unknown): SignInAward[] {
  if (!isRecord(value) || !Array.isArray(value.award_list)) {
    throw new Error("签到奖励列表格式不正确。");
  }

  const ids = new Set<number>();
  return value.award_list.map((item: unknown, index: number) => {
    if (!isRecord(item)) throw new Error(`第 ${index + 1} 条签到奖励格式不正确。`);
    const { award_id, award_name, day_count, reward_img_url, is_get } = item;
    if (
      typeof award_id !== "number" || !Number.isSafeInteger(award_id) || ids.has(award_id) ||
      typeof award_name !== "string" ||
      typeof day_count !== "number" || !Number.isSafeInteger(day_count) || day_count < 0 ||
      (reward_img_url !== null && typeof reward_img_url !== "string") ||
      typeof is_get !== "boolean"
    ) {
      throw new Error(`第 ${index + 1} 条签到奖励字段不正确。`);
    }
    ids.add(award_id);
    return { award_id, award_name, day_count, reward_img_url, is_get };
  });
}

export async function getSignInAwardList(signal: AbortSignal): Promise<SignInAward[]> {
  const response = await apiRequest<unknown>("/api/sign/award/list", { baseUrl: "", method: "GET", signal });
  return parseSignInAwardList(response);
}
