import { createClient } from '@/lib/supabase/server'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase/database.types'
import { db } from '@/lib/db'
import {
  organizationUsers,
  organizations,
  permissions,
  rolePermissions,
} from '@/db/schema'
import { eq, and, asc } from 'drizzle-orm'

/**
 * Get authenticated user from Supabase (server-side)
 * Returns null if not authenticated
 */
export async function getAuthenticatedUser(): Promise<SupabaseUser | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export type AuthOperationError = { message: string }

/**
 * Update the authenticated user's email (server-side).
 * Uses the current session from cookies.
 */
export async function updateAuthEmail(
  newEmail: string
): Promise<{ error: AuthOperationError | null }> {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ email: newEmail })
  return { error: error ? { message: error.message } : null }
}

/**
 * Verify current password by signing in with email/password (server-side).
 * Used for account security (e.g. before changing password).
 */
export async function verifyCurrentPassword(
  email: string,
  password: string
): Promise<{ error: AuthOperationError | null }> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return { error: error ? { message: error.message } : null }
}

/**
 * Update the authenticated user's password (server-side).
 */
export async function updateAuthPassword(
  newPassword: string
): Promise<{ error: AuthOperationError | null }> {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  return { error: error ? { message: error.message } : null }
}

export type CurrentUserPermissionItem = {
  permission: { code: string; name: string }
  rolePermissions: { isAllowed: boolean }
}

/**
 * Internal helper to materialize permission items given a role context.
 * - If roleId is undefined or null, returns all permissions (treated as allowed).
 * - If roleId is provided, returns permissions filtered by that role.
 */
export async function getPermissions(
  roleId?: string | null
): Promise<CurrentUserPermissionItem[]> {
  const hasRole = roleId != null

  let rows:
    | {
        code: string
        name: string
        isAllowed?: boolean
      }[]
    | undefined

  if (hasRole) {
    // Role-based: join role_permissions with permissions for a specific role
    rows = await db
      .select({
        code: permissions.code,
        name: permissions.name,
        isAllowed: rolePermissions.isAllowed,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId!))
      .orderBy(asc(permissions.code))
  } else {
    // No roleId: return all permissions treated as allowed
    rows = await db
      .select({
        code: permissions.code,
        name: permissions.name,
      })
      .from(permissions)
      .orderBy(asc(permissions.code))
  }

  return rows.map((r) => ({
    permission: { code: r.code, name: r.name },
    rolePermissions: {
      // when no roleId is provided, treat as fully allowed
      isAllowed: hasRole ? r.isAllowed : true,
    },
  }))
}

/**
 * Effective permissions for a user in an organization (owner → all allowed; else role-based).
 *
 * If the user is not the owner and has no `roleId` (no membership row or null role), returns `null`
 * so they are not treated as having access to that organization.
 */
export async function getUserPermissions(
  userId: string,
  organizationId: string
): Promise<CurrentUserPermissionItem[] | null> {
  const [org] = await db
    .select({ ownerId: organizations.ownerId })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1)

  const isOwner = org?.ownerId === userId

  const [ou] = await db
    .select({ roleId: organizationUsers.roleId })
    .from(organizationUsers)
    .where(
      and(
        eq(organizationUsers.organizationId, organizationId),
        eq(organizationUsers.userId, userId)
      )
    )
    .limit(1)

  if (!isOwner && !ou?.roleId) {
    return null
  }

  return getPermissions(isOwner ? undefined : ou.roleId)
}

/**
 * Get all permissions (for /api/permissions list). Ordered by code.
 */
export async function getAllPermissions() {
  return await db
    .select()
    .from(permissions)
    .orderBy(asc(permissions.code))
}

// --- OAuth callback (request/response cookie handling) ---

const signInErrorUrl = (origin: string) => `${origin}/sign-in?error=auth_code_error`

function getServerAppBaseUrl(origin: string): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (envUrl && envUrl.length > 0) {
    return envUrl.replace(/\/+$/, '')
  }
  return origin.replace(/\/+$/, '')
}

/**
 * Handle OAuth callback: exchange code for session, set cookies on response.
 * Returns the redirect response and whether the callback succeeded.
 */
export async function handleOAuthCallback(
  request: NextRequest,
  code: string
): Promise<{ response: NextResponse; success: boolean }> {
  const { searchParams, origin } = new URL(request.url)
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) next = '/'

  const redirectUrl = `${getServerAppBaseUrl(origin)}${next}`

  const response = NextResponse.redirect(redirectUrl)

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return { response: NextResponse.redirect(signInErrorUrl(origin)), success: false }
  }
  if (!data.session || !data.user) {
    return { response: NextResponse.redirect(signInErrorUrl(origin)), success: false }
  }

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    return { response: NextResponse.redirect(signInErrorUrl(origin)), success: false }
  }

  return { response, success: true }
}

// --- Admin auth (service role; for user management) ---

/**
 * Create a user via Supabase Admin API (email/password).
 * Returns { user, error }. Use for admin-created users.
 */
export async function createAuthUserAdmin(params: {
  email: string
  password: string
  emailConfirm?: boolean
  userMetadata?: Record<string, unknown>
}): Promise<{ user: { id: string } | null; error: AuthOperationError | null }> {
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const supabase = createAdminClient()
  const { data, error } = await supabase.auth.admin.createUser({
    email: params.email,
    password: params.password,
    email_confirm: params.emailConfirm ?? true,
    user_metadata: params.userMetadata ?? {},
  })
  if (error) {
    return { user: null, error: { message: error.message } }
  }
  if (!data.user) {
    return { user: null, error: { message: 'No user returned' } }
  }
  return { user: { id: data.user.id }, error: null }
}

/**
 * Update a user's password via Supabase Admin API.
 */
export async function updateAuthUserPasswordAdmin(
  userId: string,
  newPassword: string
): Promise<{ error: AuthOperationError | null }> {
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const supabase = createAdminClient()
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  })
  return { error: error ? { message: error.message } : null }
}



