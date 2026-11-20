export const birthdayAnimation = "act3";
export const randomAnimations = [
  "act1",
  "act2",
  "idle_huaixiao",
  "idle_haixiu",
  "idle_miyanxiao",
] as const;
const birthdayDate = "2026-11-23";
const beijingDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function shouldPlayBirthdayAnimation(now = new Date()): boolean {
  const parts = beijingDate.formatToParts(now);
  const read = (type: string) => parts.find(part => part.type === type)?.value;
  const date = `${read("year")}-${read("month")}-${read("day")}`;
  return date === birthdayDate;
}
