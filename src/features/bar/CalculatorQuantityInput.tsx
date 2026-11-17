import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import type { ActivityKey } from './useActivityState'
import type { ResourceKey } from './resources'
import './CalculatorQuantityInput.css'

export type QuantityField = { kind: 'resource'; key: ResourceKey } | { kind: 'activity'; key: ActivityKey }

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '清空', '0', '⌫']

export default function CalculatorQuantityInput({ touch, label, value, maxDigits, onChange, onCancel, onCommit }: {
  touch: boolean; label: string; value: string; maxDigits: number; onChange: (value: string) => void
  onCancel: () => void; onCommit: () => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useEffect(() => { dialogRef.current?.focus() }, [])
  const update = (next: string) => {
    if (/^\d+$/.test(next) && next.length <= maxDigits && Number.isSafeInteger(Number(next))) onChange(next)
  }
  const append = (digit: string) => {
    const next = value === '0' ? digit : value + digit
    update(next)
  }
  const backspace = () => update(value.slice(0, -1) || '0')
  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault()
    update(event.clipboardData.getData('text'))
  }
  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.nativeEvent.isComposing || event.ctrlKey || event.metaKey || event.altKey) return
    const digit = /^\d$/.test(event.key) ? event.key : /^Numpad\d$/.test(event.code) ? event.code.slice(-1) : null
    if (digit !== null) { event.preventDefault(); append(digit) }
    else if (event.key === 'Backspace') { event.preventDefault(); backspace() }
    else if (event.key === 'Delete') { event.preventDefault(); update('0') }
    else if (event.key === 'Escape') { event.preventDefault(); onCancel() }
    else if (event.key === 'Enter') { event.preventDefault(); onCommit() }
    if (event.key === 'Tab') {
      const elements = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button'))
      const first = elements[0], last = elements[elements.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
  }
  return <div className={`quantity-overlay${touch ? ' quantity-overlay--touch' : ''}`} onKeyDown={handleKey}>
    <div className="quantity-overlay__outside" onClick={onCommit} />
    <div ref={dialogRef} className="quantity-dialog" role="dialog" aria-modal="true" aria-label={`输入${label}`} tabIndex={-1} onPaste={handlePaste}>
      <div className="quantity-dialog__title">输入{label}</div>
      <div className="quantity-dialog__input-back" />
      <div className="quantity-dialog__input" role="status" aria-label={`输入${label}`}>{value}</div>
      <div className="quantity-dialog__keys">{keys.map(key => <button type="button" key={key} className={key === '⌫' ? 'quantity-dialog__backspace' : undefined} onMouseDown={event => event.preventDefault()} onClick={() => key === '清空' ? update('0') : key === '⌫' ? backspace() : append(key)}>{key}</button>)}</div>
      <div className="quantity-dialog__actions"><button type="button" onClick={onCancel}>取消</button><button type="button" onClick={onCommit}>完成</button></div>
    </div>
  </div>
}
