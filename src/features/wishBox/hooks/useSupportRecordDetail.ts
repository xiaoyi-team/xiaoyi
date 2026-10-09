import { useQuery } from '@tanstack/react-query'
import { getSupportRecordDetail } from '../../../services/wishBox'

export function useSupportRecordDetail(recordId: number) {
  const isValidRecordId = Number.isSafeInteger(recordId) && recordId > 0
  const query = useQuery({
    queryKey: ['wishBox', 'supportRecords', 'detail', recordId],
    enabled: isValidRecordId,
    queryFn: ({ signal }) => {
      // Manual refetch can bypass enabled; invalid identities must never reach the service.
      if (!isValidRecordId) {
        throw new Error(`Invalid support record ID ${recordId}: expected a positive safe integer`)
      }
      return getSupportRecordDetail(recordId, signal)
    },
  })

  // Consumers must handle invalid identity separately from the disabled Query's pending state.
  return { query, isValidRecordId }
}
