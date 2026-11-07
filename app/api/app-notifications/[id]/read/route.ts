import { NextResponse } from 'next/server'
import {
  errorResponse,
  noPermissionResponse,
  notFoundResponse,
} from '@/lib/api-helpers'
import {
  resolveRequestContext,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import {
  canViewAppNotifications,
  markAppNotificationRead,
} from '@/services/server/notifications/app-notification-service'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ctx = validateRequestContext(await resolveRequestContext(request))

    const organizationId = ctx.organization.id
    const canView = await canViewAppNotifications(
      ctx.user.id,
      organizationId
    )
    if (!canView) {
      return noPermissionResponse()
    }

    const marked = await markAppNotificationRead({
      id,
      userId: ctx.user.id,
      organizationId,
    })
    if (!marked) {
      return notFoundResponse('Notification not found')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return errorResponse('Failed to mark notification read', 500, error)
  }
}
