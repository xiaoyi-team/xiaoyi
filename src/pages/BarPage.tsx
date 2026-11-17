import background from '../assets/bar/source/background/pc-background.png'
import touchBackground from '../assets/bar/source/background/touch-background.png'
import CalculatorEntrance from '../features/bar/CalculatorEntrance'
import CalculatorPanel from '../features/bar/CalculatorPanel'
import CalculatorTouchPanel from '../features/bar/CalculatorTouchPanel'
import CalculatorHelp from '../features/bar/CalculatorHelp'
import type { GiftState } from '../features/bar/gifts'
import { initialResourceCounts, type ResourceState } from '../features/bar/resources'
import { useActivityState } from '../features/bar/useActivityState'
import { useCalculatorDate } from '../features/bar/useCalculatorDate'
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
  const [helpOpen, setHelpOpen] = useState(false)
  const helpTrigger = useRef<HTMLButtonElement | null>(null)
  const panelHost = useRef<HTMLDivElement>(null)
  const openHelp = (trigger: HTMLButtonElement) => {
    helpTrigger.current = trigger
    setHelpOpen(true)
  }
  const closeHelp = useCallback(() => setHelpOpen(false), [])
  useLayoutEffect(() => {
    if (helpOpen || !helpTrigger.current) return
    // Restore after React removes inert; a breakpoint change may replace the trigger.
    const trigger = helpTrigger.current.isConnected ? helpTrigger.current
      : panelHost.current?.querySelector<HTMLButtonElement>('button[aria-label="使用说明"]')
    trigger?.focus()
    helpTrigger.current = null
  }, [helpOpen, isTouchViewport])
  const gift: GiftState = {
    counts: giftCounts,
    increment: id => setGiftCounts(counts => ({ ...counts, [id]: (counts[id] || 0) + 1 })),
    clear: id => setGiftCounts(counts => ({ ...counts, [id]: 0 })),
    reset: () => setGiftCounts({}),
  }
  const resource: ResourceState = {
    counts: resourceCounts,
    change: (key, delta) => setResourceCounts(counts => ({ ...counts, [key]: Math.max(0, counts[key] + delta) })),
    reset: () => setResourceCounts(initialResourceCounts),
  }
  return <>
    <div className="calculator-scene-backdrop" onClick={onClose} />
    <div className={`calculator-scene-shield${isTouchViewport ? ' calculator-scene-shield--touch' : ''}`} />
    <div ref={panelHost} style={{ display: 'contents' }} inert={helpOpen || undefined}>
      {isTouchViewport
        ? <CalculatorTouchPanel onClose={onClose} onHelp={openHelp} activity={activity} gift={gift} resource={resource} calculatorDate={calculatorDate} />
        : <CalculatorPanel onClose={onClose} onHelp={openHelp} activity={activity} gift={gift} resource={resource} calculatorDate={calculatorDate} />}
    </div>
    {helpOpen && <CalculatorHelp touch={isTouchViewport} onClose={closeHelp} />}
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
