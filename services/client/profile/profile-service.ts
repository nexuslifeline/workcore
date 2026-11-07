import { api } from '@/lib/api'
import type { Profile } from '@/types/profile'

/**
 * Fetch the current user's profile
 */
export async function getProfile(): Promise<Profile> {
  const { data } = await api.get<Profile>('/me')
  return data
}

/**
 * Update the current user's profile
 */
export async function updateProfile(
  payload: Partial<Profile>
): Promise<Profile> {
  const { data } = await api.patch<Profile>('/me', payload)
  return data
}
