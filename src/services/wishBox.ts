import { request } from './request'

export type SupportRecordListItem = {
  id: number
  title: string
  start_time: string
  end_time: string
  act_category: string
  act_kind: string
  location: string | null
  cover_img: PhotoItem | null
  content_photo_list: PhotoItem[]
  timeline_enable: boolean
  timeline_photo_list: PhotoItem[]
  timeline_link: string | null
  notice_enable: boolean
  notice_is_show: boolean
  notice_layout_config: unknown
  created_at: string
  updated_at: string
}

export type PhotoItem = {
  img_key: string
  img_url: string
  thumbnail_url: string
  pos_x?: number
  pos_y?: number
}

export type SupportRecordDetail = SupportRecordListItem & {
  content: string | null
  block_list: Record<string, unknown>[]
}

export type NoticeLayoutConfigDto = {
  left_ratio: number
  right_ratio: number
}

export type GlobalNoticeBlockDto = {
  sort: number
  title?: string | null
  content?: string | null
  font_size?: string | null
  font_color?: string | null
  font_weight?: 'normal' | 'bold' | null
}

export type GlobalNoticeDto = {
  id: number
  title: string
  start_time: string
  end_time: string
  act_category: string
  act_kind: string
  location?: string | null
  cover_img: PhotoItem | null
  content_photo_list: PhotoItem[]
  timeline_enable: boolean
  timeline_photo_list: PhotoItem[]
  timeline_link: string | null
  notice_enable: boolean
  notice_is_show: boolean
  notice_layout_config?: NoticeLayoutConfigDto | null
  created_at: string
  updated_at: string
  content?: string | null
  block_list: GlobalNoticeBlockDto[]
}

export type SupportRecordListParams = {
  act_kind?: string
  act_category?: string
}

export function normalizeSupportRecordListParams(params: SupportRecordListParams = {}) {
  return {
    act_kind: params.act_kind,
    act_category: params.act_category,
  }
}

export async function getSupportRecords(
  params: SupportRecordListParams = {},
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<SupportRecordListItem[]> {
  const normalized = normalizeSupportRecordListParams(params)
  const search = new URLSearchParams()

  if (normalized.act_kind !== undefined) search.set('act_kind', normalized.act_kind)
  if (normalized.act_category !== undefined) search.set('act_category', normalized.act_category)

  const query = search.toString()
  const response = await request(`/api/support_record/timeline/list${query ? `?${query}` : ''}`, { signal, timeoutMs, classifyNetworkErrors: true })
  if (!Array.isArray(response)) {
    throw new Error('Invalid support record list response: expected an array')
  }

  // Only the top-level array is checked; item fields rely on the API contract.
  return response as SupportRecordListItem[]
}

export async function getSupportRecordDetail(
  recordId: number,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<SupportRecordDetail> {
  const response = await request(`/api/support_record/${recordId}`, { signal, timeoutMs, classifyNetworkErrors: true })
  if (typeof response !== 'object' || response === null || Array.isArray(response)) {
    throw new Error('Invalid support record detail response: expected an object')
  }

  // Only the top-level object is checked; fields rely on the API contract.
  return response as SupportRecordDetail
}
export async function getGlobalNotice(signal?: AbortSignal, timeoutMs?: number): Promise<GlobalNoticeDto> {
  const response = await request('/api/front/global_notice', { signal, timeoutMs, classifyNetworkErrors: true })
  if (response === null) {
    throw new Error('Invalid global notice response: expected the active notice, received null')
  }
  if (typeof response !== 'object' || Array.isArray(response)) {
    throw new Error('Invalid global notice response: expected an object')
  }

  // The API contract allows null defensively; normal business flow requires one active notice.
  return response as GlobalNoticeDto
}
