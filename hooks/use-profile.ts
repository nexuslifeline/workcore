import { useQuery } from '@tanstack/react-query'
import { getProfile } from '@/services/client/profile/profile-service'
import type { Profile } from '@/types/profile'

export function useProfile() {
  return useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

