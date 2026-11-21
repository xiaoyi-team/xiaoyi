import { useLayoutEffect, useRef } from 'react'
import decorationTopLeft from '../../assets/bar/source/calculator/panel-decoration-top-left.png'
import decorationBottomRight from '../../assets/bar/source/calculator/panel-decoration-bottom-right.png'
import './CalculatorHelp.css'

const sections = [
  ['01  资源计算方式', '需要按照弹窗内容输入现有资源、截止日期、月卡/礼包购买情况，点击开始计算即可获得计算结果。'],
  ['02  资源计算内容', '仅预测普通十连签收券、北极星、羽毛笔、小熊星座，不包含其他资源。'],
  ['03  礼包可以重复选择', '可同时选择多种礼包。每点击一次礼包卡片，该礼包计算数量加 1，左上角将显示选择的数量；点击右下角按钮，可取消该礼包并将数量清零。'],
  ['04  资源计算默认游戏全勤', '计算默认用户在预测期间每天完成日常任务，并领取相应奖励。漏登、漏领或游戏规则变化可能使实际所得与预测不同，结果仅供规划参考。'],
  ['05  退出后不会保留数据', '计算完成后，本次输入和礼包选择仍会保留。点击重置会清空数据；关闭弹窗后不保存，再次打开时从初始状态开始。'],
] as const

export default function CalculatorHelp({ touch, onClose }: { touch: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    // Absolute children start inside the border; Figma coordinates start at the frame edge.
    const syncBorderOffset = () => {
      dialog.style.setProperty('--help-border-offset', getComputedStyle(dialog).borderLeftWidth)
      if (closeRef.current) dialog.style.setProperty('--help-close-border-offset', getComputedStyle(closeRef.current).borderLeftWidth)
    }
    syncBorderOffset()
    const observer = new ResizeObserver(syncBorderOffset)
    observer.observe(dialog)
    closeRef.current?.focus()
    const keepFocusInside = (event: FocusEvent) => {
      if (!dialog.contains(event.target as Node)) closeRef.current?.focus()
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onClose()
      } else if (event.key === 'Tab') {
        const targets = [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]')]
        const index = targets.indexOf(document.activeElement as HTMLElement)
        const next = event.shiftKey ? (index <= 0 ? targets.length - 1 : index - 1) : (index + 1) % targets.length
        event.preventDefault()
        targets[next]?.focus()
      }
    }
    document.addEventListener('keydown', handleKey, true)
    document.addEventListener('focusin', keepFocusInside)
    return () => {
      observer.disconnect()
      document.removeEventListener('keydown', handleKey, true)
      document.removeEventListener('focusin', keepFocusInside)
    }
  }, [onClose, touch])
  return <div className={`calculator-help-layer${touch ? ' calculator-help-layer--touch' : ''}`} onClick={onClose}>
    <section ref={dialogRef} className="calculator-help" role="dialog" aria-modal="true" aria-labelledby="calculator-help-title" onClick={event => event.stopPropagation()}>
      <div className="calculator-help__edge calculator-help__edge--outer" aria-hidden="true" />
      <div className="calculator-help__edge calculator-help__edge--inner" aria-hidden="true" />
      <img className="calculator-help__decoration calculator-help__decoration--top" src={decorationTopLeft} alt="" />
      <img className="calculator-help__decoration calculator-help__decoration--bottom" src={decorationBottomRight} alt="" />
      <h2 id="calculator-help-title" className="calculator-help__title">✦  使用说明  ✦</h2>
      <div className="calculator-help__body" tabIndex={0}>
        {sections.map(([title, body]) => <div className="calculator-help__item" key={title}>
          <h3>{!touch && title === '03  礼包可以重复选择' ? '03 礼包可以重复选择' : title}</h3><p>{body}</p>
        </div>)}
      </div>
      <button ref={closeRef} type="button" className="calculator-help__close" onClick={onClose}><span className="calculator-help__close-label">✦  我知道了  ✦</span></button>
    </section>
  </div>
}
