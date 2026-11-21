import { apiRequest } from "../../api/client";

export type SignInStat = {
  total_days: number;
  continue_days: number;
  unlocked_award_nodes: number[];
};

export async function getSignInStat(signal: AbortSignal): Promise<SignInStat> {
  const response = await apiRequest<unknown>("/api/sign/stat", { baseUrl: "", method: "GET", signal });

  if (
    response === null ||
    typeof response !== "object" ||
    Array.isArray(response) ||
    !Object.hasOwn(response, "total_days") ||
    !Object.hasOwn(response, "continue_days") ||
    !Object.hasOwn(response, "unlocked_award_nodes")
  ) {
    throw new Error("签到统计响应格式不正确。");
  }

  const stat = response as Record<string, unknown>;
  if (
    !Number.isInteger(stat.total_days) ||
    !Number.isInteger(stat.continue_days) ||
    !Array.isArray(stat.unlocked_award_nodes) ||
    !stat.unlocked_award_nodes.every(Number.isInteger)
  ) {
    throw new Error("签到统计响应字段不正确。");
  }

  return stat as SignInStat;
}
