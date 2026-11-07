import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createOrganizationInvite } from '@/services/client/invitations/invitation-service'
import { invitationInboxQueryKey } from '@/hooks/use-invitation-inbox'

export function useCreateOrganizationInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrganizationInvite,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
      queryClient.invalidateQueries({
        queryKey: ['organization-members', variables.organizationId],
      })
      queryClient.invalidateQueries({ queryKey: invitationInboxQueryKey })
    },
  })
}
