import { useQuery } from '@tanstack/react-query'
import { getPermissions } from '@/services/client/permissions/permission-service'

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: getPermissions,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })
}
