import type { QuantityField } from './CalculatorQuantityInput'
import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import activityCeremony from '../../assets/bar/source/calculator/activity-ceremony.png'
import activityMonthlyCard from '../../assets/bar/source/calculator/activity-monthly-card.png'
import activityPremiumCard from '../../assets/bar/source/calculator/activity-premium-card.png'
import activityWish from '../../assets/bar/source/calculator/activity-wish.png'
import closeCorner from '../../assets/bar/source/calculator/close-corner.png'
import decorationBottomLeft from '../../assets/bar/source/calculator/panel-decoration-bottom-left.png'
import decorationBottomRight from '../../assets/bar/source/calculator/panel-decoration-bottom-right.png'
import decorationTopLeft from '../../assets/bar/source/calculator/panel-decoration-top-left.png'
import { gifts, type GiftState } from './gifts'
import type { ActivityKey, ActivityState, WishChoice } from './useActivityState'
import { resources, type ResourceKey, type ResourceCounts, type ResourceState } from './resources'
import buttonSparkle from '../../assets/bar/source/calculator/button-sparkle.png'
import buttonReset from '../../assets/bar/source/calculator/button-reset.png'
import './CalculatorTouchPanel.css'
import { dateKey, type CalculatorDateState } from './useCalculatorDate'

const contentRegions = [
  { name: '当前拥有资源', height: 86 },
  { name: '截止日期', height: 52 },
  { name: '活动', height: 104 },
  { name: '礼包', height: 140 },
  { name: '预测结果', height: 108 },
] as const

export default function CalculatorTouchPanel({ onClose, onHelp, activity, gift, resource, calculatorDate, onEdit, onReset, onCalculate, calculating, result }: { onClose: () => void; onHelp: (trigger: HTMLButtonElement) => void; activity: ActivityState; gift: GiftState; resource: ResourceState; calculatorDate: CalculatorDateState; onEdit: (field: QuantityField, label: string) => void; onReset: () => void; onCalculate: () => void; calculating: boolean; result: { resources: ResourceCounts; predictionEnd: string } | null }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const previousResult = useRef(result)
  useLayoutEffect(() => {
    if (previousResult.current === result) return
    previousResult.current = result
    const container = scrollRef.current
    if (!container) return
    if (!result) { container.scrollTop = 0; return }
    const target = container.querySelector<HTMLElement>('.touch-results')
    if (target) container.scrollTo({
      top: container.scrollTop + target.getBoundingClientRect().bottom - container.getBoundingClientRect().bottom,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }, [result])
  const { selectedDate, selectDate, dateText, resultDateText, calendarOpen, visibleMonth, setVisibleMonth, today, triggerRef, calendarRef, end, openCalendar, closeCalendar, trapFocus, firstWeekday, count, prev, next, monthKey } = calculatorDate
  return (
    <section className="calculator-touch-panel" aria-label="资源计算器" data-result-date-description={result ? `至 ${result.predictionEnd} 可获得总资源` : resultDateText}>
      <div className="calculator-touch-panel__base" aria-hidden="true" />
      <div className="calculator-touch-panel__inner-gold" aria-hidden="true" />
      <div className="calculator-touch-panel__inner-light" aria-hidden="true" />

      <img className="calculator-touch-panel__decoration calculator-touch-panel__decoration--top-left" src={decorationTopLeft} alt="" draggable={false} />
      <img className="calculator-touch-panel__decoration calculator-touch-panel__decoration--bottom-left" src={decorationBottomLeft} alt="" draggable={false} />
      <img className="calculator-touch-panel__decoration calculator-touch-panel__decoration--bottom-right" src={decorationBottomRight} alt="" draggable={false} />
      <img className="calculator-touch-panel__decoration calculator-touch-panel__decoration--top-right" src={closeCorner} alt="" draggable={false} />

      <div className="calculator-touch-panel__title-badge" aria-hidden="true" />
      <div className="calculator-touch-panel__title">资源计算器</div>
      <div className="calculator-touch-panel__subtitle" lang="en">Resource Calculator</div>
      <button type="button" className="calculator-touch-panel__help" aria-label="使用说明" onClick={event => onHelp(event.currentTarget)} tabIndex={calendarOpen ? -1 : 0}><svg viewBox="0 0 25 25" aria-hidden="true"><path transform="translate(2.6041667461395264 2.6041667461395264)" d="M 19.79166603088379 9.895833015441895 C 19.79166603088379 15.361150605746987 15.361150605746987 19.79166603088379 9.895833015441895 19.79166603088379 C 4.430515425136802 19.79166603088379 0 15.361150605746987 0 9.895833015441895 C 0 4.430515425136802 4.430515425136802 0 9.895833015441895 0 C 15.361150605746987 0 19.79166603088379 4.430515425136802 19.79166603088379 9.895833015441895 Z" /><path transform="translate(9.895833015441895 7.187567710876465)" d="M 0 1.6666708282468223 C 0.24080803421400246 1.0887315751078606 0.6744159591377354 0.6120753927926319 1.227050063704428 0.31780023870025526 C 1.7796841682711204 0.02352508460787861 2.417205223695976 -0.07019017521310296 3.0311476122506975 0.05259830627500639 C 3.645090000805419 0.17538678776311573 4.197527223773829 0.5070938847182933 4.594468217235862 0.991284063265004 C 4.991409210697896 1.4754742418117146 5.208333492279053 2.0822366565006796 5.208333492279053 2.708337519241903 C 5.208333492279053 4.791670901232065 2.6041667461395264 4.791670652879372 2.6041667461395264 6.875004034869534 M 2.6041667461395264 10.104171671023977 L 2.6041667461395264 10.208338737487791" /></svg></button>
      {[{ x: 218.842331, y: 5.651148 }, { x: 55.042282, y: 6.041147 }].map(({ x, y }) => (
        <svg key={x} className="calculator-touch-panel__title-sparkle" aria-hidden="true" viewBox="0 0 18 18" style={{ '--sparkle-x': x, '--sparkle-y': y } as CSSProperties}>
          <path fill="#fff0cf" d="M 9 0 C 9.600000017881394 5.4 12.6 8.399999982118606 18 9 C 12.6 9.600000017881394 9.600000017881394 12.6 9 18 C 8.399999982118606 12.6 5.4 9.600000017881394 0 9 C 5.4 8.399999982118606 8.399999982118606 5.4 9 0 Z" />
        </svg>
      ))}

      <div ref={scrollRef} className="calculator-touch-panel__scroll" role="region" aria-label="计算器内容" tabIndex={calendarOpen ? -1 : 0}>
        <div className="calculator-touch-panel__content">
          {contentRegions.map(({ name, height }) => (
            <div
              key={name}
              className="calculator-touch-panel__content-slot"
              data-content-region={name}
              style={{ '--slot-height': `calc(${height} * var(--ct-unit))` } as CSSProperties}
            >
              {name === '当前拥有资源' && <div className="touch-resources">
                <div className="touch-resources__panel" aria-hidden="true" />
                <div className="touch-resources__label-back" aria-hidden="true" />
                <div className="touch-resources__label"><span className="calculator-touch-panel__unresolved" aria-hidden="true">✦<img src={buttonSparkle} alt="" /></span> 当前拥有资源</div>
                {resources.map(({ key, label, image, touchX }) => <div key={key} className="touch-resources__item" style={{ '--resource-x': touchX } as CSSProperties}>
                  <img className="touch-resources__icon" src={image} alt="" />
                  <span className="touch-resources__name">{label}</span>
                  <div className="touch-resources__stepper" aria-hidden="true" />
                  <div className="touch-resources__value-back" aria-hidden="true" />
                  <span className="touch-resources__minus" aria-hidden="true">−</span>
                  <span className="touch-resources__value" aria-live="polite">{resource.counts[key]}</span>
                  <span className="touch-resources__plus" aria-hidden="true">+</span>
                  <button type="button" className="touch-resources__hit touch-resources__hit--value" aria-label={`输入${label}`} tabIndex={calendarOpen ? -1 : 0} onClick={() => onEdit({ kind: 'resource', key }, label)} />
                  <button type="button" className="touch-resources__hit touch-resources__hit--minus" aria-label={`${label}减少`} tabIndex={calendarOpen ? -1 : 0} onClick={() => resource.change(key as ResourceKey, -1)} />
                  <button type="button" className="touch-resources__hit touch-resources__hit--plus" aria-label={`${label}增加`} tabIndex={calendarOpen ? -1 : 0} onClick={() => resource.change(key as ResourceKey, 1)} />
                </div>)}
              </div>}
              {name === '活动' && <div className="touch-activity">
                <div className="touch-activity__panel" /><div className="touch-activity__label-back" /><div className="touch-activity__label"><span className="calculator-touch-panel__unresolved" aria-hidden="true">✦<img src={buttonSparkle} alt="" /></span> 月卡 / 活动开通</div>
                {([
                  { key: 'monthly', label: '超值月卡', x: 8, image: activityMonthlyCard, imageHeight: 26.67, imageTop: 5, imageFit: 'contain' },
                  { key: 'ceremony', label: '诚挚巡礼', x: 148, image: activityCeremony, imageHeight: 26.67, imageTop: 5, imageFit: 'contain' },
                  { key: 'wish', label: '隽心祈愿', x: 288, image: activityWish, imageHeight: 29.09, imageTop: 5, imageFit: 'contain' },
                  { key: 'premium', label: '悦享卡', x: 428, image: activityPremiumCard, imageHeight: 26.67, imageTop: 6, imageFit: 'cover' },
                ] as const).map(({ key, label, x, image, imageHeight, imageTop, imageFit }) => <div key={key} className="touch-activity__item" style={{ '--item-x': x, '--activity-image-height': imageHeight, '--activity-image-top': imageTop, '--activity-image-fit': imageFit } as CSSProperties}>
                  <img className="touch-activity__image" src={image} alt="" draggable={false} />
                  <span className="touch-activity__name">{label}</span>
                  <div className="touch-activity__input"><div className="touch-activity__input-back" /><span className="touch-activity__minus">−</span><span className="touch-activity__value">{activity.counts[key]}</span><span className="touch-activity__plus">+</span><span className="touch-activity__unit">{key === 'wish' ? '周' : '天'}</span>
                    <button type="button" className="touch-activity__hit touch-activity__hit--value" aria-label={`输入${label}`} tabIndex={calendarOpen ? -1 : 0} onClick={() => onEdit({ kind: 'activity', key }, label)} />
                    <button type="button" className="touch-activity__hit touch-activity__hit--minus" aria-label={`${label}减少`} tabIndex={calendarOpen ? -1 : 0} onClick={() => activity.change(key as ActivityKey, -1)} />
                    <button type="button" className="touch-activity__hit touch-activity__hit--plus" aria-label={`${label}增加`} tabIndex={calendarOpen ? -1 : 0} onClick={() => activity.change(key as ActivityKey, 1)} />
                  </div>
                  {key === 'wish' && <div className="touch-activity__choices">{([1,2,3] as WishChoice[]).map(n => <button type="button" key={n} aria-label={`祈愿${n}次`} aria-pressed={activity.wishChoice === n} tabIndex={calendarOpen ? -1 : 0} onClick={() => activity.setWishChoice(n)} className={`touch-activity__choice${activity.wishChoice === n ? ' touch-activity__choice--selected' : ''}`}>{n}</button>)}</div>}
                </div>)}
              </div>}
              {name === '礼包' && <div className="touch-gifts">
                <div className="touch-gifts__panel" aria-hidden="true" />
                <div className="touch-gifts__label-back" aria-hidden="true" />
                <div className="touch-gifts__label"><span className="calculator-touch-panel__unresolved" aria-hidden="true">✦<img src={buttonSparkle} alt="" /></span> 礼包选择</div>
                <div className="touch-gifts__window" role="region" aria-label="礼包横向浏览" tabIndex={calendarOpen ? -1 : 0}>
                  <div className="touch-gifts__track">
                    {gifts.map(({ id, title, price, image, weight, lineHeight }) => <div key={id} className={`touch-gifts__card${gift.counts[id] ? ' touch-gifts__card--selected' : ''}`} data-figma-node={id} data-count={gift.counts[id] || undefined} style={{ '--gift-weight': weight, '--gift-line-height': lineHeight } as CSSProperties}>
                      <span className="touch-gifts__title">{title}</span>
                      <img className="touch-gifts__image" src={image} alt="" draggable={false} />
                      {price !== null && <><div className="touch-gifts__price-back" /><span className="touch-gifts__price">{price}</span></>}
                      <div className="touch-gifts__checkbox" aria-hidden="true" />
                      <svg className="touch-gifts__check" viewBox="0 0 24 24" aria-hidden="true"><path d="M 0 9 L 6 15 L 19 0" transform="translate(3 3)" /></svg>
                      <button type="button" className="touch-gifts__action" aria-label={`${title.replace(/\n/g, '')}，数量 ${gift.counts[id] || 0}，增加一份`} tabIndex={calendarOpen ? -1 : 0} onClick={() => gift.increment(id)} />
                      {!!gift.counts[id] && <button type="button" className="touch-gifts__clear" aria-label={`清空${title.replace(/\n/g, '')}`} tabIndex={calendarOpen ? -1 : 0} onClick={event => { event.stopPropagation(); gift.clear(id) }} />}
                    </div>)}
                  </div>
                </div>
              </div>}
              {name === '预测结果' && <div className="touch-results" aria-label="预测结果">
                <div className="touch-results__panel" aria-hidden="true" />
                <div className="touch-results__title-back" aria-hidden="true" />
                <div className="touch-results__title"><span className="calculator-touch-panel__unresolved" aria-hidden="true">✦<img src={buttonSparkle} alt="" /></span> 预测结果</div>
                <div className="touch-results__date-back" aria-hidden="true" />
                <div className="touch-results__date"><span className="calculator-touch-panel__unresolved" aria-hidden="true">✦<img src={buttonSparkle} alt="" /></span> {result ? `至 ${result.predictionEnd} 可获得总资源` : resultDateText}</div>
                {([
                  { key: 'ticket', x: 12, valueSize: 27, valueWeight: 400 },
                  { key: 'polaris', x: 152, valueSize: 27, valueWeight: 400 },
                  { key: 'quill', x: 292, valueSize: 27, valueWeight: 700 },
                  { key: 'bear', x: 432, valueSize: 27, valueWeight: 400 },
                ] as const).map(({ key, x, valueSize, valueWeight }) => {
                  const resourceItem = resources.find(item => item.key === key)!
                  return <div key={key} className="touch-results__item" style={{ '--result-x': x, '--result-size': valueSize, '--result-weight': valueWeight } as CSSProperties}>
                    <img className="touch-results__icon" src={resourceItem.image} alt="" />
                    <span className="touch-results__name">{resourceItem.label}</span>
                    <span className="touch-results__value" style={{ fontSize: `calc(${Math.min(valueSize, 100 / String(result?.resources[key] ?? 0).length)} * var(--ct-unit))` }}>{result?.resources[key] ?? 0}</span>
                  </div>
                })}
              </div>}
              {name === '截止日期' && <div className="touch-date">
                <div className="touch-date__label-back" />
                <div className="touch-date__label"><span className="calculator-touch-panel__unresolved" aria-hidden="true">✦<img src={buttonSparkle} alt="" /></span> 截止日期</div>
                <div className="touch-date__input" />
                <svg className="touch-date__icon" viewBox="0 0 16.38 16.38" aria-hidden="true"><path d="M2.0475 0H10.2375C11.3683 0 12.285 .9167 12.285 2.0475V8.8725C12.285 10.0033 11.3683 10.92 10.2375 10.92H2.0475C.9167 10.92 0 10.0033 0 8.8725V2.0475C0 .9167 .9167 0 2.0475 0Z" transform="translate(2.047522 3.412573)"/><path d="M8.8725 0V2.73M3.4125 0V2.73M0 4.7775H12.285M3.4125 7.5075H4.7775M7.5075 7.5075H8.8725M3.4125 9.555H4.7775" transform="translate(2.047522 2.047632)"/></svg>
                <div className="touch-date__text">{dateText}</div>
                <svg className="touch-date__arrow" viewBox="0 0 12 12" aria-hidden="true"><path d="M0 0L3.9 3.9 7.8 0" transform="translate(1.95 3.9)"/></svg>
                <button ref={triggerRef} type="button" className="touch-date__hit" aria-label="选择截止日期" aria-expanded={calendarOpen} aria-haspopup="dialog" tabIndex={calendarOpen ? -1 : 0} onClick={openCalendar} />
              </div>}
            </div>
          ))}
        </div>
      </div>

      <div className="calculator-touch-panel__reset" aria-hidden="true">
        <span className="calculator-touch-panel__button-icon calculator-touch-panel__button-icon--reset"><img src={buttonReset} alt="" /></span>{'  重置'}
      </div>
      <button type="button" className="calculator-touch-panel__reset-hit" aria-label="重置" tabIndex={calendarOpen ? -1 : 0} onClick={() => { onReset(); scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' }) }} />
      <div className="calculator-touch-panel__calculate" aria-hidden="true">
        {calculating ? <span className="calculator-touch-panel__loading"><svg className="calculator-loading__spinner" viewBox="0 0 28 28" aria-hidden="true"><path d="M14 2 A12 12 0 1 1 2 14" fill="none" stroke="#FFE8B8" strokeWidth="3" strokeLinecap="round" /></svg><span>正在计算…</span></span> : <><span className="calculator-touch-panel__button-icon calculator-touch-panel__button-icon--sparkle"><img src={buttonSparkle} alt="" /></span>{'  开始计算  '}<span className="calculator-touch-panel__button-icon calculator-touch-panel__button-icon--sparkle"><img src={buttonSparkle} alt="" /></span></>}
      </div>
      <button className="calculator-touch-panel__calculate calculator-touch-panel__calculate-hit" type="button" aria-label="开始计算" disabled={calculating || calendarOpen} aria-busy={calculating} onClick={onCalculate} />

      <button
        type="button"
        className="calculator-touch-panel__close-hit"
        aria-label="关闭资源计算器"
        onClick={onClose}
        tabIndex={calendarOpen ? -1 : 0}
      />
      {calendarOpen && <div className="touch-calendar-layer">
        <div className="touch-calendar-backdrop" onClick={closeCalendar} />
        <div ref={calendarRef} className="touch-calendar" role="dialog" aria-modal="true" aria-label="选择截止日期" tabIndex={-1} onKeyDown={trapFocus}>
          <button className="touch-calendar__prev" type="button" aria-label="上个月" disabled={monthKey(prev) < monthKey(today)} onClick={() => setVisibleMonth({ ...prev, day: 1 })}>‹</button>
          <div className="touch-calendar__heading">{visibleMonth.year} 年 {visibleMonth.month} 月</div>
          <button className="touch-calendar__next" type="button" aria-label="下个月" disabled={monthKey(next) > monthKey(end)} onClick={() => setVisibleMonth({ ...next, day: 1 })}>›</button>
          <div className="touch-calendar__week">{'日一二三四五六'.split('').map(d => <span key={d}>{d}</span>)}</div>
          <div className="touch-calendar__grid">
            {Array.from({ length: firstWeekday }, (_, i) => <span key={i} />)}
            {Array.from({ length: count }, (_, i) => { const date = { year: visibleMonth.year, month: visibleMonth.month, day: i + 1 }; const key = dateKey(date); return <button key={key} type="button" aria-label={key} aria-pressed={selectedDate ? dateKey(selectedDate) === key : false} disabled={key < dateKey(today) || key > dateKey(end)} onClick={() => selectDate(date)}>{i + 1}</button> })}
          </div>
        </div>
      </div>}
    </section>
  )
}
