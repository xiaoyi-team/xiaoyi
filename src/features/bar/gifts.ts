import giftRibbon from '../../assets/bar/source/calculator/gift-blue-ribbon-box.png'
import giftCrystal from '../../assets/bar/source/calculator/gift-blue-flower-crystal-box.png'
// Formal PC instances in 6787:79; original line breaks and instance typography are retained.
// Figma imageHash: ribbon be875a6cf6ffd6bca410ce8a237992f0b9474f8f;
// crystal 961997788a9be56bfbf55c78e20636bfcc4e7269.
export const gifts = [
  { id: '6810:34', title: "1元礼包", price: "¥ 1", image: giftRibbon, weight: 700, lineHeight: 30 },
  { id: '6810:69', title: "超值十连①", price: "¥ 98", image: giftRibbon, weight: 600, lineHeight: 36 },
  { id: '6810:98', title: "超值十连②", price: "¥ 198", image: giftRibbon, weight: 600, lineHeight: 36 },
  { id: '6810:129', title: "超值十连③", price: "¥ 198", image: giftRibbon, weight: 600, lineHeight: 36 },
  { id: '6810:158', title: "混池\n新衣礼包", price: "¥ 288", image: giftRibbon, weight: 600, lineHeight: 36 },
  { id: '6810:183', title: "20北极星\n十连礼包", price: null, image: giftRibbon, weight: 600, lineHeight: 36 },
  { id: '6810:208', title: "30北极星\n十连礼包", price: null, image: giftRibbon, weight: 600, lineHeight: 36 },
  { id: '6810:233', title: "十连直购", price: "¥ 60", image: giftRibbon, weight: 600, lineHeight: 36 },
  { id: '6821:316', title: "混池十连①", price: "¥ 88", image: giftRibbon, weight: 600, lineHeight: 36 },
  { id: '8003:1569', title: "混池十连②", price: "¥ 188", image: giftRibbon, weight: 600, lineHeight: 36 },
  { id: '8003:1578', title: "五抽直购", price: "¥ 30", image: giftRibbon, weight: 600, lineHeight: 36 },
  { id: '8003:1587', title: "单抽直购", price: "¥ 6", image: giftRibbon, weight: 600, lineHeight: 36 },
  { id: '8003:1596', title: "10北极星\n礼包", price: "¥ 30", image: giftRibbon, weight: 600, lineHeight: 36 },
  { id: '8003:1605', title: "12北极星\n礼包", price: "¥ 36", image: giftRibbon, weight: 600, lineHeight: 36 },
  { id: '8003:1614', title: "9北极星\n礼包", price: "¥ 25", image: giftRibbon, weight: 600, lineHeight: 36 },
  { id: '8003:1623', title: "6北极星\n礼包", price: "¥ 18", image: giftRibbon, weight: 600, lineHeight: 36 },
  { id: '8003:1632', title: "4北极星\n礼包", price: "¥ 12", image: giftRibbon, weight: 600, lineHeight: 36 },
  { id: '8003:1641', title: "2北极星\n礼包", price: "¥ 6", image: giftRibbon, weight: 600, lineHeight: 36 },
  { id: '8003:1650', title: "1北极星\n礼包", price: "¥ 3", image: giftRibbon, weight: 600, lineHeight: 36 },
  { id: '8003:1659', title: "心悦礼包①", price: "¥ 348", image: giftRibbon, weight: 600, lineHeight: 36 },
  { id: '8003:1668', title: "心悦礼包②", price: "¥ 648", image: giftRibbon, weight: 600, lineHeight: 36 },
  { id: '8003:1677', title: "6元直充", price: "¥ 6", image: giftCrystal, weight: 600, lineHeight: 36 },
  { id: '8003:1686', title: "6元\n首充双倍", price: "¥ 6", image: giftCrystal, weight: 600, lineHeight: 36 },
  { id: '8003:1695', title: "30元直充", price: "¥ 30", image: giftCrystal, weight: 600, lineHeight: 36 },
  { id: '8003:1704', title: "30元\n首充双倍", price: "¥ 30", image: giftCrystal, weight: 600, lineHeight: 36 },
  { id: '8003:1713', title: "93元直充", price: "¥ 93", image: giftCrystal, weight: 600, lineHeight: 36 },
  { id: '8003:1722', title: "93元\n首充双倍", price: "¥ 93", image: giftCrystal, weight: 600, lineHeight: 36 },
  { id: '8003:1731', title: "168元直充", price: "¥ 168", image: giftCrystal, weight: 600, lineHeight: 36 },
  { id: '8003:1740', title: "168元\n首充双倍", price: "¥ 168", image: giftCrystal, weight: 600, lineHeight: 36 },
  { id: '8003:1749', title: "348元直充", price: "¥ 348", image: giftCrystal, weight: 600, lineHeight: 36 },
  { id: '8003:1758', title: "348元\n首充双倍", price: "¥ 348", image: giftCrystal, weight: 600, lineHeight: 36 },
  { id: '8003:1767', title: "648元直充", price: "¥ 648", image: giftCrystal, weight: 600, lineHeight: 36 },
  { id: '8003:1776', title: "648元\n首充双倍", price: "¥ 648", image: giftCrystal, weight: 600, lineHeight: 36 },
]


export type GiftState = { counts: Record<string, number>; increment: (id: string) => void; clear: (id: string) => void; reset: () => void }
