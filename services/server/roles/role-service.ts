import { db } from '@/lib/db'
import { roles, rolePermissions, organizationUsers, profiles } from '@/db/schema'
import { eq, and, or, ilike, asc, desc, sql } from 'drizzle-orm'

export type RoleMemberPreview = {
  id: string
  name: string | null
  avatarUrl: string | null
}

export interface GetRolesParams {
  organizationId: string
  page: number
  pageSize: number
  skip: number
  search?: string
  isActive?: string[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Get roles with pagination, filtering, and sorting
 */
export async function getRoles(params: GetRolesParams) {
  const { organizationId, pageSize, skip, search, isActive, sortBy, sortOrder } = params

  const conditions = [eq(roles.organizationId, organizationId)]

  if (search) {
    conditions.push(
      or(
        ilike(roles.name, `%${search}%`),
        ilike(roles.description, `%${search}%`)
      )!
    )
  }

  if (isActive && isActive.length > 0) {
    if (isActive.includes('active') && !isActive.includes('inactive')) {
      conditions.push(eq(roles.isActive, true))
    } else if (!isActive.includes('active') && isActive.includes('inactive')) {
      conditions.push(eq(roles.isActive, false))
    }
  }

  const whereClause = and(...conditions)

  const sortColumnMap: Record<string, Parameters<typeof asc>[0]> = {
    name: roles.name,
    description: roles.description,
    isActive: roles.isActive,
    createdAt: roles.createdAt,
    updatedAt: roles.updatedAt,
  }

  let orderByClause = asc(roles.name)
  if (sortBy && sortOrder && sortColumnMap[sortBy]) {
    orderByClause =
      sortOrder === 'desc'
        ? desc(sortColumnMap[sortBy])
        : asc(sortColumnMap[sortBy])
  }

  const permissionCounts = db
    .select({
      roleId: rolePermissions.roleId,
      permissionCount: sql<number>`count(*) filter (where ${rolePermissions.isAllowed} = true)::int`.as(
        'permission_count'
      ),
    })
    .from(rolePermissions)
    .groupBy(rolePermissions.roleId)
    .as('role_permission_counts')

  const rankedMembers = db
    .select({
      roleId: organizationUsers.roleId,
      id: profiles.id,
      name: profiles.name,
      avatarUrl: profiles.avatarUrl,
      rn: sql<number>`row_number() over (partition by ${organizationUsers.roleId} order by ${organizationUsers.createdAt} asc)`.as(
        'rn'
      ),
    })
    .from(organizationUsers)
    .innerJoin(profiles, eq(profiles.id, organizationUsers.userId))
    .where(eq(organizationUsers.organizationId, organizationId))
    .as('ranked_role_members')

  const roleMembers = db
    .select({
      roleId: rankedMembers.roleId,
      memberCount: sql<number>`count(*)::int`.as('member_count'),
      memberPreviews: sql<RoleMemberPreview[]>`
        coalesce(
          json_agg(
            json_build_object(
              'id', ${rankedMembers.id},
              'name', ${rankedMembers.name},
              'avatarUrl', ${rankedMembers.avatarUrl}
            )
            order by ${rankedMembers.rn}
          ) filter (where ${rankedMembers.rn} <= 3),
          '[]'::json
        )
      `.as('member_previews'),
    })
    .from(rankedMembers)
    .groupBy(rankedMembers.roleId)
    .as('role_members')

  const rolesResult = await db
    .select({
      id: roles.id,
      organizationId: roles.organizationId,
      name: roles.name,
      description: roles.description,
      isActive: roles.isActive,
      createdAt: roles.createdAt,
      updatedAt: roles.updatedAt,
      permissionCount: sql<number>`coalesce(${permissionCounts.permissionCount}, 0)`,
      memberCount: sql<number>`coalesce(${roleMembers.memberCount}, 0)`,
      memberPreviews: sql<RoleMemberPreview[]>`coalesce(${roleMembers.memberPreviews}, '[]'::json)`,
      filteredTotal: sql<number>`count(*) over()`.as('filtered_total'),
    })
    .from(roles)
    .leftJoin(permissionCounts, eq(roles.id, permissionCounts.roleId))
    .leftJoin(roleMembers, eq(roles.id, roleMembers.roleId))
    .where(whereClause!)
    .limit(pageSize)
    .offset(skip)
    .orderBy(orderByClause)

  const total = Number(rolesResult[0]?.filteredTotal ?? 0)

  return {
    roles: rolesResult.map(({ filteredTotal: _filteredTotal, memberPreviews, ...role }) => ({
      ...role,
      memberPreviews: parseRoleMemberPreviews(memberPreviews),
    })),
    total,
  }
}

function parseRoleMemberPreviews(value: unknown): RoleMemberPreview[] {
  const parsed = typeof value === 'string' ? JSON.parse(value) : value
  if (!Array.isArray(parsed)) return []
  return parsed.flatMap((item) => {
    if (!item || typeof item !== 'object' || typeof item.id !== 'string') return []
    return [
      {
        id: item.id,
        name: typeof item.name === 'string' ? item.name : null,
        avatarUrl: typeof item.avatarUrl === 'string' ? item.avatarUrl : null,
      },
    ]
  })
}

/**
 * Create a new role
 */
export async function createRole(data: {
  organizationId: string
  name: string
  description?: string | null
  isActive?: boolean
}) {
  const [role] = await db
    .insert(roles)
    .values({
      organizationId: data.organizationId,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      isActive: data.isActive ?? true,
    })
    .returning()

  return role
}

export type OrganizationRoleOption = {
  id: string
  name: string
}

/** Role id + name for an org (members Role filter). Not the workspace /roles list. */
export async function listRoleOptionsForOrganization(organizationId: string) {
  return db
    .select({
      id: roles.id,
      name: roles.name,
    })
    .from(roles)
    .where(eq(roles.organizationId, organizationId))
    .orderBy(asc(roles.name))
}

/**
 * Get role by ID
 */
export async function getRoleById(roleId: string, organizationId: string) {
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
 * Update a role
 */
export async function updateRole(
  roleId: string,
  organizationId: string,
  updateData: Partial<{
    name: string
    description: string | null
    isActive: boolean
  }>
) {
  const processedData: {
    name?: string
    description?: string | null
    isActive?: boolean
  } = {}
  if (updateData.name !== undefined) processedData.name = updateData.name.trim()
  if (updateData.description !== undefined) processedData.description = updateData.description?.trim() ?? null
  if (updateData.isActive !== undefined) processedData.isActive = updateData.isActive

  const [updatedRole] = await db
    .update(roles)
    .set(processedData)
    .where(
      and(
        eq(roles.id, roleId),
        eq(roles.organizationId, organizationId)
      )
    )
    .returning()

  return updatedRole ?? null
}

/**
 * Delete a role
 */
export async function deleteRole(roleId: string, organizationId: string) {
  await db
    .delete(roles)
    .where(
      and(
        eq(roles.id, roleId),
        eq(roles.organizationId, organizationId)
      )
    )
}

export interface RolePermissionItem {
  permission_id: string
  is_allowed: boolean
}

/**
 * Get current permissions for a role. Returns null if role not found.
 */
export async function getRolePermissions(
  roleId: string,
  organizationId: string
): Promise<{ permission_id: string; is_allowed: boolean }[] | null> {
  const role = await getRoleById(roleId, organizationId)
  if (!role) return null
  const rows = await db
    .select()
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, roleId))
  return rows.map((r) => ({
    permission_id: r.permissionId,
    is_allowed: r.isAllowed,
  }))
}

/**
 * Set permissions for a role (insert or update by permission_id).
 * Returns the role's permissions after the update, or null if the role was not found.
 */
export async function setRolePermissions(
  roleId: string,
  organizationId: string,
  permissions: RolePermissionItem[]
): Promise<{ permission_id: string; is_allowed: boolean }[] | null> {
  const role = await getRoleById(roleId, organizationId)
  if (!role) return null

  if (permissions.length === 0) {
    const current = await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId))
    return current.map((r) => ({
      permission_id: r.permissionId,
      is_allowed: r.isAllowed,
    }))
  }

  const values = permissions.map((p) => ({
    roleId,
    permissionId: p.permission_id,
    isAllowed: p.is_allowed,
  }))

  await db
    .insert(rolePermissions)
    .values(values)
    .onConflictDoUpdate({
      target: [rolePermissions.roleId, rolePermissions.permissionId],
      set: { isAllowed: sql`excluded.is_allowed` },
    })

  const updated = await db
    .select()
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, roleId))

  return updated.map((r) => ({
    permission_id: r.permissionId,
    is_allowed: r.isAllowed,
  }))
}
