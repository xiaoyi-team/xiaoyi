import { request } from './request'

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

export function getSupportRecords(
  params: SupportRecordListParams = {},
  signal?: AbortSignal,
): Promise<unknown> {
  const normalized = normalizeSupportRecordListParams(params)
  const search = new URLSearchParams()

  if (normalized.year !== undefined) search.set('year', normalized.year)
  if (normalized.act_kind !== undefined) search.set('act_kind', normalized.act_kind)
  if (normalized.act_category !== undefined) search.set('act_category', normalized.act_category)

  const query = search.toString()
  return request(`/support_record/list${query ? `?${query}` : ''}`, { signal })
}
