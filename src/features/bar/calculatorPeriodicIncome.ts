export type PeriodicIncome = Readonly<{
  ticket: number
  polaris: number
  quill: number
  bear: number
}>

type CivilDate = Readonly<{ year: number; month: number; day: number }>

const parseDate = (value: string): CivilDate => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) throw new RangeError(`Invalid date: ${value}`)
  const [, yearText, monthText, dayText] = match
  const date = { year: Number(yearText), month: Number(monthText), day: Number(dayText) }
  const check = new Date(Date.UTC(date.year, date.month - 1, date.day))
  if (date.month < 1 || date.month > 12 || date.day < 1 || check.getUTCFullYear() !== date.year || check.getUTCMonth() + 1 !== date.month || check.getUTCDate() !== date.day) {
    throw new RangeError(`Invalid date: ${value}`)
  }
  return date
}

const ordinal = ({ year, month, day }: CivilDate) => Date.UTC(year, month - 1, day) / 86_400_000
const formatDate = ({ year, month, day }: CivilDate) => `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
const addDays = (date: CivilDate, days: number): CivilDate => {
  const result = new Date(Date.UTC(date.year, date.month - 1, date.day + days))
  return { year: result.getUTCFullYear(), month: result.getUTCMonth() + 1, day: result.getUTCDate() }
}
const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate()

function getRange(todayText: string, endText: string) {
  const today = parseDate(todayText)
  const end = parseDate(endText)
  if (ordinal(end) < ordinal(today)) throw new RangeError('Prediction end date cannot precede today')
  return { today, end, startOrdinal: ordinal(today) + 1, endOrdinal: ordinal(end) }
}

export function calculateDailyIncome(today: string, predictionEnd: string): number {
  const { startOrdinal, endOrdinal } = getRange(today, predictionEnd)
  return Math.max(0, endOrdinal - startOrdinal + 1) * 120
}

export function calculateWeeklyIncome(today: string, predictionEnd: string): number {
  const { today: current, startOrdinal, endOrdinal } = getRange(today, predictionEnd)
  if (startOrdinal > endOrdinal) return 0
  const currentWeekMonday = ordinal(current) - ((new Date(Date.UTC(current.year, current.month - 1, current.day)).getUTCDay() + 6) % 7)
  const firstEligibleMonday = currentWeekMonday + 7
  const lastMonday = endOrdinal - ((new Date(endOrdinal * 86_400_000).getUTCDay() + 6) % 7)
  return Math.max(0, Math.floor((lastMonday - firstEligibleMonday) / 7) + 1) * 800
}

export function calculateMonthlyIncome(today: string, predictionEnd: string): number {
  const { today: current, startOrdinal, endOrdinal } = getRange(today, predictionEnd)
  let year = current.year
  let month = current.month + 1
  if (month > 12) { year += 1; month = 1 }
  let income = 0
  while (true) {
    const first = ordinal({ year, month, day: 1 })
    const last = ordinal({ year, month, day: daysInMonth(year, month) })
    if (first >= startOrdinal && last <= endOrdinal) income += 3
    if (last >= endOrdinal) break
    const next = addDays({ year, month, day: 1 }, daysInMonth(year, month))
    year = next.year
    month = next.month
  }
  return income
}

export function calculatePeriodicIncome(today: string, predictionEnd: string): PeriodicIncome {
  return {
    ticket: 0,
    polaris: 0,
    quill: calculateMonthlyIncome(today, predictionEnd),
    bear: calculateDailyIncome(today, predictionEnd) + calculateWeeklyIncome(today, predictionEnd),
  }
}

export { formatDate }
