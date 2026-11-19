import background from '../assets/bar/source/background/pc-background.png'
import touchBackground from '../assets/bar/source/background/touch-background.png'
import CalculatorEntrance from '../features/bar/CalculatorEntrance'
import CalculatorPanel from '../features/bar/CalculatorPanel'
import CalculatorTouchPanel from '../features/bar/CalculatorTouchPanel'
import CalculatorHelp from '../features/bar/CalculatorHelp'
import CalculatorQuantityInput, { type QuantityField } from '../features/bar/CalculatorQuantityInput'
import CalculatorPolarisNotice from '../features/bar/CalculatorPolarisNotice'
import type { GiftState } from '../features/bar/gifts'
import { initialResourceCounts, type ResourceCounts, type ResourceState } from '../features/bar/resources'
import { useActivityState } from '../features/bar/useActivityState'
import { dateKey, shanghaiToday, useCalculatorDate } from '../features/bar/useCalculatorDate'
import { calculateResourcesWithGate } from '../features/bar/calculateResources'
import { useCallback, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import '../features/bar/BarPage.css'

const touchViewport = window.matchMedia('(max-width: 1024px)')
const subscribeToTouchViewport = (onChange: () => void) => {
  touchViewport.addEventListener('change', onChange)
  return () => touchViewport.removeEventListener('change', onChange)
}
const getTouchViewportSnapshot = () => touchViewport.matches
const getTouchViewportServerSnapshot = () => false

function CalculatorSession({ isTouchViewport, onClose }: { isTouchViewport: boolean; onClose: () => void }) {
  const calculatorDate = useCalculatorDate(isTouchViewport)
  const activity = useActivityState()
  const [giftCounts, setGiftCounts] = useState<Record<string, number>>({})
  const [resourceCounts, setResourceCounts] = useState(initialResourceCounts)
  const [calculationResult, setCalculationResult] = useState<{ resources: ResourceCounts; predictionEnd: string } | null>(null)
  const [calculationStatus, setCalculationStatus] = useState<'idle' | 'calculating' | 'date-required' | 'date-expired' | 'success' | 'blocked' | 'error'>('idle')
  const calculationLock = useRef(false)
  const calculationFrame = useRef<number | null>(null)
  const cancelCalculation = useCallback(() => {
    if (calculationFrame.current !== null) cancelAnimationFrame(calculationFrame.current)
    calculationFrame.current = null
    calculationLock.current = false
  }, [])
  useLayoutEffect(() => cancelCalculation, [cancelCalculation])
  const [edit, setEdit] = useState<{ field: QuantityField; label: string; original: number; draft: string } | null>(null)
  const editTrigger = useRef<HTMLButtonElement | null>(null)
  const openEdit = (field: QuantityField, label: string) => {
    const original = field.kind === 'resource' ? resourceCounts[field.key] : activity.counts[field.key]
    editTrigger.current = document.activeElement instanceof HTMLButtonElement ? document.activeElement : null
    setEdit({ field, label, original, draft: String(original) })
  }
  const closeEdit = (commit: boolean) => {
    if (commit && edit && edit.draft !== '') {
      const value = Number(edit.draft)
      if (Number.isSafeInteger(value) && value >= 0 && value !== edit.original) {
        if (edit.field.kind === 'resource') setResourceCounts(current => ({ ...current, [edit.field.key]: value }))
        else activity.setValue(edit.field.key, value)
      }
    }
    setEdit(null)
    requestAnimationFrame(() => {
      const trigger = editTrigger.current
      if (trigger?.isConnected) trigger.focus()
      else if (trigger) {
        const label = trigger.getAttribute('aria-label')
        Array.from(panelHost.current?.querySelectorAll<HTMLButtonElement>('button') ?? []).find(button => button.getAttribute('aria-label') === label)?.focus()
      }
      editTrigger.current = null
    })
  }
  const [helpOpen, setHelpOpen] = useState(false)
  const [noticeReason, setNoticeReason] = useState<'date-required' | 'date-expired' | 'insufficient-polaris' | 'calculation-error' | null>(null)
  const polarisNoticeOpen = noticeReason !== null
  const polarisNoticeFocus = useRef<HTMLElement | null>(null)
  const helpTrigger = useRef<HTMLButtonElement | null>(null)
  const panelHost = useRef<HTMLDivElement>(null)
  const openHelp = (trigger: HTMLButtonElement) => {
    helpTrigger.current = trigger
    setHelpOpen(true)
  }
  const closeHelp = useCallback(() => setHelpOpen(false), [])
  const closePolarisNotice = useCallback(() => setNoticeReason(null), [])
  const calculate = () => {
    if (calculationLock.current) return
    const selectedDate = calculatorDate.selectedDate
    if (!selectedDate) { setCalculationStatus('date-required'); setNoticeReason('date-required'); return }
    const predictionEnd = dateKey(selectedDate)
    if (predictionEnd < dateKey(shanghaiToday())) { setCalculationStatus('date-expired'); setNoticeReason('date-expired'); return }
    calculationLock.current = true
    setCalculationStatus('calculating')
    // Leave a frame for Chrome to paint the disabled button before synchronous work.
    calculationFrame.current = requestAnimationFrame(() => {
      calculationFrame.current = requestAnimationFrame(() => {
        calculationFrame.current = null
        try {
          const today = dateKey(shanghaiToday())
          if (predictionEnd < today) { setCalculationStatus('date-expired'); setNoticeReason('date-expired'); return }
          const outcome = calculateResourcesWithGate({
            current: resourceCounts,
            today,
            predictionEnd,
            activityDays: { monthly: activity.counts.monthly, ceremony: activity.counts.ceremony, premium: activity.counts.premium },
            wishLevel: activity.wishChoice,
            wishRemainingWeeks: activity.counts.wish,
            giftCounts,
          })
          if (outcome.status === 'success') {
            setCalculationResult({ resources: outcome.result.resources, predictionEnd })
            setCalculationStatus('success')
          } else if (outcome.reason === 'insufficient-polaris') {
            setNoticeReason('insufficient-polaris')
            setCalculationStatus('blocked')
          }
        } catch {
          setCalculationStatus('error')
          setNoticeReason('calculation-error')
        } finally {
          calculationLock.current = false
        }
      })
    })
  }
  useLayoutEffect(() => {
    if (helpOpen || !helpTrigger.current) return
    // Restore after React removes inert; a breakpoint change may replace the trigger.
    const trigger = helpTrigger.current.isConnected ? helpTrigger.current
      : panelHost.current?.querySelector<HTMLButtonElement>('button[aria-label="使用说明"]')
    trigger?.focus()
    helpTrigger.current = null
  }, [helpOpen, isTouchViewport])
  useLayoutEffect(() => {
    if (polarisNoticeOpen || !polarisNoticeFocus.current) return
    const trigger = polarisNoticeFocus.current
    const fallback = panelHost.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')
    const restoreTarget = trigger.isConnected && !trigger.closest('[inert]') ? trigger : fallback
    restoreTarget?.focus()
    if (restoreTarget) polarisNoticeFocus.current = restoreTarget
  }, [polarisNoticeOpen])
  const gift: GiftState = {
    counts: giftCounts,
    increment: id => setGiftCounts(counts => ({ ...counts, [id]: (counts[id] || 0) + 1 })),
    clear: id => setGiftCounts(counts => ({ ...counts, [id]: 0 })),
    reset: () => setGiftCounts({}),
  }
  const resource: ResourceState = {
    counts: resourceCounts,
    change: (key, delta) => setResourceCounts(counts => ({ ...counts, [key]: Math.max(0, counts[key] + delta) })),
    setValue: (key, value) => setResourceCounts(counts => ({ ...counts, [key]: value })),
    reset: () => setResourceCounts(initialResourceCounts),
  }
  const reset = () => {
    cancelCalculation()
    setCalculationStatus('idle')
    setCalculationResult(null)
    setNoticeReason(null)
    calculatorDate.reset()
    activity.reset()
    gift.reset()
    resource.reset()
  }
  return <>
    <div
      style={{ display: 'contents' }}
      inert={polarisNoticeOpen || undefined}
      onFocusCapture={event => {
        if (event.target instanceof HTMLElement) polarisNoticeFocus.current = event.target
      }}
    >
    <div className="calculator-scene-backdrop" onClick={onClose} />
    <div className={`calculator-scene-shield${isTouchViewport ? ' calculator-scene-shield--touch' : ''}`} />
    <div ref={panelHost} style={{ display: 'contents' }} inert={helpOpen || !!edit || undefined} data-calculation-status={calculationStatus}>
      {isTouchViewport
        ? <CalculatorTouchPanel onClose={onClose} onHelp={openHelp} activity={activity} gift={gift} resource={resource} calculatorDate={calculatorDate} onEdit={openEdit} result={calculationResult} onReset={reset} onCalculate={calculate} calculating={calculationStatus === 'calculating'} />
        : <CalculatorPanel onClose={onClose} onHelp={openHelp} activity={activity} gift={gift} resource={resource} calculatorDate={calculatorDate} onEdit={openEdit} result={calculationResult} onReset={reset} onCalculate={calculate} calculating={calculationStatus === 'calculating'} />}
    </div>
    {edit && <CalculatorQuantityInput touch={isTouchViewport} label={edit.field.kind === 'activity' ? ({ monthly: '月卡剩余天数', ceremony: '巡礼剩余天数', wish: '祈愿剩余周数', premium: '悦享卡剩余天数' } as const)[edit.field.key] : edit.label} value={edit.draft} maxDigits={edit.field.kind === 'resource' ? 9 : 4} onChange={draft => setEdit(current => current ? { ...current, draft } : null)} onCancel={() => closeEdit(false)} onCommit={() => closeEdit(true)} />}
    {helpOpen && <CalculatorHelp touch={isTouchViewport} onClose={closeHelp} />}
    </div>
    {polarisNoticeOpen && <CalculatorPolarisNotice onClose={closePolarisNotice} message={noticeReason === 'date-required' ? '请先选择日期' : noticeReason === 'date-expired' ? '所选日期已过期，请重新选择日期' : noticeReason === 'calculation-error' ? '计算出现问题，请重试' : undefined} />}
  </>
}

export default function BarPage() {
  const [open, setOpen] = useState(false)
  const isTouchViewport = useSyncExternalStore(subscribeToTouchViewport, getTouchViewportSnapshot, getTouchViewportServerSnapshot)
  return (
    <main className="bar-page" aria-label="杂草酒吧">
      <div className="bar-scene">
        <picture className="bar-scene__background">
          <source media="(max-width: 1024px)" srcSet={touchBackground} />
          <img src={background} alt="" />
        </picture>
        <div inert={open ? true : undefined}><CalculatorEntrance onOpen={() => setOpen(true)} /></div>
        {open && <CalculatorSession isTouchViewport={isTouchViewport} onClose={() => setOpen(false)} /> }
      </div>
    </main>
  )
}
