import { db } from '@/lib/db'
import {
  organizations,
  organizationUsers,
  roles,
  profiles,
} from '@/db/schema'
import { eq, and, or, inArray, ilike, desc, count } from 'drizzle-orm'
import { extractOrganizationId } from '@/lib/organization-helpers'
import { getAuthenticatedUser } from '@/services/server/auth/auth-service'
import { listInvitedByForMembers } from '@/services/server/invitations/invitation-service'
import {
  unauthorizedResponse,
  errorResponse,
  badRequestResponse,
} from '@/lib/api-helpers'

export async function isOwnerOrAdmin(userId: string, organizationId: string): Promise<boolean> {
  const [org] = await db
    .select({ ownerId: organizations.ownerId })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1)

  if (org?.ownerId === userId) {
    return true
  }

  const [ou] = await db
    .select({ roleName: roles.name })
    .from(organizationUsers)
    .leftJoin(roles, eq(organizationUsers.roleId, roles.id))
    .where(
      and(
        eq(organizationUsers.organizationId, organizationId),
        eq(organizationUsers.userId, userId)
      )
    )
    .limit(1)

  if (!ou) return false
  return ou.roleName?.toLowerCase() === 'admin'
}

export async function verifyUserAccess(userId: string, organizationId: string): Promise<boolean> {
  const [row] = await db
    .select({
      ownerId: organizations.ownerId,
      memberUserId: organizationUsers.userId,
    })
    .from(organizations)
    .leftJoin(
      organizationUsers,
      and(
        eq(organizationUsers.organizationId, organizations.id),
        eq(organizationUsers.userId, userId)
      )
    )
    .where(eq(organizations.id, organizationId))
    .limit(1)

  if (!row) return false
  return row.ownerId === userId || row.memberUserId != null
}

export async function getOrganizationById(organizationId: string) {
  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1)

  return organization || null
}

export type UpdateOrganizationData = Partial<{
  name: string
  description: string | null
  logoUrl: string | null
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  contactPerson: string | null
  industry: string | null
  status: string | null
  currencyCode: string
}>

export async function updateOrganization(
  organizationId: string,
  updateData: UpdateOrganizationData
) {
  const [updated] = await db
    .update(organizations)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, organizationId))
    .returning()

  return updated || null
}

export interface GetOrganizationMembersParams {
  organizationId: string
  ownerId: string
  page: number
  pageSize: number
  skip: number
  search?: string
  status?: string[]
  roleIds?: string[]
}

export async function getOrganizationMembers(params: GetOrganizationMembersParams) {
  const { organizationId, ownerId, page, pageSize, skip, search, status, roleIds } = params

  const orgUserConditions = [eq(organizationUsers.organizationId, organizationId)]
  if (roleIds && roleIds.length > 0) {
    const wantsOwner = roleIds.includes('owner')
    const selectedRoleIds = roleIds.filter((id) => id !== 'owner' && isRoleId(id))
    const roleMatch = [
      ...(wantsOwner ? [eq(organizationUsers.userId, ownerId)] : []),
      ...(selectedRoleIds.length > 0
        ? [inArray(organizationUsers.roleId, selectedRoleIds)]
        : []),
    ]
    if (roleMatch.length === 0) {
      return { members: [], total: 0 }
    }
    orgUserConditions.push(or(...roleMatch)!)
  }

  const orgUsers = await db
    .select({
      userId: organizationUsers.userId,
      roleId: organizationUsers.roleId,
      roleName: roles.name,
      joinedAt: organizationUsers.createdAt,
    })
    .from(organizationUsers)
    .leftJoin(roles, eq(organizationUsers.roleId, roles.id))
    .where(and(...orgUserConditions))

  const userIds = orgUsers.map((ou) => ou.userId)
  const membershipByUser = new Map(
    orgUsers.map((ou) => [
      ou.userId,
      {
        role: ou.userId === ownerId ? 'Owner' : (ou.roleName ?? 'Member'),
        roleId: ou.userId === ownerId ? null : ou.roleId,
        joinedAt: ou.joinedAt,
      },
    ])
  )

  if (userIds.length === 0) {
    return { members: [], total: 0 }
  }

  const profileConditions = [inArray(profiles.id, userIds)]
  if (search) {
    profileConditions.push(
      or(
        ilike(profiles.name, `%${search}%`),
        ilike(profiles.email, `%${search}%`)
      )!
    )
  }
  if (status && status.length > 0) {
    profileConditions.push(inArray(profiles.status, status as any))
  }

  const whereClause = and(...profileConditions)
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

  const total = totalResult[0]?.count ?? 0
  const invitedByByMemberId = await listInvitedByForMembers({
    organizationId,
    members: profilesResult.map((profile) => ({
      id: profile.id,
      email: profile.email,
    })),
  })
  const members = profilesResult.map((profile) => {
    const membership = membershipByUser.get(profile.id)
    return {
      ...profile,
      role: membership?.role ?? 'Member',
      roleId: membership?.roleId ?? null,
      joinedAt: membership?.joinedAt ?? null,
      invitedByName: invitedByByMemberId.get(profile.id) ?? null,
    }
  })

  return { members, total }
}

function isRoleId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  )
}

export type RequestContextOrganization = {
  id: string
  name: string
  ownerId: string
  memberId?: string | null
  roleId?: string | null
  [key: string]: any
}

export type OrganizationAuthContext = {
  organization?: RequestContextOrganization
}

export async function resolveOrganizationAuthContext(
  userId: string,
  organizationId: string
): Promise<OrganizationAuthContext> {
  const [row] = await db
    .select({
      organizations,
      memberUserId: organizationUsers.userId,
      memberRoleId: organizationUsers.roleId,
    })
    .from(organizations)
    .leftJoin(
      organizationUsers,
      and(
        eq(organizationUsers.organizationId, organizations.id),
        eq(organizationUsers.userId, userId)
      )
    )
    .where(eq(organizations.id, organizationId))
    .limit(1)

  if (!row) {
    return {}
  }

  const organization: RequestContextOrganization = {
    ...row.organizations,
    memberId: row.memberUserId ?? null,
    roleId: row.memberRoleId ?? null,
  }

  return { organization }
}

export type RequestContext = {
  user: Awaited<ReturnType<typeof getAuthenticatedUser>>
  organizationId: string | null
  organization: RequestContextOrganization | null
}

export async function resolveRequestContext(request: Request): Promise<RequestContext> {
  const user = await getAuthenticatedUser()
  const organizationId = extractOrganizationId(request)

  let ctx: OrganizationAuthContext = { organization: undefined }

  if (user && organizationId) {
    ctx = await resolveOrganizationAuthContext(user.id, organizationId)
  }

  return {
    user,
    organizationId: organizationId ?? null,
    organization: ctx.organization ?? null,
  }
}

export async function resolveRequestContextForOrganization(
  organizationId: string
): Promise<RequestContext> {
  const user = await getAuthenticatedUser()
  let ctx: OrganizationAuthContext = { organization: undefined }
  if (user) {
    ctx = await resolveOrganizationAuthContext(user.id, organizationId)
  }
  return {
    user,
    organizationId,
    organization: ctx.organization ?? null,
  }
}

export function validateRequestContext(
  ctx: RequestContext,
  options: { requireOrganization: false }
): RequestContext & { user: NonNullable<RequestContext['user']> }
export function validateRequestContext(
  ctx: RequestContext,
  options?: { requireOrganization?: true }
): RequestContext & {
  user: NonNullable<RequestContext['user']>
  organization: NonNullable<RequestContext['organization']>
}
export function validateRequestContext(
  ctx: RequestContext,
  options?: { requireOrganization?: boolean }
): RequestContext & {
  user: NonNullable<RequestContext['user']>
  organization: RequestContext['organization']
} {
  if (!ctx.user) {
    throw unauthorizedResponse()
  }

  if (options?.requireOrganization === false) {
    return ctx as RequestContext & {
      user: NonNullable<RequestContext['user']>
    }
  }

  if (!ctx.organizationId) {
    throw badRequestResponse('Organization ID is required')
  }

  if (!ctx.organization) {
    throw errorResponse('Organization not found', 404)
  }

  const isOwner = ctx.organization.ownerId === ctx.user.id
  const isMember = !!ctx.organization.memberId

  if (!isOwner && !isMember) {
    throw errorResponse(
      'You do not have access to this organization or are not a member of it.',
      403
    )
  }

  return ctx as RequestContext & {
    user: NonNullable<RequestContext['user']>
    organization: NonNullable<RequestContext['organization']>
  }
}

export interface ListOrganizationsForUserParams {
  userId: string
  page: number
  pageSize: number
  skip: number
  search?: string
  status?: string[]
  industry?: string[]
}

export async function listOrganizationsForUser(params: ListOrganizationsForUserParams) {
  const { userId, page, pageSize, skip, search, status, industry } = params

  const userOrgRecords = await db
    .select({ organizationId: organizationUsers.organizationId })
    .from(organizationUsers)
    .where(eq(organizationUsers.userId, userId))

  const userOrgIds = userOrgRecords.map((ou) => ou.organizationId)
  if (userOrgIds.length === 0) {
    return { organizations: [], total: 0 }
  }

  const conditions = [inArray(organizations.id, userOrgIds)]
  if (search) {
    conditions.push(ilike(organizations.name, `%${search}%`))
  }
  if (status && status.length > 0) {
    conditions.push(inArray(organizations.status, status as any))
  }
  if (industry && industry.length > 0) {
    conditions.push(inArray(organizations.industry, industry as any))
  }
  const whereClause = and(...conditions)

  const [organizationsResult, totalResult] = await Promise.all([
    db
      .select({
        id: organizations.id,
        ownerId: organizations.ownerId,
        name: organizations.name,
        description: organizations.description,
        logoUrl: organizations.logoUrl,
        address: organizations.address,
        phone: organizations.phone,
        email: organizations.email,
        website: organizations.website,
        contactPerson: organizations.contactPerson,
        industry: organizations.industry,
        status: organizations.status,
        currencyCode: organizations.currencyCode,
        createdAt: organizations.createdAt,
        updatedAt: organizations.updatedAt,
        currentUserRoleName: roles.name,
      })
      .from(organizations)
      .leftJoin(
        organizationUsers,
        and(
          eq(organizationUsers.organizationId, organizations.id),
          eq(organizationUsers.userId, userId)
        )
      )
      .leftJoin(roles, eq(roles.id, organizationUsers.roleId))
      .where(whereClause!)
      .limit(pageSize)
      .offset(skip)
      .orderBy(desc(organizations.createdAt)),
    db.select({ count: count() }).from(organizations).where(whereClause!),
  ])

  const organizationsWithRole = organizationsResult.map(
    ({ currentUserRoleName, ...organization }) => ({
      ...organization,
      currentUserRole:
        organization.ownerId === userId
          ? 'Owner'
          : currentUserRoleName?.trim() || null,
    })
  )

  const total = totalResult[0]?.count || 0
  return { organizations: organizationsWithRole, total }
}

export async function createOrganization(params: {
  ownerId: string
  name: string
  description?: string | null
}) {
  const [organization] = await db
    .insert(organizations)
    .values({
      ownerId: params.ownerId,
      name: params.name.trim(),
      description: params.description?.trim() || null,
      status: 'active',
    })
    .returning()

  await db.insert(organizationUsers).values({
    organizationId: organization.id,
    userId: params.ownerId,
    roleId: null,
  })

  return organization
}
