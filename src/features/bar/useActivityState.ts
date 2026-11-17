import { useState } from 'react'

export type ActivityKey = 'monthly' | 'ceremony' | 'wish' | 'premium'
export type WishChoice = 1 | 2 | 3

export function useActivityState() {
  const [counts, setCounts] = useState<Record<ActivityKey, number>>({ monthly: 0, ceremony: 0, wish: 0, premium: 0 })
  const [wishChoice, setWishChoice] = useState<WishChoice>(1)
  const change = (key: ActivityKey, delta: number) => setCounts(current => ({ ...current, [key]: Math.max(0, current[key] + delta) }))
  const reset = () => { setCounts({ monthly: 0, ceremony: 0, wish: 0, premium: 0 }); setWishChoice(1) }
  return { counts, wishChoice, setWishChoice, change, reset }
}
export type ActivityState = ReturnType<typeof useActivityState>
