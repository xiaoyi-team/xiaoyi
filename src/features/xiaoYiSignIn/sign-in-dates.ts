export function formatSignInCardDate(date: string): { dateText: string; weekday: string } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("抽卡日期必须为有效的YYYY-MM-DD日期。");
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(0);
  value.setUTCFullYear(year, month - 1, day);
  if (year < 1 || value.getUTCFullYear() !== year || value.getUTCMonth() !== month - 1 || value.getUTCDate() !== day) {
    throw new Error("抽卡日期必须为有效的YYYY-MM-DD日期。");
  }
  return {
    dateText: `${month} / ${day}`,
    weekday: ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."][value.getUTCDay()],
  };
}

// UI calendar dates; server sign-in state remains owned by M2.
export const SIGN_IN_LAUNCH_MONTH = "2026-11";

export function getSignInYearOptions(todayDate: string): number[] {
  const currentMonth = todayDate.slice(0, 7);
  if (!isValidSignInDate(todayDate) || currentMonth < SIGN_IN_LAUNCH_MONTH) return [];
  const firstYear = Number(SIGN_IN_LAUNCH_MONTH.slice(0, 4));
  const currentYear = Number(currentMonth.slice(0, 4));
  return Array.from({ length: currentYear - firstYear + 1 }, (_, index) => firstYear + index);
}

export function getSignInMonthOptions(year: number, todayDate: string): number[] {
  const currentMonth = todayDate.slice(0, 7);
  if (!isValidSignInDate(todayDate) || currentMonth < SIGN_IN_LAUNCH_MONTH) return [];
  const currentYear = Number(currentMonth.slice(0, 4));
  if (year < Number(SIGN_IN_LAUNCH_MONTH.slice(0, 4)) || year > currentYear) return [];
  const firstMonth = year === Number(SIGN_IN_LAUNCH_MONTH.slice(0, 4))
    ? Number(SIGN_IN_LAUNCH_MONTH.slice(5))
    : 1;
  const lastMonth = year === currentYear ? Number(currentMonth.slice(5)) : 12;
  return Array.from({ length: Math.max(0, lastMonth - firstMonth + 1) }, (_, index) => firstMonth + index);
}

export function isValidSignInDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [year, month, day] = date.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const value = new Date(0);
  value.setUTCHours(0, 0, 0, 0);
  value.setUTCFullYear(year, month - 1, day);
  return value.getUTCFullYear() === year && value.getUTCMonth() === month - 1 && value.getUTCDate() === day;
}

export function createSignInMonth(yearMonth: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(yearMonth)) throw new Error("签到板月份必须为有效年月。");
  const year = Number(yearMonth.slice(0, 4));
  const month = Number(yearMonth.slice(5));
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const offset = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const rowCount = Math.max(5, Math.ceil((offset + days) / 7));
  const weeks = Array.from({ length: rowCount }, (_, row) =>
    Array.from({ length: 7 }, (_, column) => {
      const day = row * 7 + column - offset + 1;
      return day >= 1 && day <= days ? `${yearMonth}-${String(day).padStart(2, "0")}` : null;
    }),
  );
  return { year, month, days, offset, rowCount, weeks };
}

const beijingDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Shanghai", calendar: "gregory", numberingSystem: "latn",
  year: "numeric", month: "2-digit", day: "2-digit",
});

export function getBeijingDate(now: Date): string {
  const parts = beijingDateFormatter.formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((value) => value.type === type)!.value;
  return `${part("year").padStart(4, "0")}-${part("month")}-${part("day")}`;
}

export function getNextBeijingMidnight(now: Date): number {
  const [year, month, day] = getBeijingDate(now).split("-").map(Number);
  return Date.UTC(year, month - 1, day + 1) - 8 * 60 * 60 * 1000;
}

export const SIGN_IN_DEMO_DATE = "2026-09-24";
export const isSupportedSignInDate = (date: string) => isValidSignInDate(date) && date.slice(0, 7) >= SIGN_IN_LAUNCH_MONTH;

export type SignInDateState = { todayDate: string; yearMonth: string; selectedDate: string | null };
export function createSignInDateState(now: Date): SignInDateState {
  const todayDate = getBeijingDate(now);
  const todaySupported = isSupportedSignInDate(todayDate);
  return {
    todayDate,
    yearMonth: todaySupported ? todayDate.slice(0, 7) : SIGN_IN_LAUNCH_MONTH,
    selectedDate: todaySupported ? todayDate : null,
  };
}
export type SignInDateAction =
  | { type: "month"; yearMonth: string }
  | { type: "select"; date: string }
  | { type: "refresh-today"; date: string }
  | { type: "return-today"; date: string }
  | { type: "select-demo-date" };

export function signInDateReducer(state: SignInDateState, action: SignInDateAction): SignInDateState {
  if (action.type === "refresh-today") return action.date === state.todayDate ? state : { ...state, todayDate: action.date };
  if (action.type === "return-today") return isSupportedSignInDate(action.date)
    ? { todayDate: action.date, yearMonth: action.date.slice(0, 7), selectedDate: action.date }
    : { ...state, todayDate: action.date };
  if (action.type === "select-demo-date") return { ...state, yearMonth: "2026-09", selectedDate: SIGN_IN_DEMO_DATE };
  if (action.type === "month") {
    if (!getSignInMonthOptions(Number(action.yearMonth.slice(0, 4)), state.todayDate).includes(Number(action.yearMonth.slice(5)))) return state;
    createSignInMonth(action.yearMonth);
    return action.yearMonth === state.yearMonth && state.selectedDate === null ? state : { ...state, yearMonth: action.yearMonth, selectedDate: null };
  }
  if (!isSupportedSignInDate(action.date) || action.date.slice(0, 7) !== state.yearMonth ||
    !getSignInMonthOptions(Number(state.yearMonth.slice(0, 4)), state.todayDate).includes(Number(state.yearMonth.slice(5)))) return state;
  const dates = createSignInMonth(state.yearMonth).weeks.flat();
  return dates.includes(action.date) ? { ...state, selectedDate: action.date } : state;
}
