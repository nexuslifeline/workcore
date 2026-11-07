import { cache } from 'react'
import { cookies } from 'next/headers'
import { ACTIVE_ORGANIZATION_COOKIE_NAME } from '@/lib/constants/active-organization-cookie'
import { resolveActiveOrganizationIdForUser } from '@/lib/server/resolve-active-organization'
import {
  getAuthenticatedUser,
  getUserPermissions,
} from '@/services/server/auth/auth-service'

function allowedCodesFromUserOrg(
  items: NonNullable<Awaited<ReturnType<typeof getUserPermissions>>>
): string[] {
  return items
    .filter((p) => p.rolePermissions.isAllowed)
    .map((p) => p.permission.code)
}

async function fetchSessionOrganizationId(): Promise<string | null> {
  const user = await getAuthenticatedUser()
  if (!user) return null

  const cookieStore = await cookies()
  const fromCookie = cookieStore.get(ACTIVE_ORGANIZATION_COOKIE_NAME)?.value

  return fromCookie ? fromCookie : await resolveActiveOrganizationIdForUser(user.id)
}

/** Active organization id for the current request. Cached with session permissions. */
export const getSessionOrganizationId = cache(fetchSessionOrganizationId)

/**
 * Allowed permission codes for the current request: authenticated user + active organization.
 * Uses `active_organization_id` from the cookie when set. If the cookie is missing, resolves a
 * default org on the server (newest among owned + memberships) so RSC runs before the client
 * syncs the cookie. Invalid or stale cookie values are not re-resolved here — `getUserPermissions`
 * will yield no access for that id.
 * Cached per request (layout guard + sidebar RSC share one resolution).
 */
async function fetchSessionPermissions(): Promise<string[]> {
  const user = await getAuthenticatedUser()
  if (!user) return []

  const organizationId = await getSessionOrganizationId()
  if (!organizationId) return []

  const items = await getUserPermissions(user.id, organizationId)

  if (!items) return []

  return allowedCodesFromUserOrg(items)
}

export const getSessionPermissions = cache(fetchSessionPermissions)

/** Routes like `/organizations/[id]/edit` must be checked against that org, not the active-org cookie. */
const ORG_PATH_PERMISSIONS = /^\/organizations\/([^/]+)\/(?:edit|members)(?:\/|$)/

/**
 * Same as {@link getSessionPermissions} for most paths; for organization edit/members URLs,
 * resolves permissions for the org id in the path so access matches the page being viewed.
 */
async function fetchSessionPermissionsForPath(pathname: string): Promise<string[]> {
  const m = pathname.match(ORG_PATH_PERMISSIONS)
  if (m) {
    const user = await getAuthenticatedUser()
    if (!user) return []
    const items = await getUserPermissions(user.id, m[1])
    if (!items) return []
    return allowedCodesFromUserOrg(items)
  }
  return getSessionPermissions()
}

export const getSessionPermissionsForPath = cache(fetchSessionPermissionsForPath)
