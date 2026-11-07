import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAppNotifications,
  markAppNotificationRead,
  type AppNotificationsResponse,
} from '@/services/client/notifications/app-notification-service'
import { useOrganizationStore } from '@/stores/organization-store'

export const appNotificationsQueryKey = (organizationId: string | null) =>
  ['app-notifications', organizationId] as const

export function useAppNotifications() {
  const { activeOrganizationId } = useOrganizationStore()

  return useQuery<AppNotificationsResponse>({
    queryKey: appNotificationsQueryKey(activeOrganizationId),
    queryFn: getAppNotifications,
    enabled: !!activeOrganizationId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000,
  })
}

export function useMarkAppNotificationRead() {
  const queryClient = useQueryClient()
  const { activeOrganizationId } = useOrganizationStore()

  return useMutation({
    mutationFn: markAppNotificationRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: appNotificationsQueryKey(activeOrganizationId),
      })
    },
  })
}
