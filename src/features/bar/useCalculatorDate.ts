import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

type CivilDate = { year: number; month: number; day: number }
const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate()
const dateKey = ({ year, month, day }: CivilDate) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
function shanghaiToday(now = new Date()): CivilDate {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Shanghai', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(now)
  const get = (type: string) => Number(parts.find(part => part.type === type)?.value)
  return { year: get('year'), month: get('month'), day: get('day') }
}
function nextShanghaiMidnight(from: Date): number {
  const today = shanghaiToday(from)
  const tomorrow = today.day < daysInMonth(today.year, today.month)
    ? { ...today, day: today.day + 1 }
    : today.month < 12
      ? { year: today.year, month: today.month + 1, day: 1 }
      : { year: today.year + 1, month: 1, day: 1 }
  const targetLocalAsUtc = Date.UTC(tomorrow.year, tomorrow.month - 1, tomorrow.day)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  })
  let timestamp = targetLocalAsUtc
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = formatter.formatToParts(new Date(timestamp))
    const get = (type: string) => Number(parts.find(part => part.type === type)?.value)
    const localAsUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'))
    const adjustment = targetLocalAsUtc - localAsUtc
    timestamp += adjustment
    if (adjustment === 0) break
  }
  return timestamp
}
function nextYear(date: CivilDate): CivilDate {
  const year = date.year + 1
  return { year, month: date.month, day: Math.min(date.day, daysInMonth(year, date.month)) }
}
function moveMonth(year: number, month: number, delta: number) {
  const index = year * 12 + month - 1 + delta
  return { year: Math.floor(index / 12), month: ((index % 12) + 12) % 12 + 1 }
}

export function useCalculatorDate(focusContext?: unknown) {
  const [selectedDate, setSelectedDate] = useState<CivilDate | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() => shanghaiToday())
  const [today, setToday] = useState(() => shanghaiToday())
  const triggerRef = useRef<HTMLButtonElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const end = nextYear(today)
  const openCalendar = () => { const current = shanghaiToday(); setToday(current); setVisibleMonth(selectedDate ?? current); setCalendarOpen(true) }
  const closeCalendar = () => { setCalendarOpen(false); triggerRef.current?.focus() }
  useEffect(() => { if (calendarOpen) calendarRef.current?.focus() }, [calendarOpen, focusContext])
  useEffect(() => {
    if (!calendarOpen) return
    let timeout: ReturnType<typeof setTimeout> | undefined
    let active = true
    const scheduleNextMidnight = () => {
      if (timeout !== undefined) clearTimeout(timeout)
      const now = new Date()
      timeout = setTimeout(() => {
        if (!active) return
        setToday(shanghaiToday())
        scheduleNextMidnight()
      }, Math.max(0, nextShanghaiMidnight(now) - now.getTime()))
    }
    const refreshWhenVisible = () => {
      if (document.visibilityState !== 'visible') return
      setToday(shanghaiToday())
      scheduleNextMidnight()
    }
    scheduleNextMidnight()
    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => {
      active = false
      if (timeout !== undefined) clearTimeout(timeout)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [calendarOpen])
  const selectDate = (date: CivilDate) => {
    const current = shanghaiToday()
    setToday(current)
    const key = dateKey(date)
    if (key < dateKey(current) || key > dateKey(nextYear(current))) return
    setSelectedDate(date)
    closeCalendar()
  }
  const dateText = selectedDate ? dateKey(selectedDate) : '请选择日期'
  const resultDateText = selectedDate ? `至 ${dateKey(selectedDate)} 可获得总资源` : '请选择截止日期'
  const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closeCalendar()
      return
    }
    if (event.key !== 'Tab') return
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'))
    if (!buttons.length) { event.preventDefault(); return }
    const first = buttons[0], last = buttons[buttons.length - 1]
    if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }
  const firstWeekday = new Date(Date.UTC(visibleMonth.year, visibleMonth.month - 1, 1)).getUTCDay()
  const count = daysInMonth(visibleMonth.year, visibleMonth.month)
  const prev = moveMonth(visibleMonth.year, visibleMonth.month, -1)
  const next = moveMonth(visibleMonth.year, visibleMonth.month, 1)
  const monthKey = (d: { year: number; month: number }) => d.year * 12 + d.month
  return { reset: () => { setSelectedDate(null); setCalendarOpen(false) }, selectedDate, selectDate, dateText, resultDateText, calendarOpen, visibleMonth, setVisibleMonth, today, triggerRef, calendarRef, end, openCalendar, closeCalendar, trapFocus, firstWeekday, count, prev, next, monthKey }
}
export type CalculatorDateState = ReturnType<typeof useCalculatorDate>
export { dateKey, shanghaiToday }
