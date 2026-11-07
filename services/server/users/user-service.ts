import { db } from '@/lib/db'
import { profiles, organizationUsers, roles } from '@/db/schema'
import { authUsers } from '@/db/schema/auth-users'
import { eq, and, or, inArray, ilike, desc, count, sql } from 'drizzle-orm'

export interface GetUsersParams {
  organizationId: string
  page: number
  pageSize: number
  skip: number
  search?: string
  status?: string[]
}

/**
 * Get users (profiles) for an organization with pagination and filtering
 */
export async function getUsers(params: GetUsersParams) {
  const { organizationId, page, pageSize, skip, search, status } = params

  // Get all user IDs that belong to the active organization
  const orgUserRecords = await db
    .select({ userId: organizationUsers.userId })
    .from(organizationUsers)
    .where(eq(organizationUsers.organizationId, organizationId))

  const orgUserIds = orgUserRecords.map((ou) => ou.userId)

  if (orgUserIds.length === 0) {
    return {
      users: [],
      total: 0,
    }
  }

  // Build conditions
  const conditions = orgUserIds.length > 0 ? [inArray(profiles.id, orgUserIds)] : []

  // Add search filter (name or email search)
  if (search) {
    conditions.push(
      or(
        ilike(profiles.name, `%${search}%`),
        ilike(profiles.email, `%${search}%`)
      )!
    )
  }

  // Add status filter
  if (status && status.length > 0) {
    conditions.push(inArray(profiles.status, status as any))
  }

  const whereClause = and(...conditions)

  const [profilesResult, totalResult] = await Promise.all([
    db
      .select()
      .from(profiles)
      .where(whereClause!)
      .limit(pageSize)
      .offset(skip)
      .orderBy(desc(profiles.createdAt)),
    db.select({ count: count() }).from(profiles).where(whereClause!),
  ])

  const total = totalResult[0]?.count || 0

  return {
    users: profilesResult,
    total,
  }
}

export interface GetUsersWithRolesParams extends GetUsersParams {
  ownerId: string
  roleIds?: string[]
}

/**
 * Get users for an organization with role and roleId attached (Owner vs role name).
 */
export async function getUsersWithRoles(params: GetUsersWithRolesParams) {
  const { organizationId, ownerId, page, pageSize, skip, search, status, roleIds } = params

  const orgUserConditions = [eq(organizationUsers.organizationId, organizationId)]
  if (roleIds && roleIds.length > 0) {
    orgUserConditions.push(inArray(organizationUsers.roleId, roleIds))
  }

  const orgUserRecords = await db
    .select({
      userId: organizationUsers.userId,
      roleId: organizationUsers.roleId,
      roleName: roles.name,
      joinedAt: organizationUsers.createdAt,
    })
    .from(organizationUsers)
    .leftJoin(roles, eq(organizationUsers.roleId, roles.id))
    .where(and(...orgUserConditions))

  const orgUserIds = orgUserRecords.map((ou) => ou.userId)
  const userIdToMembership = new Map(
    orgUserRecords.map((ou) => [
      ou.userId,
      {
        roleId: ou.roleId ?? null,
        roleName: ou.roleName ?? 'Member',
        joinedAt: ou.joinedAt,
      },
    ])
  )

  if (orgUserIds.length === 0) {
    return { users: [], total: 0 }
  }

  const conditions = [inArray(profiles.id, orgUserIds)]
  if (search) {
    conditions.push(
      or(
        ilike(profiles.name, `%${search}%`),
        ilike(profiles.email, `%${search}%`)
      )!
    )
  }
  if (status && status.length > 0) {
    conditions.push(inArray(profiles.status, status as any))
  }
  const whereClause = and(...conditions)

  const [profilesResult, totalResult] = await Promise.all([
    db
      .select({
        profile: profiles,
        lastLoginAt: authUsers.lastSignInAt,
      })
      .from(profiles)
      .leftJoin(authUsers, eq(authUsers.id, profiles.id))
      .where(whereClause!)
      .limit(pageSize)
      .offset(skip)
      .orderBy(desc(profiles.createdAt)),
    db.select({ count: count() }).from(profiles).where(whereClause!),
  ])

  const total = totalResult[0]?.count || 0
  const users = profilesResult.map((row) => {
    const membership = userIdToMembership.get(row.profile.id)
    const role = row.profile.id === ownerId ? 'Owner' : (membership?.roleName ?? 'Member')
    const roleId = membership?.roleId ?? null
    return {
      ...row.profile,
      role,
      roleId,
      joinedAt: membership?.joinedAt ?? null,
      lastLoginAt: row.lastLoginAt ?? null,
    }
  })

  return { users, total }
}

/**
 * Get profile by profile id and ensure the user belongs to the given organization.
 * Returns profile and org user (roleId) or null.
 */
export async function getProfileWithOrgRole(profileId: string, organizationId: string) {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .limit(1)

  if (!profile) return null

  const [orgUser] = await db
    .select({ roleId: organizationUsers.roleId })
    .from(organizationUsers)
    .where(
      and(
        eq(organizationUsers.organizationId, organizationId),
        eq(organizationUsers.userId, profile.id)
      )
    )
    .limit(1)

  if (!orgUser) return null

  return { profile, orgUser }
}

/**
 * Get role by id scoped to organization. Returns null if not found or wrong org.
 */
export async function getRoleByIdAndOrganization(roleId: string, organizationId: string) {
  const [role] = await db
    .select()
    .from(roles)
    .where(
      and(
        eq(roles.id, roleId),
        eq(roles.organizationId, organizationId)
      )
    )
    .limit(1)

  return role ?? null
}

/**
 * Create or update profile for a newly created auth user (id = userId).
 * Use when creating user via admin API; profile may not exist yet due to trigger timing.
 * Retries once after a short delay if profile is missing (trigger may be delayed).
 */
export async function ensureProfileForNewAuthUser(
  userId: string,
  data: { email: string; name: string; phone?: string | null }
) {
  let [existing] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1)

  if (!existing) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    ;[existing] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1)
  }

  if (existing) {
    const [updated] = await db
      .update(profiles)
      .set({
        name: data.name,
        phone: data.phone?.trim() || null,
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId))
      .returning()
    return updated!
  }

  const [created] = await db
    .insert(profiles)
    .values({
      id: userId,
      userId,
      email: data.email.toLowerCase().trim(),
      name: data.name.trim(),
      phone: data.phone?.trim() || null,
      status: 'active',
    })
    .returning()

  return created!
}

/**
 * Check if email exists in profiles
 */
export async function emailExists(email: string) {
  const normalized = email.toLowerCase().trim()
  const [existing] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(sql`lower(${profiles.email}) = ${normalized}`)
    .limit(1)

  return !!existing
}

/**
 * Get profile by user ID
 */
export async function getProfileByUserId(userId: string) {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1)

  return profile || null
}

/**
 * Create a new profile
 */
export async function createProfile(data: {
  userId: string
  email: string
  name: string
  phone?: string | null
  status?: string
}) {
  const insertRow: typeof profiles.$inferInsert = {
    id: data.userId,
    userId: data.userId,
    email: data.email.toLowerCase().trim(),
    name: data.name.trim(),
    phone: data.phone?.trim() || null,
    status: (data.status === 'active' || data.status === 'suspended' || data.status === 'inactive' || data.status === 'pending')
      ? (data.status as 'active' | 'suspended' | 'inactive' | 'pending')
      : 'active',
  }

  const [profile] = await db
    .insert(profiles)
    .values(insertRow)
    .returning()

  return profile
}

/**
 * Owner disable switch: pending was the old signup default, not a real disable.
 * Promote only pending. Leave inactive / suspended alone.
 */
export async function activatePendingProfile(userId: string) {
  await db
    .update(profiles)
    .set({ status: 'active', updatedAt: new Date() })
    .where(and(eq(profiles.id, userId), eq(profiles.status, 'pending')))
}

/**
 * Update a profile
 */
export async function updateProfile(
  userId: string,
  updateData: Partial<{
    name: string
    phone: string | null
    status: string
    locale: string | null
    bio: string | null
    avatarUrl: string | null
    website: string | null
    birthdate: Date | null
    address: string | null
  }>
) {
  const processedData: any = {}
  if (updateData.name !== undefined) processedData.name = updateData.name.trim()
  if (updateData.phone !== undefined) processedData.phone = updateData.phone?.trim() || null
  if (updateData.status !== undefined) processedData.status = updateData.status
  if (updateData.locale !== undefined) processedData.locale = updateData.locale?.trim() || null
  if (updateData.bio !== undefined) processedData.bio = updateData.bio?.trim() || null
  if (updateData.avatarUrl !== undefined) processedData.avatarUrl = updateData.avatarUrl?.trim() || null
  if (updateData.website !== undefined) processedData.website = updateData.website?.trim() || null
  if (updateData.birthdate !== undefined) processedData.birthdate = updateData.birthdate || null
  if (updateData.address !== undefined) processedData.address = updateData.address?.trim() || null
  processedData.updatedAt = new Date()

  const [updatedProfile] = await db
    .update(profiles)
    .set(processedData)
    .where(eq(profiles.id, userId))
    .returning()

  return updatedProfile
}

/**
 * Check if user has access to organization (owner or admin)
 */
export async function hasOrganizationAccess(userId: string, organizationId: string) {
  const { isOwnerOrAdmin } = await import('@/services/server/organizations/organization-service')
  return isOwnerOrAdmin(userId, organizationId)
}

/**
 * Add user to organization.
 * Owner is determined by organization.owner_id; the owner's org_users row may have role_id null.
 */
export async function addUserToOrganization(data: {
  organizationId: string
  userId: string
  roleId: string | null
}) {
  await db.insert(organizationUsers).values({
    organizationId: data.organizationId,
    userId: data.userId,
    roleId: data.roleId,
  })
}

/**
 * Update a user's role in an organization
 */
export async function updateOrganizationUserRole(
  userId: string,
  organizationId: string,
  roleId: string | null
) {
  await db
    .update(organizationUsers)
    .set({ roleId, updatedAt: new Date() })
    .where(
      and(
        eq(organizationUsers.userId, userId),
        eq(organizationUsers.organizationId, organizationId)
      )
    )
}
