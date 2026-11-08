import { apiRequest } from "../../api/client";

export interface SignCalendarRequest {
  yearMonth: string;
}

export interface SignCalendarItem {
  day: number;
  is_signed: boolean;
}

export interface SignCalendarResponse {
  yearMonth: string;
  list: SignCalendarItem[];
}

export function isValidSignCalendarMonth(yearMonth: string): boolean {
  return yearMonth.length === 7 && /^(?!0000)\d{4}-(0[1-9]|1[0-2])$/.test(yearMonth);
}

function daysInMonth(yearMonth: string): number {
  const year = Number(yearMonth.slice(0, 4));
  const month = Number(yearMonth.slice(5));
  if (month === 2) return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export async function getSignInCalendar(
  { yearMonth }: SignCalendarRequest,
  signal: AbortSignal,
): Promise<SignCalendarResponse> {
  if (!isValidSignCalendarMonth(yearMonth)) {
    throw new Error("签到日历月份必须为有效的 yyyy-MM。");
  }
  const response = await apiRequest<unknown>(
    `/sign/calendar?${new URLSearchParams({ yearMonth })}`,
    { method: "GET", signal },
  );
  if (response === null || typeof response !== "object" || Array.isArray(response)) {
    throw new Error("签到日历响应格式不正确。");
  }
  const data = response as Record<string, unknown>;
  if (typeof data.yearMonth !== "string" || data.yearMonth !== yearMonth || !Array.isArray(data.list)) {
    throw new Error("签到日历月份或日期列表不正确。");
  }
  const count = daysInMonth(yearMonth);
  const seen = new Set<number>();
  const list: SignCalendarItem[] = [];
  for (const value of data.list) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("签到日历日期项格式不正确。");
    }
    const item = value as Record<string, unknown>;
    if (typeof item.day !== "number" || !Number.isInteger(item.day) || item.day < 1 || item.day > count ||
      typeof item.is_signed !== "boolean" || seen.has(item.day)) {
      throw new Error("签到日历存在非法或重复日期。");
    }
    seen.add(item.day);
    list.push({ day: item.day, is_signed: item.is_signed });
  }
  if (seen.size !== count) throw new Error("签到日历缺少自然日。");
  return { yearMonth, list };
}
