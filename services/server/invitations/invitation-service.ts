import { db } from '@/lib/db'
import { invitations, organizationUsers, organizations, profiles, roles } from '@/db/schema'
import { eq, and, or, inArray, ilike, desc, count, gt, notExists, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'

export interface ListInvitationsForUserParams {
  organizationId: string
  page: number
  pageSize: number
  skip: number
  search?: string
  status?: string[]
}

export interface ListInvitationsForUserItem {
  id: string
  userId: null
  name: null
  email: string
  phone: null
  avatarUrl: null
  status: 'pending' | 'accepted' | 'revoked' | 'expired'
  type: 'invitation'
  roleId: string
  role?: string
  invitationExpiresAt: Date
  invitationToken: string
  message: string | null
  organizationName: string
  invitedByName: string | null
  invitationAcceptedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/**
 * List invitations for the active organization (Users → Invitations tab).
 */
export async function listInvitationsForUser(
  params: ListInvitationsForUserParams
): Promise<{ invitations: ListInvitationsForUserItem[]; total: number }> {
  const { organizationId, page, pageSize, skip, search, status } = params

  const conditions = [eq(invitations.organizationId, organizationId)]

  if (status && status.length > 0) {
    const valid = status.filter((s): s is 'pending' | 'accepted' | 'revoked' | 'expired' =>
      ['pending', 'accepted', 'revoked', 'expired'].includes(s)
    )
    if (valid.length > 0) {
      conditions.push(inArray(invitations.status, valid))
    }
  }

  if (search) {
    conditions.push(ilike(invitations.email, `%${search}%`))
  }

  const whereClause = and(...conditions)

  const [rows, totalResult] = await Promise.all([
    db
      .select({
        invitation: invitations,
        organization: { id: organizations.id, name: organizations.name },
        roleName: roles.name,
        invitedByName: profiles.name,
        invitedByEmail: profiles.email,
      })
      .from(invitations)
      .leftJoin(organizations, eq(invitations.organizationId, organizations.id))
      .leftJoin(roles, eq(invitations.roleId, roles.id))
      .leftJoin(
        profiles,
        or(
          eq(profiles.id, invitations.invitedBy),
          eq(profiles.userId, invitations.invitedBy)
        )
      )
      .where(whereClause!)
      .limit(pageSize)
      .offset(skip)
      .orderBy(desc(invitations.createdAt)),
    db.select({ count: count() }).from(invitations).where(whereClause!),
  ])

  const total = totalResult[0]?.count ?? 0
  const invitationsList: ListInvitationsForUserItem[] = rows.map((row) => {
    const inv = row.invitation
    return {
      id: inv.id,
      userId: null,
      name: null,
      email: inv.email,
      phone: null,
      avatarUrl: null,
      status: inv.status,
      type: 'invitation' as const,
      roleId: inv.roleId,
      role: row.roleName ?? undefined,
      invitationExpiresAt: inv.expiresAt,
      invitationToken: inv.token,
      message: inv.message,
      organizationName: row.organization?.name ?? '',
      invitedByName:
        row.invitedByName?.trim() || row.invitedByEmail?.trim() || null,
      invitationAcceptedAt: inv.acceptedAt,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
    }
  })

  return { invitations: invitationsList, total }
}

export type InvitationWithOrganization = {
  id: string
  email: string
  roleId: string
  role?: string
  message: string | null
  expiresAt: Date
  status: 'pending' | 'accepted' | 'revoked' | 'expired'
  acceptedByUserId: string | null
  invitedByName: string | null
  organization: {
    id: string
    name: string
    description: string | null
    logoUrl: string | null
  }
}

/**
 * Get invitation by token with organization details
 */
export async function getInvitationByToken(
  token: string
): Promise<InvitationWithOrganization | null> {
  try {
    const [result] = await db
      .select({
        id: invitations.id,
        email: invitations.email,
        roleId: invitations.roleId,
        message: invitations.message,
        expiresAt: invitations.expiresAt,
        status: invitations.status,
        acceptedByUserId: invitations.acceptedByUserId,
        organizationId: invitations.organizationId,
        organizationName: organizations.name,
        organizationDescription: organizations.description,
        organizationLogoUrl: organizations.logoUrl,
        roleName: roles.name,
        invitedByName: profiles.name,
        invitedByEmail: profiles.email,
      })
      .from(invitations)
      .leftJoin(organizations, eq(invitations.organizationId, organizations.id))
      .leftJoin(roles, eq(invitations.roleId, roles.id))
      .leftJoin(
        profiles,
        or(
          eq(profiles.id, invitations.invitedBy),
          eq(profiles.userId, invitations.invitedBy)
        )
      )
      .where(eq(invitations.token, token))
      .limit(1)

    if (!result) {
      return null
    }

    return {
      id: result.id,
      email: result.email,
      roleId: result.roleId,
      role: result.roleName ?? undefined,
      message: result.message,
      expiresAt: result.expiresAt,
      status: result.status,
      acceptedByUserId: result.acceptedByUserId,
      invitedByName:
        result.invitedByName?.trim() || result.invitedByEmail?.trim() || null,
      organization: {
        id: result.organizationId,
        name: result.organizationName || '',
        description: result.organizationDescription,
        logoUrl: result.organizationLogoUrl,
      },
    } as InvitationWithOrganization
  } catch (_error) {
    return null
  }
}

export type InvitationWithRole = {
  id: string
  organizationId: string
  email: string
  roleId: string
  role?: string
  message: string | null
  token: string
  status: 'pending' | 'accepted' | 'revoked' | 'expired'
  invitedBy: string | null
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

/**
 * List all invitations for an organization (for org admins).
 */
export async function listInvitationsByOrganization(
  organizationId: string
): Promise<InvitationWithRole[]> {
  const rows = await db
    .select({
      invitation: invitations,
      roleName: roles.name,
    })
    .from(invitations)
    .leftJoin(roles, eq(invitations.roleId, roles.id))
    .where(eq(invitations.organizationId, organizationId))
    .orderBy(desc(invitations.createdAt))

  return rows.map((row) => ({
    ...row.invitation,
    role: row.roleName ?? undefined,
  })) as InvitationWithRole[]
}

export type CreateInvitationParams = {
  organization: { id: string; ownerId: string }
  email: string
  roleId: string
  message?: string | null
  invitedBy?: string | null
  token: string
  expiresAt: Date
}

export type CreateInvitationResult =
  | { success: true; invitation: InvitationWithRole; roleName: string }
  | { success: false; error: 'invalid_role' | 'pending_exists' | 'already_member' }

/**
 * Create an invitation. Validates role, a live pending invite, and whether the
 * email already belongs to the org owner or a member.
 */
export async function createInvitation(
  params: CreateInvitationParams
): Promise<CreateInvitationResult> {
  const { organization, email, roleId, message, invitedBy, token, expiresAt } = params
  const organizationId = organization.id
  const normalizedEmail = email.toLowerCase().trim()

  // Separate roots (role id, invite email, profile email). Do not join: a
  // product of rows plus limit(1) can hide a pending invite or membership.
  const [[roleRow], [existingInvitation], [existingProfile]] = await Promise.all([
    // Role must belong to this organization.
    db
      .select()
      .from(roles)
      .where(and(eq(roles.id, roleId), eq(roles.organizationId, organizationId)))
      .limit(1),
    // Live pending invite for this email in this organization.
    db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.organizationId, organizationId),
          eq(invitations.email, normalizedEmail),
          eq(invitations.status, 'pending'),
          gt(invitations.expiresAt, new Date())
        )
      )
      .limit(1),
    // Profile for this email; memberUserId is set only if they are already in this org.
    db
      .select({
        id: profiles.id,
        memberUserId: organizationUsers.userId,
      })
      .from(profiles)
      .leftJoin(
        organizationUsers,
        and(
          eq(organizationUsers.organizationId, organizationId),
          eq(organizationUsers.userId, profiles.id)
        )
      )
      .where(eq(profiles.email, normalizedEmail))
      .limit(1),
  ])

  if (!roleRow) {
    return { success: false, error: 'invalid_role' }
  }

  if (existingInvitation) {
    return { success: false, error: 'pending_exists' }
  }

  const isAlreadyMember = Boolean(
    existingProfile &&
      (existingProfile.id === organization.ownerId || existingProfile.memberUserId)
  )
  if (isAlreadyMember) {
    return { success: false, error: 'already_member' }
  }

  const [invitation] = await db
    .insert(invitations)
    .values({
      organizationId,
      email: normalizedEmail,
      roleId,
      message: message?.trim() || null,
      token,
      status: 'pending',
      invitedBy: invitedBy ?? null,
      expiresAt,
    })
    .returning()

  return {
    success: true,
    invitation: { ...invitation, role: roleRow.name } as InvitationWithRole,
    roleName: roleRow.name,
  }
}

/**
 * Get invitation by ID. Returns null if not found.
 */
export async function getInvitationById(id: string) {
  const [invitation] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.id, id))
    .limit(1)
  return invitation ?? null
}

export type InvitationByIdWithOrgAndRoleResult = {
  invitation: typeof invitations.$inferSelect
  organization: {
    id: string
    name: string
    description: string | null
    logoUrl: string | null
  }
  roleName: string | null
}

/**
 * Get invitation by ID with organization and role name (for [id] GET preview).
 */
export async function getInvitationByIdWithOrgAndRole(
  id: string
): Promise<InvitationByIdWithOrgAndRoleResult | null> {
  const [result] = await db
    .select({
      invitation: invitations,
      organization: {
        id: organizations.id,
        name: organizations.name,
        description: organizations.description,
        logoUrl: organizations.logoUrl,
      },
      roleName: roles.name,
    })
    .from(invitations)
    .leftJoin(organizations, eq(invitations.organizationId, organizations.id))
    .leftJoin(roles, eq(invitations.roleId, roles.id))
    .where(eq(invitations.id, id))
    .limit(1)

  if (!result) return null
  return {
    invitation: result.invitation,
    organization: result.organization,
    roleName: result.roleName ?? null,
  }
}

export type InvitationByIdWithRoleResult = {
  invitation: typeof invitations.$inferSelect
  roleName: string | null
}

/**
 * Get invitation by ID with role name (for resend).
 */
export async function getInvitationByIdWithRole(
  id: string
): Promise<InvitationByIdWithRoleResult | null> {
  const [result] = await db
    .select({
      invitation: invitations,
      roleName: roles.name,
    })
    .from(invitations)
    .leftJoin(roles, eq(invitations.roleId, roles.id))
    .where(eq(invitations.id, id))
    .limit(1)

  if (!result) return null
  return {
    invitation: result.invitation,
    roleName: result.roleName ?? null,
  }
}

/**
 * Revoke an invitation (set status to 'revoked').
 */
export async function revokeInvitation(id: string): Promise<void> {
  await db
    .update(invitations)
    .set({ status: 'revoked', updatedAt: new Date() })
    .where(eq(invitations.id, id))
}

/**
 * Mark invitation as expired.
 */
export async function markInvitationExpired(id: string): Promise<void> {
  await db
    .update(invitations)
    .set({ status: 'expired', updatedAt: new Date() })
    .where(eq(invitations.id, id))
}

/**
 * Mark invitation as accepted.
 */
export async function markInvitationAccepted(
  id: string,
  acceptedByUserId: string
): Promise<void> {
  await db
    .update(invitations)
    .set({
      status: 'accepted',
      acceptedByUserId,
      acceptedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(invitations.id, id))
}

export type PendingInvitationInboxItem = {
  id: string
  token: string
  email: string
  role: string | null
  message: string | null
  invitedByName: string | null
  expiresAt: Date
  organization: {
    id: string
    name: string
    logoUrl: string | null
  }
}

/**
 * Pending invitations addressed to this email that the user has not already joined.
 */
export async function listPendingInvitationsInbox(params: {
  userId: string
  email: string
}): Promise<PendingInvitationInboxItem[]> {
  const normalizedEmail = params.email.toLowerCase().trim()
  if (!normalizedEmail) return []

  const alreadyMember = db
    .select({ id: organizationUsers.id })
    .from(organizationUsers)
    .where(
      and(
        eq(organizationUsers.organizationId, invitations.organizationId),
        eq(organizationUsers.userId, params.userId)
      )
    )

  const rows = await db
    .select({
      id: invitations.id,
      token: invitations.token,
      email: invitations.email,
      message: invitations.message,
      expiresAt: invitations.expiresAt,
      organizationId: invitations.organizationId,
      organizationName: organizations.name,
      organizationLogoUrl: organizations.logoUrl,
      roleName: roles.name,
      invitedByName: profiles.name,
      invitedByEmail: profiles.email,
    })
    .from(invitations)
    .innerJoin(organizations, eq(invitations.organizationId, organizations.id))
    .leftJoin(roles, eq(invitations.roleId, roles.id))
    .leftJoin(
      profiles,
      or(
        eq(profiles.id, invitations.invitedBy),
        eq(profiles.userId, invitations.invitedBy)
      )
    )
    .where(
      and(
        sql`lower(${invitations.email}) = ${normalizedEmail}`,
        eq(invitations.status, 'pending'),
        gt(invitations.expiresAt, new Date()),
        notExists(alreadyMember)
      )
    )
    .orderBy(desc(invitations.createdAt))

  return rows.map((row) => ({
    id: row.id,
    token: row.token,
    email: row.email,
    role: row.roleName ?? null,
    message: row.message,
    invitedByName:
      row.invitedByName?.trim() || row.invitedByEmail?.trim() || null,
    expiresAt: row.expiresAt,
    organization: {
      id: row.organizationId,
      name: row.organizationName,
      logoUrl: row.organizationLogoUrl,
    },
  }))
}

export type InvitationByTokenForAcceptResult = {
  invitation: typeof invitations.$inferSelect
  organization: { id: string; name: string }
}

/**
 * Get invitation by token with organization (for accept flow). Returns full invitation row and org id/name.
 */
export async function getInvitationByTokenForAccept(
  token: string
): Promise<InvitationByTokenForAcceptResult | null> {
  const [result] = await db
    .select({
      invitation: invitations,
      orgId: organizations.id,
      orgName: organizations.name,
    })
    .from(invitations)
    .leftJoin(organizations, eq(invitations.organizationId, organizations.id))
    .where(eq(invitations.token, token))
    .limit(1)

  if (!result?.invitation) return null
  return {
    invitation: result.invitation,
    organization: {
      id: result.orgId ?? result.invitation.organizationId,
      name: result.orgName ?? '',
    },
  }
}

/**
 * Latest accepted invite's sender for each member in this org.
 * Keyed by member user id. Owner / Add User / no invite → omitted.
 */
export async function listInvitedByForMembers(params: {
  organizationId: string
  members: { id: string; email: string | null }[]
}): Promise<Map<string, string>> {
  const invitedByByMemberId = new Map<string, string>()
  if (params.members.length === 0) return invitedByByMemberId

  const userIds = params.members.map((member) => member.id)
  const emails = [
    ...new Set(
      params.members
        .map((member) => member.email?.trim().toLowerCase())
        .filter((email): email is string => Boolean(email))
    ),
  ]

  const inviters = alias(profiles, 'member_inviters')
  const rows = await db
    .select({
      acceptedByUserId: invitations.acceptedByUserId,
      email: invitations.email,
      invitedByName: inviters.name,
      invitedByEmail: inviters.email,
    })
    .from(invitations)
    .leftJoin(
      inviters,
      or(
        eq(inviters.id, invitations.invitedBy),
        eq(inviters.userId, invitations.invitedBy)
      )
    )
    .where(
      and(
        eq(invitations.organizationId, params.organizationId),
        eq(invitations.status, 'accepted'),
        or(
          inArray(invitations.acceptedByUserId, userIds),
          emails.length > 0
            ? inArray(sql<string>`lower(${invitations.email})`, emails)
            : sql`false`
        )
      )
    )
    .orderBy(desc(invitations.acceptedAt), desc(invitations.createdAt))

  const byUserId = new Map<string, string>()
  const byEmail = new Map<string, string>()
  for (const row of rows) {
    const name = row.invitedByName?.trim() || row.invitedByEmail?.trim()
    if (!name) continue
    if (row.acceptedByUserId && !byUserId.has(row.acceptedByUserId)) {
      byUserId.set(row.acceptedByUserId, name)
    }
    if (row.email) {
      const email = row.email.trim().toLowerCase()
      if (email && !byEmail.has(email)) {
        byEmail.set(email, name)
      }
    }
  }

  for (const member of params.members) {
    const name =
      byUserId.get(member.id) ??
      (member.email ? byEmail.get(member.email.trim().toLowerCase()) : undefined)
    if (name) invitedByByMemberId.set(member.id, name)
  }

  return invitedByByMemberId
}

