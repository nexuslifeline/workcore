import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  acceptInvitation,
  getInvitationInbox,
  type InvitationInboxResponse,
} from '@/services/client/invitations/invitation-inbox-service'
import { useOrganizationStore } from '@/stores/organization-store'

export const invitationInboxQueryKey = ['invites', 'inbox'] as const

export function useInvitationInbox() {
  return useQuery<InvitationInboxResponse>({
    queryKey: invitationInboxQueryKey,
    queryFn: getInvitationInbox,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000,
  })
}

export function useAcceptInvitationInbox() {
  const queryClient = useQueryClient()
  const setActiveOrganizationId = useOrganizationStore(
    (state) => state.setActiveOrganizationId
  )

  return useMutation({
    mutationFn: acceptInvitation,
    onSuccess: async (data) => {
      if (data.organization?.id) {
        setActiveOrganizationId(data.organization.id)
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: invitationInboxQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['organizations'] }),
        queryClient.invalidateQueries({ queryKey: ['me', 'permissions'] }),
      ])
    },
  })
}
