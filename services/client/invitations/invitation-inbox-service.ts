import { api } from '@/lib/api'

export type InvitationInboxItem = {
  id: string
  token: string
  email: string
  role: string | null
  message: string | null
  invitedByName: string | null
  expiresAt: string
  organization: {
    id: string
    name: string
    logoUrl: string | null
  }
}

export type InvitationInboxResponse = {
  invitations: InvitationInboxItem[]
  count: number
}

export async function getInvitationInbox(): Promise<InvitationInboxResponse> {
  const { data } = await api.get<InvitationInboxResponse>('/invites/inbox')
  return data
}

export async function acceptInvitation(token: string): Promise<{
  organization: { id: string; name: string }
}> {
  const { data } = await api.post<{
    success: boolean
    organization: { id: string; name: string }
  }>('/invites/accept', { token })
  return data
}
