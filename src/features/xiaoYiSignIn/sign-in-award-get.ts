import { apiRequest } from "../../api/client";

export async function getSignInAward(
  awardId: number,
  signal: AbortSignal,
  onUnauthorizedResponse: () => void,
) {
  if (!Number.isSafeInteger(awardId)) throw new RangeError("奖励编号无效。");
  const result = await apiRequest<{ msg?: unknown } | null>("/api/sign/award/get", {
    baseUrl: "",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ award_id: awardId }),
    signal,
    onUnauthorizedResponse,
  });
  if (typeof result?.msg !== "string") throw new Error("领取响应格式异常。");
  return result.msg;
}
