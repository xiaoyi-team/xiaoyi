import type { QuantityField } from './CalculatorQuantityInput'
import { useEffect, useRef, type CSSProperties } from 'react'
import type { ActivityKey, ActivityState, WishChoice } from './useActivityState'
import { dateKey, type CalculatorDateState } from './useCalculatorDate'
import closeCorner from '../../assets/bar/source/calculator/close-corner.png'
import decorationTopLeft from '../../assets/bar/source/calculator/panel-decoration-top-left.png'
import decorationBottomLeft from '../../assets/bar/source/calculator/panel-decoration-bottom-left.png'
import decorationBottomRight from '../../assets/bar/source/calculator/panel-decoration-bottom-right.png'
import monthlyCard from '../../assets/bar/source/calculator/activity-monthly-card.png'
import ceremony from '../../assets/bar/source/calculator/activity-ceremony.png'
import wish from '../../assets/bar/source/calculator/activity-wish.png'
import premiumCard from '../../assets/bar/source/calculator/activity-premium-card.png'
import buttonSparkle from '../../assets/bar/source/calculator/button-sparkle.png'
import buttonReset from '../../assets/bar/source/calculator/button-reset.png'
import './CalculatorPanel.css'
import { gifts, type GiftState } from './gifts'
import { resources, type ResourceKey, type ResourceCounts, type ResourceState } from './resources'

const results = [
  { key: 'ticket', x: 101, nameWidth: 110, valueWidth: 33, weight: 400, size: 54 },
  { key: 'polaris', x: 451, nameWidth: 66, valueWidth: 33, weight: 400, size: 54 },
  { key: 'quill', x: 801, nameWidth: 66, valueWidth: 35, weight: 700, size: 54 },
  { key: 'bear', x: 1151, nameWidth: 88, valueWidth: 33, weight: 400, size: 54 },
]

const activities = [
  { key: 'monthly', label: '超值月卡', image: monthlyCard, x: 100, width: 337, titleX: 153, titleY: 8, inputY: 46, fit: 'contain' },
  { key: 'ceremony', label: '诚挚巡礼', image: ceremony, x: 460, width: 339, titleX: 155, titleY: 9, inputY: 47, fit: 'contain' },
  { key: 'premium', label: '悦享卡', image: premiumCard, x: 1180, width: 335, titleX: 153, titleY: 8, inputY: 46, fit: 'cover' },
] as const

// Paths from 6802:141/145/147/149/151 and 6802:143/7539:18226.
const sparklePaths: Record<number, string> = {
  18: 'M 9 0 C 9.600000017881394 5.4 12.6 8.399999982118606 18 9 C 12.6 9.600000017881394 9.600000017881394 12.6 9 18 C 8.399999982118606 12.6 5.4 9.600000017881394 0 9 C 5.4 8.399999982118606 8.399999982118606 5.4 9 0 Z',
  9: 'M 4.5 0 C 4.800000008940697 2.7 6.3 4.199999991059303 9 4.5 C 6.3 4.800000008940697 4.800000008940697 6.3 4.5 9 C 4.199999991059303 6.3 2.7 4.800000008940697 0 4.5 C 2.7 4.199999991059303 4.199999991059303 2.7 4.5 0 Z',
  10: 'M 5 0 C 5.333333343267441 3 7 4.666666656732559 10 5 C 7 5.333333343267441 5.333333343267441 7 5 10 C 4.666666656732559 7 3 5.333333343267441 0 5 C 3 4.666666656732559 4.666666656732559 3 5 0 Z',
  12: 'M 6 0 C 6.400000011920929 3.6 8.4 5.599999988079071 12 6 C 8.4 6.400000011920929 6.400000011920929 8.4 6 12 C 5.599999988079071 8.4 3.6 6.400000011920929 0 6 C 3.6 5.599999988079071 5.599999988079071 3.6 6 0 Z',
}
const sparkles = [
  [184, 99, 18], [745, 714, 9], [569, 800, 9], [159, 875, 10], [1459, 880, 12],
  [577.0572509765625, 56.9517822265625, 18], [157.0572509765625, 57.9517822265625, 18],
] as const

export default function CalculatorPanel({ onClose, onHelp, activity, gift, resource, calculatorDate, onEdit, onReset, onCalculate, calculating, result }: { onClose: () => void; onHelp: (trigger: HTMLButtonElement) => void; activity: ActivityState; gift: GiftState; resource: ResourceState; calculatorDate: CalculatorDateState; onEdit: (field: QuantityField, label: string) => void; onReset: () => void; onCalculate: () => void; calculating: boolean; result: { resources: ResourceCounts; predictionEnd: string } | null }) {
  const giftCounts = gift.counts
  const giftWindowRef = useRef<HTMLDivElement>(null)
  const giftScrollFrame = useRef<number | null>(null)
  const giftScrollTarget = useRef(0)
  useEffect(() => () => { if (giftScrollFrame.current !== null) cancelAnimationFrame(giftScrollFrame.current) }, [])
  const scrollGifts = (direction: number) => {
    const window = giftWindowRef.current
    const cards = window?.querySelectorAll<HTMLElement>('.calculator-panel__gift')
    if (!window || !cards || cards.length < 2) return
    const step = cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left
    const start = window.scrollLeft
    const base = giftScrollFrame.current === null ? start : giftScrollTarget.current
    const target = Math.max(0, Math.min(window.scrollWidth - window.clientWidth, base + direction * step))
    giftScrollTarget.current = target
    if (giftScrollFrame.current !== null) cancelAnimationFrame(giftScrollFrame.current)
    if (globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches) { window.scrollLeft = target; giftScrollFrame.current = null; return }
    const started = performance.now()
    const animate = (now: number) => {
      const progress = Math.min((now - started) / 280, 1)
      window.scrollLeft = start + (target - start) * (1 - (1 - progress) ** 3)
      giftScrollFrame.current = progress < 1 ? requestAnimationFrame(animate) : null
    }
    giftScrollFrame.current = requestAnimationFrame(animate)
  }
  const { selectedDate, selectDate, dateText, resultDateText, calendarOpen, visibleMonth, setVisibleMonth, today, triggerRef, calendarRef, end, openCalendar, closeCalendar, trapFocus, firstWeekday, count, prev, next, monthKey } = calculatorDate
  return (
    <section className="calculator-panel" aria-label="资源计算器静态预览">
      <div className="calculator-panel__base" />
      <div className="calculator-panel__inner-gold" />
      <div className="calculator-panel__inner-light" />
      {sparkles.slice(0, 5).map(([x, y, size], index) => (
        <svg key={index} className="calculator-panel__sparkle" aria-hidden="true"
          style={{ '--x': x, '--y': y, '--size': size } as CSSProperties}
          viewBox={`0 0 ${size} ${size}`}>
          <path d={sparklePaths[size]} fill="#fff0cf" />
        </svg>
      ))}
      <div className="calculator-panel__badge" />
      <div className="calculator-panel__heading">资源计算器</div>
      <div className="calculator-panel__subtitle">Resource Calculator</div>
      <button type="button" className="calculator-panel__help" aria-label="使用说明" onClick={event => onHelp(event.currentTarget)} tabIndex={calendarOpen ? -1 : 0}><svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="14.25" /><path d="M14.25 12.75 C14.6 11.08 16.3 10.07 18.61 10.43 C20.3 10.77 21.75 12.3 21.75 14.25 C21.75 17.25 18 17.25 18 20.25 M18 24.9 L18 25.05" /></svg></button>
      {sparkles.slice(5).map(([x, y, size], index) => (
        <svg key={index} className="calculator-panel__sparkle" aria-hidden="true"
          style={{ '--x': x, '--y': y, '--size': size } as CSSProperties}
          viewBox={`0 0 ${size} ${size}`}>
          <path d={sparklePaths[size]} fill="#fff0cf" />
        </svg>
      ))}
      <img className="calculator-panel__corner" src={closeCorner} alt="" />
      <button type="button" className="calculator-panel__close-hit" aria-label="关闭资源计算器" onClick={onClose} tabIndex={calendarOpen ? -1 : 0} />
      <div className="calculator-panel__resource-back" />
      <div className="calculator-panel__resource-label-back" />
      <div className="calculator-panel__resource-label"><span className="calculator-panel__unresolved" aria-hidden="true">✦<img src={buttonSparkle} alt="" /></span> 当前拥有资源</div>
      {resources.map(({ key, label, image, pcX }) => (
        <div key={key} className="calculator-panel__resource" style={{ '--resource-x': pcX } as CSSProperties}>
          <img className="calculator-panel__icon" src={image} alt="" />
          <span className="calculator-panel__name">{label}</span>
          <div className="calculator-panel__stepper" />
          <div className="calculator-panel__input-back" />
          <span className="calculator-panel__minus">−</span>
          <span className="calculator-panel__value">{resource.counts[key]}</span>
          <span className="calculator-panel__plus">+</span>
          <button type="button" className="calculator-panel__input-hit calculator-quantity-trigger" aria-label={`输入${label}`} tabIndex={calendarOpen ? -1 : 0} onClick={() => onEdit({ kind: 'resource', key }, label)} />
          <button type="button" className="calculator-panel__minus-hit" aria-label={`${label}减少`} tabIndex={calendarOpen ? -1 : 0} onClick={() => resource.change(key as ResourceKey, -1)} />
          <button type="button" className="calculator-panel__plus-hit" aria-label={`${label}增加`} tabIndex={calendarOpen ? -1 : 0} onClick={() => resource.change(key as ResourceKey, 1)} />
        </div>
      ))}
      <div className="calculator-panel__date-back" />
      <div className="calculator-panel__date-label-back" />
      <div className="calculator-panel__date-label"><span className="calculator-panel__unresolved" aria-hidden="true">✦<img src={buttonSparkle} alt="" /></span> 截止日期</div>
      <div className="calculator-panel__date-input" />
      <div className="calculator-panel__date-text">{dateText}</div>
      <svg className="calculator-panel__date-calendar" viewBox="0 0 28 28" aria-hidden="true">
        <path d="M 3.5 0 L 17.5 0 C 19.432996650536854 0 21 1.567003296091329 21 3.4999998807907104 L 21 15.166666150093079 C 21 17.09966273479246 19.432996650536854 18.66666603088379 17.5 18.66666603088379 L 3.5 18.66666603088379 C 1.5670033494631448 18.66666603088379 0 17.09966273479246 0 15.166666150093079 L 0 3.4999998807907104 C 0 1.567003296091329 1.5670033494631448 0 3.5 0 Z" transform="translate(3.5 5.833333492279053)" />
        <path d="M 15.166666666666668 0 L 15.166666666666668 4.666666303362165 M 5.833333333333334 0 L 5.833333333333334 4.666666303362165 M 0 8.166666030883789 L 21 8.166666030883789 M 5.833333333333334 12.833332334245954 L 8.166666666666668 12.833332334245954 M 12.833333333333334 12.833332334245954 L 15.166666666666668 12.833332334245954 M 5.833333333333334 16.333332061767578 L 8.166666666666668 16.333332061767578" transform="translate(3.5 3.5)" />
      </svg>
      <svg className="calculator-panel__date-arrow" viewBox="0 0 18 18" aria-hidden="true"><path d="M 0 0 L 6 6 L 12 0" transform="translate(3 6)" /></svg>
      <button ref={triggerRef} type="button" className="calculator-panel__date-hit" aria-label="选择截止日期" aria-expanded={calendarOpen} aria-haspopup="dialog" onClick={openCalendar} tabIndex={calendarOpen ? -1 : 0} />
      <div className="calculator-panel__activity-back" />
      <div className="calculator-panel__activity-label-back" />
      <div className="calculator-panel__activity-label"><span className="calculator-panel__unresolved" aria-hidden="true">✦<img src={buttonSparkle} alt="" /></span> 月卡 / 长期活动</div>
      {activities.map(({ key, label, image, x, width, titleX, titleY, inputY, fit }) => (
        <div key={label} className="calculator-panel__activity" style={{ '--activity-x': x, '--activity-width': width, '--title-x': titleX, '--title-y': titleY, '--input-y': inputY } as CSSProperties}>
          <img className="calculator-panel__activity-image" src={image} alt="" style={{ objectFit: fit }} />
          <span className="calculator-panel__activity-name">{label}</span>
          <div className="calculator-panel__activity-input">
            <div className="calculator-panel__activity-input-base" />
            <span className="calculator-panel__activity-minus">−</span><span className="calculator-panel__activity-value">{activity.counts[key]}</span><span className="calculator-panel__activity-plus">+</span><span className="calculator-panel__activity-unit">天</span>
            <button type="button" className="calculator-panel__activity-hit calculator-panel__activity-hit-minus" aria-label={`${label}减少`} tabIndex={calendarOpen ? -1 : 0} onClick={() => activity.change(key as ActivityKey, -1)} /><button type="button" className="calculator-panel__activity-hit calculator-panel__activity-hit-value" aria-label={`输入${label}`} tabIndex={calendarOpen ? -1 : 0} onClick={() => onEdit({ kind: 'activity', key }, label)} /><button type="button" className="calculator-panel__activity-hit calculator-panel__activity-hit-plus" aria-label={`${label}增加`} tabIndex={calendarOpen ? -1 : 0} onClick={() => activity.change(key as ActivityKey, 1)} />
          </div>
        </div>
      ))}
      <div className="calculator-panel__wish">
        <img className="calculator-panel__wish-image" src={wish} alt="" />
        <span className="calculator-panel__wish-name">隽心祈愿</span>
        <div className="calculator-panel__wish-input">
          <div className="calculator-panel__wish-input-base" />
          <span className="calculator-panel__wish-minus">−</span><span className="calculator-panel__wish-value">{activity.counts.wish}</span><span className="calculator-panel__wish-plus">+</span><span className="calculator-panel__wish-unit">周</span>
          <button type="button" className="calculator-panel__wish-hit calculator-panel__wish-hit-minus" aria-label="隽心祈愿减少" tabIndex={calendarOpen ? -1 : 0} onClick={() => activity.change('wish', -1)} /><button type="button" className="calculator-panel__wish-hit calculator-panel__wish-hit-value" aria-label="输入隽心祈愿" tabIndex={calendarOpen ? -1 : 0} onClick={() => onEdit({ kind: 'activity', key: 'wish' }, '隽心祈愿')} /><button type="button" className="calculator-panel__wish-hit calculator-panel__wish-hit-plus" aria-label="隽心祈愿增加" tabIndex={calendarOpen ? -1 : 0} onClick={() => activity.change('wish', 1)} />
        </div>
        <div className="calculator-panel__wish-choices">{([1, 2, 3] as WishChoice[]).map(n => <button type="button" key={n} aria-label={`祈愿${n}次`} aria-pressed={activity.wishChoice === n} tabIndex={calendarOpen ? -1 : 0} onClick={() => activity.setWishChoice(n)} className={`calculator-panel__wish-choice${n === activity.wishChoice ? ' calculator-panel__wish-choice--selected' : ''}`}>{n}</button>)}</div>
      </div>
      <div className="calculator-panel__gift-back" />
      <div className="calculator-panel__gift-label-back" />
      <div className="calculator-panel__gift-label"><span className="calculator-panel__unresolved" aria-hidden="true">✦<img src={buttonSparkle} alt="" /></span> 礼包选择</div>
      <span className="calculator-panel__gift-arrow calculator-panel__gift-arrow--left" aria-hidden="true">‹</span>
      <span className="calculator-panel__gift-arrow calculator-panel__gift-arrow--right" aria-hidden="true">›</span>
      <button type="button" className="calculator-panel__gift-arrow-hit calculator-panel__gift-arrow-hit--left" aria-label="向左浏览礼包" tabIndex={calendarOpen ? -1 : 0} onClick={() => scrollGifts(-1)} />
      <button type="button" className="calculator-panel__gift-arrow-hit calculator-panel__gift-arrow-hit--right" aria-label="向右浏览礼包" tabIndex={calendarOpen ? -1 : 0} onClick={() => scrollGifts(1)} />
      <div ref={giftWindowRef} className="calculator-panel__gift-window">
        <div className="calculator-panel__gift-track">
          {gifts.map(({ id, title, price, image, weight, lineHeight }) => (
            <div key={id} data-figma-node={id} data-count={giftCounts[id] || undefined} className={`calculator-panel__gift${giftCounts[id] ? ' calculator-panel__gift--selected' : ''}`} style={{ '--gift-weight': weight, '--gift-line-height': lineHeight } as CSSProperties}>
              <span className="calculator-panel__gift-title">{title}</span>
              <img className="calculator-panel__gift-image" src={image} alt="" />
              {price !== null && <><div className="calculator-panel__gift-price-back" /><span className="calculator-panel__gift-price">{price}</span></>}
              <div className="calculator-panel__gift-checkbox" aria-hidden="true" />
              <svg className="calculator-panel__gift-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M 0 9 L 6 15 L 19 0" transform="translate(3 3)" /></svg>
              <button type="button" className="calculator-panel__gift-action" aria-label={`${title.replace(/\n/g, '')}，数量 ${giftCounts[id] || 0}，增加一份`} tabIndex={calendarOpen ? -1 : 0} onClick={() => gift.increment(id)} />
              {!!giftCounts[id] && <button type="button" className="calculator-panel__gift-clear" aria-label={`清空${title.replace(/\n/g, '')}`} tabIndex={calendarOpen ? -1 : 0} onClick={event => { event.stopPropagation(); gift.clear(id) }} />}
            </div>
          ))}
        </div>
      </div>
      <div className="calculator-panel__result-back" />
      <div className="calculator-panel__result-label-back" />
      <div className="calculator-panel__result-label"><span className="calculator-panel__unresolved" aria-hidden="true">✦<img src={buttonSparkle} alt="" /></span> 预测结果</div>
      <div className="calculator-panel__result-date-back" />
      <div className="calculator-panel__result-date"><span className="calculator-panel__unresolved" aria-hidden="true">✦<img src={buttonSparkle} alt="" /></span> {result ? `至 ${result.predictionEnd} 可获得总资源` : resultDateText}</div>
      {results.map(({ key, x, nameWidth, valueWidth, weight, size }) => {
        const { label, image } = resources.find(item => item.key === key)!
        return <div key={key} className="calculator-panel__result" style={{ '--result-x': x, '--result-name-width': nameWidth, '--result-value-width': valueWidth, '--result-weight': weight, '--result-size': size } as CSSProperties}>
          <img className="calculator-panel__result-icon" src={image} alt="" />
          <span className="calculator-panel__result-name">{label}</span>
          <span className="calculator-panel__result-value" style={{ fontSize: `calc(${Math.min(size, 280 / String(result?.resources[key as ResourceKey] ?? 0).length)} * var(--cp-unit))` }}>{result?.resources[key as ResourceKey] ?? 0}</span>
        </div>
      })}
      <div className="calculator-panel__reset-back" />
      <div className="calculator-panel__reset-text"><span className="calculator-panel__button-icon calculator-panel__button-icon--reset"><img src={buttonReset} alt="" /></span>{'  重置'}</div>
      <button type="button" className="calculator-panel__reset-hit" aria-label="重置" tabIndex={calendarOpen ? -1 : 0} onClick={onReset} />
      <div className="calculator-panel__calculate-back" />
      {calculating ? <div className="calculator-panel__loading" aria-hidden="true"><svg className="calculator-loading__spinner" viewBox="0 0 28 28" aria-hidden="true"><path d="M14 2 A12 12 0 1 1 2 14" fill="none" stroke="#FFE8B8" strokeWidth="3" strokeLinecap="round" /></svg><span>正在计算…</span></div> : <div className="calculator-panel__calculate-text"><span className="calculator-panel__button-icon calculator-panel__button-icon--sparkle"><img src={buttonSparkle} alt="" /></span>{'  开始计算  '}<span className="calculator-panel__button-icon calculator-panel__button-icon--sparkle"><img src={buttonSparkle} alt="" /></span></div>}
      <button className="calculator-panel__calculate-hit" type="button" aria-label="开始计算" disabled={calculating || calendarOpen} aria-busy={calculating} onClick={onCalculate} />
      <img className="calculator-panel__decoration-bottom-left" src={decorationBottomLeft} alt="" />
      <img className="calculator-panel__decoration-bottom-right" src={decorationBottomRight} alt="" />
      <img className="calculator-panel__decoration-top-left" src={decorationTopLeft} alt="" />
      {calendarOpen && <div className="calculator-calendar-layer">
        <div className="calculator-calendar-backdrop" onClick={closeCalendar} />
        <div ref={calendarRef} className="calculator-calendar" role="dialog" aria-modal="true" aria-label="选择截止日期" tabIndex={-1} onKeyDown={trapFocus}>
          <button type="button" className="calculator-calendar__prev" aria-label="上个月" disabled={monthKey(prev) < monthKey(today)} onClick={() => setVisibleMonth({ ...prev, day: 1 })}>‹</button>
          <div className="calculator-calendar__heading">{visibleMonth.year} 年 {visibleMonth.month} 月</div>
          <button type="button" className="calculator-calendar__next" aria-label="下个月" disabled={monthKey(next) > monthKey(end)} onClick={() => setVisibleMonth({ ...next, day: 1 })}>›</button>
          <div className="calculator-calendar__week">{'日一二三四五六'.split('').map(d => <span key={d}>{d}</span>)}</div>
          <div className="calculator-calendar__grid">
            {Array.from({ length: firstWeekday }, (_, i) => <span key={`empty-${i}`} />)}
            {Array.from({ length: count }, (_, i) => { const date = { year: visibleMonth.year, month: visibleMonth.month, day: i + 1 }; const key = dateKey(date); return <button key={key} type="button" aria-label={key} aria-pressed={selectedDate ? dateKey(selectedDate) === key : false} disabled={key < dateKey(today) || key > dateKey(end)} onClick={() => selectDate(date)}>{i + 1}</button> })}
          </div>
        </div>
      </div>}
    </section>
  )
}
