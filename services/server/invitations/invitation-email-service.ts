import React from 'react'
import { InvitationEmail } from '@/emails/templates/invitation-email'
import { logger } from '@/lib/logger'
import {
  EmailConfigError,
  EmailSendError,
} from '@/services/server/email/email-errors'
import { sendEmail } from '@/services/server/email/email-service'
import {
  getAppBaseUrl,
  type EmailOrganization,
} from '@/services/server/email/email-helpers'
import { getProfileByUserId } from '@/services/server/users/user-service'

export function buildInvitationUrl(token: string): string {
  return `${getAppBaseUrl()}/invite/accept?token=${encodeURIComponent(token)}`
}

export type SendInvitationEmailParams = {
  to: string
  token: string
  organization: EmailOrganization
  invitedBy?: string | null
  roleName?: string | null
  message?: string | null
}

export type SendInvitationEmailResult = {
  sent: boolean
  invitationUrl: string
}

/**
 * Send an organization invitation email. Returns sent=false on SMTP/config
 * failure so the invitation row can still be kept.
 */
export async function sendInvitationEmail(
  params: SendInvitationEmailParams
): Promise<SendInvitationEmailResult> {
  const { to, token, organization, invitedBy, roleName, message } = params
  const invitationUrl = buildInvitationUrl(token)
  const appUrl = getAppBaseUrl()

  const inviter = invitedBy ? await getProfileByUserId(invitedBy) : null
  const inviterName = inviter?.name?.trim() || null
  const subject = `You're invited to join ${organization.name}`

  logger.info('Sending invitation email', {
    scope: 'invitation-email',
    organizationId: organization.id,
    to,
  })

  try {
    await sendEmail({
      to,
      subject,
      replyTo: organization.email || undefined,
      react: React.createElement(InvitationEmail, {
        organizationName: organization.name,
        organizationAddress: organization.address,
        organizationPhone: organization.phone,
        organizationEmail: organization.email,
        organizationWebsite: organization.website,
        inviterName,
        roleName: roleName ?? null,
        customMessage: message?.trim() || null,
        invitationUrl,
        appUrl,
      }),
    })
    return { sent: true, invitationUrl }
  } catch (error) {
    if (error instanceof EmailConfigError || error instanceof EmailSendError) {
      logger.error('Failed to send invitation email', error, {
        scope: 'invitation-email',
        organizationId: organization.id,
        to,
      })
      return { sent: false, invitationUrl }
    }
    throw error
  }
}
