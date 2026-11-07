import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateAccount } from '@/services/client/account/account-service'

type UpdateAccountPayload = {
  email?: string
  password?: string
  currentPassword?: string
  locale?: string
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateAccountPayload) => updateAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account'] })
    },
  })
}
