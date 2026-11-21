import type { GlobalNoticeDto, GlobalNoticeBlockDto } from '../../services/wishBox'
import type { AnnouncementViewData } from './announcementSample'

function formatBeijingDateTime(value: string, field: 'start_time' | 'end_time'): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?$/.exec(value)
  if (!match) throw new Error(`Global notice mapping error: invalid ${field}`)
  const [, year, month, day, hour, minute, second] = match
  const parts = [Number(year), Number(month), Number(day), Number(hour), Number(minute), Number(second)]
  const [yearNumber, monthNumber, dayNumber, hourNumber, minuteNumber, secondNumber] = parts
  const leapYear = yearNumber % 4 === 0 && (yearNumber % 100 !== 0 || yearNumber % 400 === 0)
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][monthNumber - 1]
  if (
    yearNumber < 1 || monthNumber < 1 || monthNumber > 12 || dayNumber < 1 || dayNumber > daysInMonth ||
    hourNumber > 23 || minuteNumber > 59 || secondNumber > 59
  ) {
    throw new Error(`Global notice mapping error: invalid ${field}`)
  }
  return `${yearNumber}年${monthNumber}月${dayNumber}日 ${String(hourNumber).padStart(2, '0')}:${String(minuteNumber).padStart(2, '0')}`
}

function mapNoticeBlock(block: GlobalNoticeBlockDto, responseIndex: number) {
  if (
    typeof block.sort !== 'number' || !Number.isInteger(block.sort) ||
    (block.title != null && typeof block.title !== 'string') ||
    (block.content != null && typeof block.content !== 'string') ||
    (block.font_size != null && typeof block.font_size !== 'string') ||
    (block.font_color != null && typeof block.font_color !== 'string') ||
    (block.font_weight != null && block.font_weight !== 'normal' && block.font_weight !== 'bold')
  ) {
    throw new Error('Global notice mapping error: invalid block_list item')
  }

  return {
    id: `${block.sort}:${responseIndex}`,
    title: block.title ?? '',
    content: block.content ?? '',
    // The API returns blocks ordered by sort; preserve that order and apply the confirmed
    // blue/pink presentation sequence without mutating or re-sorting the response.
    variant: responseIndex % 2 === 0 ? 'blue' as const : 'pink' as const,
    fontSize: block.font_size ?? null,
    fontColor: block.font_color ?? null,
    fontWeight: block.font_weight ?? null,
  }
}

export function mapGlobalNoticeToAnnouncement(notice: GlobalNoticeDto): AnnouncementViewData {
  if (typeof notice.title !== 'string') {
    throw new Error('Global notice mapping error: title must be a string')
  }
  if (notice.location != null && typeof notice.location !== 'string') {
    throw new Error('Global notice mapping error: location must be a string or null')
  }
  if (!Array.isArray(notice.block_list)) {
    throw new Error('Global notice mapping error: block_list must be an array')
  }

  let layoutConfig: AnnouncementViewData['layoutConfig'] = null
  if (notice.notice_layout_config != null) {
    const { left_ratio: leftRatio, right_ratio: rightRatio } = notice.notice_layout_config
    if (
      typeof leftRatio !== 'number' || !Number.isFinite(leftRatio) || leftRatio <= 0 ||
      typeof rightRatio !== 'number' || !Number.isFinite(rightRatio) || rightRatio <= 0
    ) {
      throw new Error('Global notice mapping error: notice_layout_config ratios must be positive numbers')
    }
    // Keep the API values unchanged; no sum-to-one assumption or Touch-specific conversion.
    layoutConfig = { leftRatio, rightRatio }
  }

  if (typeof notice.start_time !== 'string' || typeof notice.end_time !== 'string') {
    throw new Error('Global notice mapping error: start_time and end_time must be strings')
  }
  const start = formatBeijingDateTime(notice.start_time, 'start_time')
  const end = formatBeijingDateTime(notice.end_time, 'end_time')
  const datePrefixLength = start.indexOf(' ')
  const time = datePrefixLength === end.indexOf(' ') &&
    start.slice(0, datePrefixLength) === end.slice(0, datePrefixLength)
    ? `${start}–${end.slice(datePrefixLength + 1)}`
    : `${start}–${end}`

  return {
    title: notice.title,
    location: notice.location ?? null,
    time,
    layoutConfig,
    blocks: notice.block_list.map(mapNoticeBlock),
  }
}
