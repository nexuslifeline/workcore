import { NextResponse } from 'next/server'
import { unauthorizedResponse, errorResponse } from '@/lib/api-helpers'
import { resolveRequestContext } from '@/services/server/organizations/organization-service'
import {
  canViewAppNotifications,
  countUnreadAppNotificationsForOrganization,
  listAppNotificationsForOrganization,
} from '@/services/server/notifications/app-notification-service'

const empty = {
  canView: false,
  unreadCount: 0,
  notifications: [] as const,
}

/**
 * Org-scoped in-app notification feed for the active organization.
 * Visibility is the organization owner or any member.
 */
export async function GET(request: Request) {
  try {
    const ctx = await resolveRequestContext(request)
    if (!ctx.user) {
      return unauthorizedResponse()
    }

    if (!ctx.organizationId) {
      return NextResponse.json(empty)
    }

    const canView = await canViewAppNotifications(
      ctx.user.id,
      ctx.organizationId
    )
    if (!canView) {
      return NextResponse.json(empty)
    }

    const [rows, unreadCount] = await Promise.all([
      listAppNotificationsForOrganization({
        organizationId: ctx.organizationId,
        userId: ctx.user.id,
        limit: 50,
      }),
      countUnreadAppNotificationsForOrganization({
        organizationId: ctx.organizationId,
        userId: ctx.user.id,
      }),
    ])

    return NextResponse.json({
      canView: true,
      unreadCount,
      notifications: rows.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
        readAt: row.readAt ? row.readAt.toISOString() : null,
      })),
    })
  } catch (error) {
    return errorResponse('Failed to fetch notifications', 500, error)
  }
}
