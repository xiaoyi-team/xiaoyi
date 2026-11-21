import { useQuery } from '@tanstack/react-query'
import { retryWishBoxRequest, wishBoxRetryDelay } from './requestPolicy'
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
      'timeline',
      normalized.act_category ?? null,
      normalized.act_kind ?? null,
    ],
    queryFn: ({ signal }) => getSupportRecords(normalized, signal, 10000),
    retry: retryWishBoxRequest,
    retryDelay: wishBoxRetryDelay,
  })
}
