import { calculateActivityIncome, type ActivityIncome } from './calculatorActivityIncome'
import { calculateGiftResources, type GiftResourceReward, type GiftExchangeCost } from './giftResourceMap'
import { calculatePeriodicIncome, type PeriodicIncome } from './calculatorPeriodicIncome'
import { calculateWishIncome, type WishIncome, type WishLevel } from './calculatorWishIncome'
import { validatePolarisBalance, type PolarisCheck } from './calculatorPolarisValidation'
import type { ResourceCounts, ResourceKey } from './resources'

export type CalculateResourcesInput = Readonly<{
  current: Readonly<ResourceCounts>
  today: string
  predictionEnd: string | null
  activityDays: Readonly<{ monthly: number; ceremony: number; premium: number }>
  wishLevel: WishLevel
  wishRemainingWeeks: number
  giftCounts: Readonly<Record<string, number>>
}>

export type ResourceCalculationBreakdown = Readonly<{
  resources: ResourceCounts
  periodicIncome: PeriodicIncome
  activityIncome: ActivityIncome
  wishIncome: WishIncome
  giftReward: GiftResourceReward
  exchangeCost: GiftExchangeCost
}>

export type GatedResourceCalculation = Readonly<
  | { status: 'success'; result: ResourceCalculationBreakdown }
  | { status: 'blocked'; reason: 'insufficient-polaris'; polarisCheck: Extract<PolarisCheck, { allowed: false }> }
>

const RESOURCE_KEYS: readonly ResourceKey[] = ['ticket', 'polaris', 'quill', 'bear']
const ACTIVITY_KEYS = ['monthly', 'ceremony', 'premium'] as const

function assertExactKeys(value: object, keys: readonly string[], label: string): void {
  const actual = Object.keys(value).sort()
  const expected = [...keys].sort()
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw new TypeError(`${label} must contain exactly: ${expected.join(', ')}`)
  }
}

function assertNonNegativeSafeInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${label} must be a non-negative safe integer`)
  }
}

function validateResourceValues(value: Readonly<Record<string, number>>, label: string): void {
  assertExactKeys(value, RESOURCE_KEYS, label)
  for (const key of RESOURCE_KEYS) assertNonNegativeSafeInteger(value[key], `${label}.${key}`)
}

function safeSum(label: string, ...values: number[]): number {
  let total = 0
  for (const value of values) {
    if (!Number.isSafeInteger(value)) throw new RangeError(`${label} contains a non-safe integer`)
    total += value
    if (!Number.isSafeInteger(total)) throw new RangeError(`${label} exceeds the safe integer range`)
  }
  return total
}

export class PolarisBalanceInsufficientError extends RangeError {
  readonly available: number
  readonly cost: number

  constructor(available: number, cost: number) {
    super(`Insufficient polaris balance: available ${available}, exchange cost ${cost}`)
    this.name = 'PolarisBalanceInsufficientError'
    this.available = available
    this.cost = cost
  }
}

export function calculateResources(input: CalculateResourcesInput): ResourceCalculationBreakdown {
  if (!input || typeof input !== 'object') throw new TypeError('Calculation input must be an object')
  if (input.predictionEnd === null) throw new RangeError('Prediction end date is required')
  validateResourceValues(input.current, 'current')
  assertExactKeys(input.activityDays, ACTIVITY_KEYS, 'activityDays')
  for (const key of ACTIVITY_KEYS) assertNonNegativeSafeInteger(input.activityDays[key], `activityDays.${key}`)

  const periodicIncome = calculatePeriodicIncome(input.today, input.predictionEnd)
  const activityIncome = calculateActivityIncome(input.today, input.predictionEnd, input.activityDays)
  const wishIncome = calculateWishIncome({
    today: input.today,
    predictionEnd: input.predictionEnd,
    level: input.wishLevel,
    remainingWeeks: input.wishRemainingWeeks,
  })
  const { reward: giftReward, exchangeCost } = calculateGiftResources(input.giftCounts)

  validateResourceValues(periodicIncome, 'periodicIncome')
  validateResourceValues(activityIncome, 'activityIncome')
  validateResourceValues(wishIncome.resources, 'wishIncome')
  validateResourceValues(giftReward, 'giftReward')
  assertNonNegativeSafeInteger(exchangeCost.polaris, 'exchangeCost.polaris')

  const availablePolaris = safeSum(
    'available polaris', input.current.polaris, periodicIncome.polaris,
    activityIncome.polaris, wishIncome.resources.polaris, giftReward.polaris,
  )
  const polaris = availablePolaris - exchangeCost.polaris
  if (!Number.isSafeInteger(polaris)) throw new RangeError('Final polaris exceeds the safe integer range')
  if (polaris < 0) throw new PolarisBalanceInsufficientError(availablePolaris, exchangeCost.polaris)

  const resources: ResourceCounts = {
    ticket: safeSum('final ticket', input.current.ticket, periodicIncome.ticket, activityIncome.ticket, wishIncome.resources.ticket, giftReward.ticket),
    polaris,
    quill: safeSum('final quill', input.current.quill, periodicIncome.quill, activityIncome.quill, wishIncome.resources.quill, giftReward.quill),
    bear: safeSum('final bear', input.current.bear, periodicIncome.bear, activityIncome.bear, wishIncome.resources.bear, giftReward.bear),
  }

  return { resources, periodicIncome, activityIncome, wishIncome, giftReward, exchangeCost }
}

export function calculateResourcesWithGate(input: CalculateResourcesInput): GatedResourceCalculation {
  try {
    return { status: 'success', result: calculateResources(input) }
  } catch (error) {
    if (!(error instanceof PolarisBalanceInsufficientError)) throw error
    const polarisCheck = validatePolarisBalance(error.available, error.cost)
    if (polarisCheck.allowed) throw new Error('Polaris insufficiency error had a sufficient balance', { cause: error })
    return { status: 'blocked', reason: 'insufficient-polaris', polarisCheck }
  }
}
