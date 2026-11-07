import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { MIDDLEWARE_PATHNAME_HEADER } from '@/lib/constants/middleware-headers'
import { NO_ROLE_PERMISSIONS_FALLBACK_PATH } from '@/lib/constants/no-role-permissions'
import { getRequiredPermissionForPath } from '@/lib/navigation/route-permissions'
import { getSessionPermissionsForPath } from '@/lib/server/get-session-permissions'

type PermissionRouteGuardProps = {
  children: ReactNode
}

/**
 * React Server Component: runs only on the server (async, `headers()`, `redirect()`, server-only imports).
 *
 * Uses `x-pathname` from root `proxy.ts`, then redirects to `/access-denied` when the route
 * requires a permission the session does not include. Renders `children` otherwise.
 */
export async function PermissionRouteGuard({ children }: PermissionRouteGuardProps) {
  const pathname =
    (await headers()).get(MIDDLEWARE_PATHNAME_HEADER) ?? ''

  const isNoRoleFallbackPath =
    pathname === NO_ROLE_PERMISSIONS_FALLBACK_PATH ||
    pathname.startsWith(`${NO_ROLE_PERMISSIONS_FALLBACK_PATH}/`)

  // Missing header, already on /access-denied, or already on the no-role fallback:
  // render as-is so we never redirect those destinations onto themselves.
  if (!pathname || pathname.startsWith('/access-denied') || isNoRoleFallbackPath) {
    return <>{children}</>
  }

  const required = getRequiredPermissionForPath(pathname)
  // Route is not permission-gated (e.g. settings that any signed-in user can open).
  if (required === null || required === undefined) {
    return <>{children}</>
  }

  const allowed = await getSessionPermissionsForPath(pathname)
  const codes = typeof required === 'string' ? [required] : [...required]
  const hasNoMatchingPermission = !codes.some((code) => allowed.includes(code))
  if (hasNoMatchingPermission) {
    redirect(allowed.length === 0 ? NO_ROLE_PERMISSIONS_FALLBACK_PATH : '/access-denied')
  }

  return <>{children}</>
}
