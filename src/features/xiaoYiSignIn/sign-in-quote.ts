import { ApiError, apiRequest } from "../../api/client";

export type SignInQuote = {
  id: number;
  content: string;
  quote_date: string;
};

const DAILY_QUOTES_API_BASE_URL =
  import.meta.env.VITE_DAILY_QUOTES_API_BASE_URL?.trim().replace(/\/$/, "") ||
  "http://115.159.121.83";

export function isValidSignInQuoteDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [year, month, day] = date.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return false;

  const value = new Date(0);
  value.setUTCHours(0, 0, 0, 0);
  value.setUTCFullYear(year, month - 1, day);
  return value.getUTCFullYear() === year &&
    value.getUTCMonth() === month - 1 &&
    value.getUTCDate() === day;
}

export async function getSignInQuoteByDate(
  date: string,
  signal: AbortSignal,
): Promise<SignInQuote> {
  if (!isValidSignInQuoteDate(date)) {
    throw new ApiError("语录查询日期必须为有效的YYYY-MM-DD。", 422);
  }

  const response = await apiRequest<unknown>(
    `/api/v1/daily-quotes/by-date?${new URLSearchParams({ date })}`,
    { method: "GET", signal, baseUrl: DAILY_QUOTES_API_BASE_URL },
  );

  if (response === null || typeof response !== "object" || Array.isArray(response)) {
    throw new Error("历史语录响应格式不正确。");
  }

  const data = response as Record<string, unknown>;
  if (
    !Number.isInteger(data.id) ||
    typeof data.content !== "string" ||
    typeof data.quote_date !== "string" ||
    !isValidSignInQuoteDate(data.quote_date) ||
    data.quote_date !== date
  ) {
    throw new Error("历史语录响应字段或业务日期不正确。");
  }

  return {
    id: data.id as number,
    content: data.content,
    quote_date: data.quote_date,
  };
}
