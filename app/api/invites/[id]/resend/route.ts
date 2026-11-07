import { NextResponse } from 'next/server'
import {
  errorResponse,
  notFoundResponse,
  badRequestResponse,
} from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import {
  getOrganizationById,
  resolveRequestContextForOrganization,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import { getInvitationByIdWithOrgAndRole } from '@/services/server/invitations/invitation-service'
import { sendInvitationEmail } from '@/services/server/invitations/invitation-email-service'

const CAN_MANAGE_INVITES = [
  PERMISSIONS.SYSTEM_USERS,
  PERMISSIONS.SYSTEM_ORGANIZATIONS,
]

/**
 * Resend invitation email (and return the invitation link).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await getInvitationByIdWithOrgAndRole(id)
    if (!result) {
      return notFoundResponse('Invitation not found')
    }

    const { invitation, organization } = result
    const ctx = validateRequestContext(
      await resolveRequestContextForOrganization(invitation.organizationId)
    )
    validatePermissions(await resolvePermissions(ctx), CAN_MANAGE_INVITES)

    if (invitation.status !== 'pending') {
      return badRequestResponse(`Invitation has been ${invitation.status}`)
    }

    if (new Date() > invitation.expiresAt) {
      return badRequestResponse('Invitation has expired')
    }

    const org = await getOrganizationById(invitation.organizationId)

    const { sent, invitationUrl } = await sendInvitationEmail({
      to: invitation.email,
      token: invitation.token,
      organization: {
        id: org?.id ?? organization.id,
        name: org?.name ?? organization.name,
        address: org?.address ?? null,
        phone: org?.phone ?? null,
        email: org?.email ?? null,
        website: org?.website ?? null,
      },
      invitedBy: invitation.invitedBy,
      roleName: result.roleName,
      message: invitation.message,
    })

    return NextResponse.json({
      invitationUrl,
      emailSent: sent,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        roleId: invitation.roleId,
        role: result.roleName ?? undefined,
        expiresAt: invitation.expiresAt,
      },
    })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to resend invitation', 500, error)
  }
}
