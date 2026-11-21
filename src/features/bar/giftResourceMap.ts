export type GiftResourceReward = Readonly<{
  ticket: number
  polaris: number
  quill: number
  bear: number
}>

export type GiftExchangeCost = Readonly<{ polaris: number }>

export type GiftResourceMapping = Readonly<{
  reward: GiftResourceReward
  exchangeCost: GiftExchangeCost
}>

const mapping = {
  '6810:34': { reward: { ticket: 0, polaris: 2, quill: 0, bear: 0 }, exchangeCost: { polaris: 0 } },
  '6810:69': { reward: { ticket: 1, polaris: 33, quill: 0, bear: 0 }, exchangeCost: { polaris: 0 } },
  '6810:98': { reward: { ticket: 3, polaris: 66, quill: 0, bear: 0 }, exchangeCost: { polaris: 0 } },
  '6810:129': { reward: { ticket: 3, polaris: 66, quill: 0, bear: 0 }, exchangeCost: { polaris: 0 } },
  '6810:158': { reward: { ticket: 4, polaris: 0, quill: 0, bear: 2000 }, exchangeCost: { polaris: 0 } },
  '6810:183': { reward: { ticket: 1, polaris: 0, quill: 0, bear: 0 }, exchangeCost: { polaris: 20 } },
  '6810:208': { reward: { ticket: 1, polaris: 0, quill: 0, bear: 0 }, exchangeCost: { polaris: 30 } },
  '6810:233': { reward: { ticket: 1, polaris: 0, quill: 0, bear: 0 }, exchangeCost: { polaris: 0 } },
  '6821:316': { reward: { ticket: 1, polaris: 0, quill: 5, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1569': { reward: { ticket: 3, polaris: 0, quill: 5, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1578': { reward: { ticket: 0, polaris: 0, quill: 5, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1587': { reward: { ticket: 0, polaris: 0, quill: 1, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1596': { reward: { ticket: 0, polaris: 0, quill: 10, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1605': { reward: { ticket: 0, polaris: 0, quill: 12, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1614': { reward: { ticket: 0, polaris: 0, quill: 9, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1623': { reward: { ticket: 0, polaris: 0, quill: 6, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1632': { reward: { ticket: 0, polaris: 0, quill: 4, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1641': { reward: { ticket: 0, polaris: 0, quill: 2, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1650': { reward: { ticket: 0, polaris: 0, quill: 1, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1659': { reward: { ticket: 4, polaris: 100, quill: 0, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1668': { reward: { ticket: 10, polaris: 216, quill: 0, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8974:6868': { reward: { ticket: 24, polaris: 432, quill: 0, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1677': { reward: { ticket: 0, polaris: 2, quill: 0, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1686': { reward: { ticket: 0, polaris: 4, quill: 0, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1695': { reward: { ticket: 0, polaris: 10, quill: 0, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1704': { reward: { ticket: 0, polaris: 20, quill: 0, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1713': { reward: { ticket: 0, polaris: 31, quill: 0, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1722': { reward: { ticket: 0, polaris: 62, quill: 0, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1731': { reward: { ticket: 0, polaris: 56, quill: 0, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1740': { reward: { ticket: 0, polaris: 112, quill: 0, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1749': { reward: { ticket: 0, polaris: 116, quill: 0, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1758': { reward: { ticket: 0, polaris: 232, quill: 0, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1767': { reward: { ticket: 0, polaris: 216, quill: 0, bear: 0 }, exchangeCost: { polaris: 0 } },
  '8003:1776': { reward: { ticket: 0, polaris: 432, quill: 0, bear: 0 }, exchangeCost: { polaris: 0 } },
} as const satisfies Record<string, GiftResourceMapping>

export const giftResourceMap: Readonly<Record<string, GiftResourceMapping>> = Object.freeze(mapping)

export type GiftResourceTotals = Readonly<{
  reward: GiftResourceReward
  exchangeCost: GiftExchangeCost
}>

export function calculateGiftResources(giftCounts: Readonly<Record<string, number>>): GiftResourceTotals {
  const knownIds = new Set(Object.keys(giftResourceMap))
  for (const [id, count] of Object.entries(giftCounts)) {
    if (!knownIds.has(id)) throw new Error(`Unknown gift ID: ${id}`)
    if (!Number.isSafeInteger(count) || count < 0) throw new RangeError(`Invalid quantity for gift ${id}`)
  }
  const reward = { ticket: 0, polaris: 0, quill: 0, bear: 0 }
  let exchangePolaris = 0
  for (const [id, count] of Object.entries(giftCounts)) {
    const item = giftResourceMap[id]
    reward.ticket += item.reward.ticket * count
    reward.polaris += item.reward.polaris * count
    reward.quill += item.reward.quill * count
    reward.bear += item.reward.bear * count
    exchangePolaris += item.exchangeCost.polaris * count
  }
  if ([...Object.values(reward), exchangePolaris].some(value => !Number.isSafeInteger(value))) throw new RangeError('Gift totals exceed the safe integer range')
  return { reward, exchangeCost: { polaris: exchangePolaris } }
}
