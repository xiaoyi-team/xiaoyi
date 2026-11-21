import { useQuery } from '@tanstack/react-query'
import { getGlobalNotice } from '../../../services/wishBox'
import { retryWishBoxRequest, wishBoxRetryDelay } from './requestPolicy'

export function useGlobalNotice(enabled = true) {
  return useQuery({
    queryKey: ['wishBox', 'globalNotice'],
    queryFn: ({ signal }) => getGlobalNotice(signal, 8000),
    retry: retryWishBoxRequest,
    retryDelay: wishBoxRetryDelay,
    enabled,
  })
}
