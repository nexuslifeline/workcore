import { db } from '@/lib/db'
import { organizationUsers, organizations } from '@/db/schema'
import { and, desc, eq, or } from 'drizzle-orm'

export async function userHasOrganizationAccess(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const [org] = await db
    .select({ ownerId: organizations.ownerId })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1)

  if (!org) return false
  if (org.ownerId === userId) return true

  const [row] = await db
    .select({ id: organizationUsers.id })
    .from(organizationUsers)
    .where(
      and(
        eq(organizationUsers.organizationId, organizationId),
        eq(organizationUsers.userId, userId)
      )
    )
    .limit(1)

  return !!row
}

/**
 * Default organization for server-side context when the client has not set `active_organization_id`
 * yet: newest org among those the user owns or is a member of.
 */
export async function resolveActiveOrganizationIdForUser(
  userId: string
): Promise<string | null> {
  const [row] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .leftJoin(
      organizationUsers,
      and(
        eq(organizationUsers.organizationId, organizations.id),
        eq(organizationUsers.userId, userId)
      )
    )
    .where(
      or(
        eq(organizations.ownerId, userId),
        eq(organizationUsers.userId, userId)
      )
    )
    .orderBy(desc(organizations.createdAt))
    .limit(1)

  return row?.id ?? null
}
