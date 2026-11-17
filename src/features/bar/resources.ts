import ticketImage from '../../assets/bar/source/calculator/resource-ticket.png'
import polarisImage from '../../assets/bar/source/calculator/resource-polaris.png'
import quillImage from '../../assets/bar/source/calculator/resource-quill.png'
import bearImage from '../../assets/bar/source/calculator/resource-bear.png'

export const resources = [
  { key: 'ticket', label: '十连签收券', image: ticketImage, touchX: 10, pcX: 87 },
  { key: 'polaris', label: '北极星', image: polarisImage, touchX: 150, pcX: 360 },
  { key: 'quill', label: '羽毛笔', image: quillImage, touchX: 290, pcX: 633 },
  { key: 'bear', label: '小熊星座', image: bearImage, touchX: 430, pcX: 906 },
] as const

export type ResourceKey = (typeof resources)[number]['key']
export type ResourceCounts = Record<ResourceKey, number>
export type ResourceState = {
  counts: ResourceCounts
  change: (key: ResourceKey, delta: 1 | -1) => void
  reset: () => void
}

export const initialResourceCounts: ResourceCounts = {
  ticket: 0,
  polaris: 0,
  quill: 0,
  bear: 0,
}
