import { after, NextResponse } from 'next/server'
import { errorResponse, badRequestResponse } from '@/lib/api-helpers'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import {
  resolveRequestContextForOrganization,
  validateRequestContext,
} from '@/services/server/organizations/organization-service'
import { resolvePermissions, validatePermissions } from '@/lib/shared/permissions'
import {
  listInvitationsByOrganization,
  createInvitation,
  type CreateInvitationResult,
} from '@/services/server/invitations/invitation-service'
import {
  buildInvitationUrl,
  sendInvitationEmail,
} from '@/services/server/invitations/invitation-email-service'
import { logger } from '@/lib/logger'
import { randomUUID } from 'crypto'

const CAN_MANAGE_INVITES = [
  PERMISSIONS.SYSTEM_USERS,
  PERMISSIONS.SYSTEM_ORGANIZATIONS,
]

type CreateInvitationError = Extract<CreateInvitationResult, { success: false }>['error']

const CREATE_INVITATION_ERROR_MESSAGES = {
  invalid_role: 'Invalid role for this organization',
  already_member: 'This email already belongs to a member of this organization',
  pending_exists: 'A pending invitation already exists for this email',
} satisfies Record<CreateInvitationError, string>

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const ctx = validateRequestContext(
      await resolveRequestContextForOrganization(organizationId)
    )
    validatePermissions(await resolvePermissions(ctx), CAN_MANAGE_INVITES)

    const invitationsWithRole = await listInvitationsByOrganization(organizationId)
    return NextResponse.json({ invitations: invitationsWithRole })
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to fetch invitations', 500, error)
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const ctx = validateRequestContext(
      await resolveRequestContextForOrganization(organizationId)
    )
    validatePermissions(await resolvePermissions(ctx), CAN_MANAGE_INVITES)

    const body = await request.json()
    const { email, roleId, message } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return badRequestResponse('Valid email is required')
    }
    if (!roleId || typeof roleId !== 'string') {
      return badRequestResponse('Role is required')
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    const token = randomUUID()

    const result = await createInvitation({
      organization: { id: ctx.organization.id, ownerId: ctx.organization.ownerId },
      email,
      roleId,
      message,
      invitedBy: ctx.user.id,
      token,
      expiresAt,
    })

    if (result.success === false) {
      return badRequestResponse(CREATE_INVITATION_ERROR_MESSAGES[result.error])
    }

    const invitationUrl = buildInvitationUrl(token)
    const emailParams = {
      to: result.invitation.email,
      token,
      organization: {
        id: ctx.organization.id,
        name: ctx.organization.name,
        address: ctx.organization.address ?? null,
        phone: ctx.organization.phone ?? null,
        email: ctx.organization.email ?? null,
        website: ctx.organization.website ?? null,
      },
      invitedBy: ctx.user.id,
      roleName: result.roleName,
      message: result.invitation.message,
    }

    after(async () => {
      try {
        await sendInvitationEmail(emailParams)
      } catch (error) {
        logger.error('Invitation email failed after create', error, {
          scope: 'invitation-email',
          organizationId,
          invitationId: result.invitation.id,
        })
      }
    })

    return NextResponse.json(
      {
        invitation: {
          id: result.invitation.id,
          email: result.invitation.email,
          roleId: result.invitation.roleId,
          role: result.roleName,
          message: result.invitation.message,
          status: result.invitation.status,
          expiresAt: result.invitation.expiresAt,
          createdAt: result.invitation.createdAt,
        },
        invitationUrl,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof NextResponse) return error
    return errorResponse('Failed to create invitation', 500, error)
  }
}
