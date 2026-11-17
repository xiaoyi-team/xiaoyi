import { useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './CalculatorPolarisNotice.css'

export default function CalculatorPolarisNotice({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  useLayoutEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    dialog.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onCloseRef.current()
      } else if (event.key === 'Tab') {
        // This notice has no controls; keep keyboard focus within the modal.
        event.preventDefault()
        dialog.focus()
      }
    }
    const keepFocusInside = (event: FocusEvent) => {
      if (!dialog.contains(event.target as Node)) dialog.focus()
    }

    document.addEventListener('keydown', handleKeyDown, true)
    document.addEventListener('focusin', keepFocusInside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      document.removeEventListener('focusin', keepFocusInside)
    }
  }, [])

  return createPortal(
    <div className="polaris-notice-layer" onClick={onClose}>
      <div
        ref={dialogRef}
        className="polaris-notice"
        role="alertdialog"
        aria-modal="true"
        aria-label="北极星数量不足，请调整选择后重新计算。"
        tabIndex={-1}
        onClick={event => event.stopPropagation()}
      >
        北极星数量不足，请调整选择后重新计算。
      </div>
    </div>,
    document.body,
  )
}
