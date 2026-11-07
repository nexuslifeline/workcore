import { NextResponse } from 'next/server'
import {
  errorResponse,
  badRequestResponse,
  notFoundResponse,
} from '@/lib/api-helpers'
import { getInvitationByToken } from '@/services/server/invitations/invitation-service'

/**
 * Preview invitation details by token (public endpoint, no auth required)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token || typeof token !== 'string') {
      return badRequestResponse('Token is required')
    }

    const invitation = await getInvitationByToken(token)
    if (!invitation) {
      return notFoundResponse('Invalid invitation token')
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        {
          invitation: {
            id: invitation.id,
            status: 'expired',
            expired: true,
          },
        },
        { status: 200 }
      )
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        {
          invitation: {
            id: invitation.id,
            status: invitation.status,
            expired: false,
          },
        },
        { status: 200 }
      )
    }

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        roleId: invitation.roleId,
        role: invitation.role,
        message: invitation.message,
        expiresAt: invitation.expiresAt.toISOString(),
        organization: invitation.organization,
      },
    })
  } catch (error) {
    return errorResponse('Failed to fetch invitation', 500, error)
  }
}
