import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProfile } from '@/services/client/profile/profile-service'
import type { Profile } from '@/types/profile'

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<Profile>) => updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
