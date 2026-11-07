import { useQuery } from '@tanstack/react-query'
import { getAccount, type AccountInfo } from '@/services/client/account/account-service'

export function useAccount() {
  return useQuery<AccountInfo>({
    queryKey: ['account'],
    queryFn: getAccount,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}
