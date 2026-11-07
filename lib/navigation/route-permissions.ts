import { PERMISSIONS } from '@/lib/constants/permission-codes'

type RouteRule =
  | { path: string; code: string | null; anyOf?: never }
  | { path: string; anyOf: readonly string[]; code?: never }

const ROUTE_PERMISSION_MAP: RouteRule[] = [
  { path: '/settings/appearance', code: null },
  { path: '/settings/account', code: null },
  { path: '/settings/display', code: null },
  { path: '/settings/notifications', code: null },
  { path: '/settings', code: null },
  { path: '/employees', code: PERMISSIONS.EMPLOYEES },
  { path: '/users', code: PERMISSIONS.SYSTEM_USERS },
  { path: '/roles', code: PERMISSIONS.SYSTEM_ROLES },
  { path: '/organizations', code: PERMISSIONS.SYSTEM_ORGANIZATIONS },
  { path: '/help-center', code: null },
]

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '') return '/'
  const p = pathname.startsWith('/') ? pathname : `/${pathname}`
  if (p.length > 1 && p.endsWith('/')) return p.slice(0, -1)
  return p
}

export function getRequiredPermissionForPath(
  pathname: string
): string | readonly string[] | null | undefined {
  const p = normalizePathname(pathname)

  if (p === '/access-denied') return null
  if (p === '/') return PERMISSIONS.DASHBOARD

  if (/^\/organizations\/[^/]+\/edit(?:\/|$)/.test(p)) {
    return PERMISSIONS.SETTINGS_ORGANIZATION
  }
  if (/^\/organizations\/[^/]+\/members(?:\/|$)/.test(p)) {
    return PERMISSIONS.SYSTEM_ORGANIZATIONS
  }

  const sorted = [...ROUTE_PERMISSION_MAP].sort((a, b) => b.path.length - a.path.length)
  for (const rule of sorted) {
    if (p === rule.path || p.startsWith(`${rule.path}/`)) {
      if ('anyOf' in rule && rule.anyOf) return rule.anyOf
      return rule.code
    }
  }

  return undefined
}
