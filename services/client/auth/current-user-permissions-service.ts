import { api } from '@/lib/api'

export type CurrentUserPermissionItem = {
  permission: { code: string; name: string }
  rolePermissions: { isAllowed: boolean }
}

/**
 * Fetch role permissions for the current user in the given organization.
 * When `organizationId` is set, sends `X-Organization-Id` on this request (aligned with the query key).
 * When omitted or empty, the axios interceptor may still set the header from the active org store.
 */
export async function getCurrentUserRolePermissions(
  organizationId?: string | null
): Promise<CurrentUserPermissionItem[]> {
  const { data } = await api.get<{ permissions: CurrentUserPermissionItem[] }>(
    '/me/permissions',
    organizationId?.trim()
      ? { headers: { 'X-Organization-Id': organizationId.trim() } }
      : undefined
  )
  return data.permissions
}
