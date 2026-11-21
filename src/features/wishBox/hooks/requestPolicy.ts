import { HttpError, NetworkError, TimeoutError } from '../../../services/request'

function parseHttpDate(value: string, referenceTime: number): number | null {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const standard = /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat), (\d{2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d{2}):(\d{2}):(\d{2}) GMT$/.exec(value)
  const legacy = /^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday), (\d{2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{2}) (\d{2}):(\d{2}):(\d{2}) GMT$/.exec(value)
  const ascii = /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( [1-9]|[12]\d|3[01]) (\d{2}):(\d{2}):(\d{2}) (\d{4})$/.exec(value)
  const match = standard ?? legacy
  if (!match && !ascii) return null
  const day = Number(match ? match[2] : ascii![3])
  const month = months.indexOf(match ? match[3] : ascii![2])
  let year = Number(match ? match[4] : ascii![7])
  if (legacy) {
    const currentYear = new Date(referenceTime).getUTCFullYear()
    year += Math.floor(currentYear / 100) * 100
    if (year > currentYear + 50) year -= 100
  }
  const hour = Number(match ? match[5] : ascii![4])
  const minute = Number(match ? match[6] : ascii![5])
  const second = Number(match ? match[7] : ascii![6])
  if (hour > 23 || minute > 59 || second > 59 || year < 1601) return null
  const timestamp = Date.UTC(year, month, day, hour, minute, second)
  const date = new Date(timestamp)
  const weekday = (match ? match[1] : ascii![1]).slice(0, 3)
  if (date.getUTCDate() !== day || date.getUTCMonth() !== month || weekdays[date.getUTCDay()] !== weekday) return null
  return timestamp
}

function retryAfterTiming(error: HttpError): { declared: number; remaining: number } {
  const value = error.retryAfter?.trim()
  if (!value) return { declared: 0, remaining: 0 }
  const seconds = /^\d+$/.test(value) ? Number(value) : null
  const date = seconds === null ? parseHttpDate(value, error.receivedAt) : null
  const declared = seconds !== null ? seconds * 1000 : date === null ? 0 : Math.max(0, date - error.receivedAt)
  return { declared, remaining: Math.max(0, error.receivedAt + declared - Date.now()) }
}

export function isRecoverableWishBoxError(error: unknown): boolean {
  if (error instanceof TimeoutError || error instanceof NetworkError) return true
  return error instanceof HttpError && [408, 429, 500, 502, 503, 504].includes(error.status)
}

export function retryWishBoxRequest(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2 || !isRecoverableWishBoxError(error)) return false
  if (!(error instanceof HttpError)) return true
  if (error.status === 429) return retryAfterTiming(error).declared <= 10_000
  return true
}

export function wishBoxRetryDelay(failureCount: number, error: unknown): number {
  const ordinaryDelay = failureCount === 0 ? 1000 : 2000
  return error instanceof HttpError && error.status === 429
    ? Math.max(ordinaryDelay, retryAfterTiming(error).remaining)
    : ordinaryDelay
}
