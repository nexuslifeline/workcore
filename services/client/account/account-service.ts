import { api } from '@/lib/api'

export type AccountInfo = {
  email: string | null
  locale: string | null
  hasPassword: boolean
  authProvider: string
}

type UpdateAccountPayload = {
  email?: string
  password?: string
  currentPassword?: string
  locale?: string
}

/**
 * Fetch the current user's account information
 */
export async function getAccount(): Promise<AccountInfo> {
  const { data } = await api.get<AccountInfo>('/account')
  return data
}

/**
 * Update the current user's account settings
 */
export async function updateAccount(
  payload: UpdateAccountPayload
): Promise<AccountInfo> {
  const { data } = await api.patch<AccountInfo>('/account', payload)
  return data
}
