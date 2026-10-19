import { useQuery } from '@tanstack/react-query'
import {
  getSupportRecords,
  normalizeSupportRecordListParams,
  type SupportRecordListParams,
} from '../../../services/wishBox'

export function useSupportRecords(params: SupportRecordListParams = {}) {
  const normalized = normalizeSupportRecordListParams(params)

  return useQuery({
    queryKey: [
      'wishBox',
      'supportRecords',
      'list',
      normalized.plate ?? null,
      normalized.year ?? null,
      normalized.act_kind ?? null,
      normalized.act_category ?? null,
    ],
    queryFn: ({ signal }) => getSupportRecords(normalized, signal),
  })
}
