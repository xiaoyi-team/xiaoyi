import { request } from './request'

export type SupportRecordListItem = {
  id: number
  title: string
  // Offset-free Beijing time (UTC+8); preserve the transport string.
  activity_time: string
  start_time: string | null
  end_time: string | null
  act_category: string
  act_kind: string
  location: string | null
  content: string | null
  link: string | null
  cover_thumbnail_url: string | null
  img_url_list?: string[] | null
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
