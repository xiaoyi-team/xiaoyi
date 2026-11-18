export type PolarisCheck = Readonly<
  | { allowed: true; available: number; cost: number; remaining: number }
  | { allowed: false; available: number; cost: number; deficit: number }
>

function assertNonNegativeSafeInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${label} must be a non-negative safe integer`)
  }
}

export function validatePolarisBalance(available: number, cost: number): PolarisCheck {
  assertNonNegativeSafeInteger(available, 'Available polaris')
  assertNonNegativeSafeInteger(cost, 'Polaris exchange cost')
  const difference = available - cost
  if (!Number.isSafeInteger(difference)) throw new RangeError('Polaris balance difference exceeds the safe integer range')
  return difference < 0
    ? { allowed: false, available, cost, deficit: -difference }
    : { allowed: true, available, cost, remaining: difference }
}
