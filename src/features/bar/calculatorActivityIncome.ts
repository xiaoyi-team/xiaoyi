import { calculateDailyIncome } from './calculatorPeriodicIncome'

export type ActivityIncome = Readonly<{
  ticket: number
  polaris: number
  quill: number
  bear: number
}>

function calculateDailyBenefit(today: string, predictionEnd: string, remainingDays: number, dailyRate: number): number {
  if (!Number.isSafeInteger(remainingDays) || remainingDays < 0) {
    throw new RangeError('Remaining effective days must be a non-negative safe integer')
  }
  const forecastDays = calculateDailyIncome(today, predictionEnd) / 120
  return Math.min(forecastDays, remainingDays) * dailyRate
}

export function calculateMonthlyCardIncome(today: string, predictionEnd: string, remainingDays: number): number {
  return calculateDailyBenefit(today, predictionEnd, remainingDays, 150)
}

export function calculateCeremonyIncome(today: string, predictionEnd: string, remainingDays: number): number {
  return calculateDailyBenefit(today, predictionEnd, remainingDays, 100)
}

export function calculatePremiumCardIncome(today: string, predictionEnd: string, remainingDays: number): number {
  return calculateDailyBenefit(today, predictionEnd, remainingDays, 300)
}

export function calculateActivityIncome(
  today: string,
  predictionEnd: string,
  remainingDays: Readonly<{ monthly: number; ceremony: number; premium: number }>,
): ActivityIncome {
  return {
    ticket: 0,
    polaris: 0,
    quill: 0,
    bear: calculateMonthlyCardIncome(today, predictionEnd, remainingDays.monthly)
      + calculateCeremonyIncome(today, predictionEnd, remainingDays.ceremony)
      + calculatePremiumCardIncome(today, predictionEnd, remainingDays.premium),
  }
}
