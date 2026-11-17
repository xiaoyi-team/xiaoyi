import { useEffect, useRef, type KeyboardEvent } from 'react'
import type { ActivityKey } from './useActivityState'
import type { ResourceKey } from './resources'
import './CalculatorQuantityInput.css'

export type QuantityField = { kind: 'resource'; key: ResourceKey } | { kind: 'activity'; key: ActivityKey }

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '清空', '0', '⌫']

export default function CalculatorQuantityInput({ touch, label, value, onChange, onCancel, onCommit }: {
  touch: boolean; label: string; value: string; onChange: (value: string) => void
  onCancel: () => void; onCommit: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { inputRef.current?.focus() }, [])
  const append = (digit: string) => {
    const next = value === '0' ? digit : value + digit
    if (Number.isSafeInteger(Number(next))) onChange(next)
  }
  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') { event.preventDefault(); onCancel() }
    if (event.key === 'Enter') { event.preventDefault(); onCommit() }
    if (event.key === 'Tab') {
      const elements = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('input, button'))
      const first = elements[0], last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
  }
  return <div className={`quantity-overlay${touch ? ' quantity-overlay--touch' : ''}`} onKeyDown={handleKey}>
    <div className="quantity-overlay__outside" onClick={onCommit} />
    <div className="quantity-dialog" role="dialog" aria-modal="true" aria-label={`输入${label}`}>
      <div className="quantity-dialog__title">输入{label}</div>
      <div className="quantity-dialog__input-back" />
      <input ref={inputRef} className="quantity-dialog__input" aria-label={`输入${label}`} inputMode="numeric" value={value} onChange={event => { const next = event.target.value; if (/^\d*$/.test(next) && (next === '' || Number.isSafeInteger(Number(next)))) onChange(next) }} />
      <div className="quantity-dialog__keys">{keys.map(key => <button type="button" key={key} className={key === '⌫' ? 'quantity-dialog__backspace' : undefined} onClick={() => key === '清空' ? onChange('0') : key === '⌫' ? onChange(value.slice(0, -1) || '0') : append(key)}>{key}</button>)}</div>
      <div className="quantity-dialog__actions"><button type="button" onClick={onCancel}>取消</button><button type="button" onClick={onCommit}>完成</button></div>
    </div>
  </div>
}
