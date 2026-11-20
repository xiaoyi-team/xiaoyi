function isDayCount(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

export function getRemainingAwardDays(totalDays: number, awards: readonly { day_count: number }[]): number | null {
  if (!isDayCount(totalDays)) return null;

  let nextThreshold: number | undefined;
  for (const { day_count } of awards) {
    if (!isDayCount(day_count)) return null;
    if (day_count > totalDays && (nextThreshold === undefined || day_count < nextThreshold)) {
      nextThreshold = day_count;
    }
  }

  return nextThreshold === undefined ? null : nextThreshold - totalDays;
}

export function getAwardProgress(totalDays: number, awards: readonly { day_count: number }[]): number | null {
  if (!isDayCount(totalDays)) return null;

  const thresholds = [...new Set(awards.map(({ day_count }) => day_count)
    .filter((days) => isDayCount(days) && days > 0))].sort((a, b) => a - b);
  if (thresholds.length === 0) return null;

  let previousThreshold = 0;
  for (const nextThreshold of thresholds) {
    if (totalDays <= nextThreshold) {
      // Positive, distinct, ascending thresholds guarantee a nonzero denominator.
      const progress = (totalDays - previousThreshold) / (nextThreshold - previousThreshold);
      return Math.min(1, Math.max(0, progress));
    }
    previousThreshold = nextThreshold;
  }

  return 1;
}
