import { request } from './request'

export type SupportRecordListItem = {
  id: number
  title: string
  start_time: string
  end_time: string
  act_category: string
  act_kind: string
  location: string | null
  content: string | null
  link: string | null
  cover_thumbnail_url: string | null
  content_photo_list: Record<string, unknown>[]
  template_type: string
}

export type PhotoItem = {
  img_key: string
  img_url: string
  thumbnail_url: string
}

export type SupportRecordDetail = {
  id: number
  title: string
  start_time: string
  end_time: string
  act_category: string
  act_kind: string
  location: string | null
  content: string | null
  link: string | null
  cover_img: PhotoItem | null
  content_photo_list: Record<string, unknown>[]
  template_type: string
}

export type SupportRecordListParams = {
  year?: string
  act_kind?: string
  act_category?: string
}

export function normalizeSupportRecordListParams(params: SupportRecordListParams = {}) {
  return {
    year: params.year,
    act_kind: params.act_kind,
    act_category: params.act_category,
  }
}

export async function getSupportRecords(
  params: SupportRecordListParams = {},
  signal?: AbortSignal,
): Promise<SupportRecordListItem[]> {
  const normalized = normalizeSupportRecordListParams(params)
  const search = new URLSearchParams()

  if (normalized.year !== undefined) search.set('year', normalized.year)
  if (normalized.act_kind !== undefined) search.set('act_kind', normalized.act_kind)
  if (normalized.act_category !== undefined) search.set('act_category', normalized.act_category)

  const query = search.toString()
  const response = await request(`/support_record/list${query ? `?${query}` : ''}`, { signal })
  if (!Array.isArray(response)) {
    throw new Error('Invalid support record list response: expected an array')
  }

  // Only the top-level array is checked; item fields rely on the API contract.
  return response as SupportRecordListItem[]
}

export async function getSupportRecordDetail(
  recordId: number,
  signal?: AbortSignal,
): Promise<SupportRecordDetail> {
  const response = await request(`/support_record/${recordId}`, { signal })
  if (typeof response !== 'object' || response === null || Array.isArray(response)) {
    throw new Error('Invalid support record detail response: expected an object')
  }

  // Only the top-level object is checked; fields rely on the API contract.
  return response as SupportRecordDetail
}
