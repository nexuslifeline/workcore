import { NextResponse } from 'next/server'
import { errorResponse, notFoundResponse } from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import {
  resolveRequestContextForOrganization,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import {
  getInvitationByIdWithOrgAndRole,
  getInvitationById,
  revokeInvitation,
} from '@/services/server/invitations/invitation-service'

const CAN_MANAGE_INVITES = [
  PERMISSIONS.SYSTEM_USERS,
  PERMISSIONS.SYSTEM_ORGANIZATIONS,
]

/**
 * Get invitation details (for preview before accepting)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await getInvitationByIdWithOrgAndRole(id)
    if (!result) {
      return notFoundResponse('Invitation not found')
    }

    const { invitation, organization, roleName } = result

    if (invitation.status !== 'pending' || new Date() > invitation.expiresAt) {
      return NextResponse.json(
        {
          invitation: {
            id: invitation.id,
            status: invitation.status,
            expired: new Date() > invitation.expiresAt,
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
        role: roleName ?? undefined,
        message: invitation.message,
        expiresAt: invitation.expiresAt,
        organization,
      },
    })
  } catch (error) {
    return errorResponse('Failed to fetch invitation', 500, error)
  }
}

/**
 * Revoke an invitation
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const invitation = await getInvitationById(id)
    if (!invitation) {
      return notFoundResponse('Invitation not found')
    }

    const ctx = validateRequestContext(
      await resolveRequestContextForOrganization(invitation.organizationId)
    )
    validatePermissions(await resolvePermissions(ctx), CAN_MANAGE_INVITES)

    await revokeInvitation(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to revoke invitation', 500, error)
  }
}
