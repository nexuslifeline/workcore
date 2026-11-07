import { api } from '@/lib/api'

export type AppNotificationItem = {
  id: string
  organizationId: string
  type: string
  title: string
  body: string | null
  payload: Record<string, unknown> | null
  createdAt: string
  readAt: string | null
}

export type AppNotificationsResponse = {
  canView: boolean
  unreadCount: number
  notifications: AppNotificationItem[]
}

export async function getAppNotifications(): Promise<AppNotificationsResponse> {
  const { data } = await api.get<AppNotificationsResponse>('/app-notifications')
  return data
}

export async function markAppNotificationRead(id: string): Promise<void> {
  await api.post(`/app-notifications/${id}/read`)
}
