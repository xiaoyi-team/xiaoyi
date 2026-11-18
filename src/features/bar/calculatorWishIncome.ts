import { calculateWeeklyIncome } from './calculatorPeriodicIncome'

export type WishLevel = 1 | 2 | 3

export type WishIncome = Readonly<{
  level: WishLevel
  weeklyReward: number
  subsequentWeekCount: number
  remainingWeeks: number
  effectiveWeeks: number
  income: number
  resources: Readonly<{
    ticket: 0
    polaris: 0
    quill: 0
    bear: number
  }>
}>

export type WishIncomeInput = Readonly<{
  today: string
  predictionEnd: string
  level: WishLevel
  remainingWeeks: number
}>

const WEEKLY_REWARDS: Readonly<Record<WishLevel, number>> = {
  1: 200,
  2: 400,
  3: 700,
}

const WEEKLY_BASE_INCOME = 800

export function getWishWeeklyReward(level: WishLevel): number {
  if (level !== 1 && level !== 2 && level !== 3) {
    throw new RangeError('Wish level must be 1, 2, or 3')
  }
  return WEEKLY_REWARDS[level]
}

export function calculateSubsequentWishWeekCount(today: string, predictionEnd: string): number {
  return calculateWeeklyIncome(today, predictionEnd) / WEEKLY_BASE_INCOME
}

export function calculateEffectiveWishWeeks(
  today: string,
  predictionEnd: string,
  remainingWeeks: number,
): number {
  if (!Number.isSafeInteger(remainingWeeks) || remainingWeeks < 0) {
    throw new RangeError('Remaining effective weeks must be a non-negative safe integer')
  }
  return Math.min(calculateSubsequentWishWeekCount(today, predictionEnd), remainingWeeks)
}

export function calculateWishIncome({ today, predictionEnd, level, remainingWeeks }: WishIncomeInput): WishIncome {
  const weeklyReward = getWishWeeklyReward(level)
  const subsequentWeekCount = calculateSubsequentWishWeekCount(today, predictionEnd)
  if (!Number.isSafeInteger(remainingWeeks) || remainingWeeks < 0) {
    throw new RangeError('Remaining effective weeks must be a non-negative safe integer')
  }
  const effectiveWeeks = Math.min(subsequentWeekCount, remainingWeeks)
  const income = effectiveWeeks * weeklyReward

  return {
    level,
    weeklyReward,
    subsequentWeekCount,
    remainingWeeks,
    effectiveWeeks,
    income,
    resources: { ticket: 0, polaris: 0, quill: 0, bear: income },
  }
}
