import { NextResponse } from 'next/server'
import {
  unauthorizedResponse,
  errorResponse,
  badRequestResponse,
  notFoundResponse,
} from '@/lib/api-helpers'
import { getAuthenticatedUser } from '@/services/server/auth/auth-service'
import { verifyUserAccess } from '@/services/server/organizations/organization-service'
import {
  getInvitationByTokenForAccept,
  markInvitationExpired,
  markInvitationAccepted,
} from '@/services/server/invitations/invitation-service'
import {
  addUserToOrganization,
  activatePendingProfile,
} from '@/services/server/users/user-service'

/**
 * Accept an invitation
 */
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { token } = body

    if (!token || typeof token !== 'string') {
      return badRequestResponse('Token is required')
    }

    const result = await getInvitationByTokenForAccept(token)
    if (!result) {
      return notFoundResponse('Invalid invitation token')
    }

    const { invitation, organization } = result

    if (invitation.status !== 'pending') {
      return badRequestResponse(
        `Invitation has been ${invitation.status}`
      )
    }

    if (new Date() > invitation.expiresAt) {
      await markInvitationExpired(invitation.id)
      return badRequestResponse('Invitation has expired')
    }

    if (user.email && user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return badRequestResponse(
        'This invitation was sent to a different email address'
      )
    }

    const isAlreadyMember = await verifyUserAccess(user.id, invitation.organizationId)
    if (!isAlreadyMember) {
      try {
        await addUserToOrganization({
          organizationId: invitation.organizationId,
          userId: user.id,
          roleId: invitation.roleId,
        })
      } catch (error) {
        const alreadyJoined = await verifyUserAccess(
          user.id,
          invitation.organizationId
        )
        if (!alreadyJoined) {
          throw error
        }
      }
    }

    await Promise.all([
      markInvitationAccepted(invitation.id, user.id),
      activatePendingProfile(user.id),
    ])

    return NextResponse.json({
      success: true,
      organization: {
        id: organization.id,
        name: organization.name,
      },
    })
  } catch (error) {
    return errorResponse('Failed to accept invitation', 500, error)
  }
}
