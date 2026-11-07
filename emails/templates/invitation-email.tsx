import * as React from 'react'
import { Link, Text } from '@react-email/components'
import { EmailLayout } from '@/emails/components/email-layout'
import { EmailHeader } from '@/emails/components/email-header'
import { EmailFooter } from '@/emails/components/email-footer'
import { EmailButton } from '@/emails/components/email-button'
import { emailLinkStyle } from '@/emails/theme'

export type InvitationEmailProps = {
  organizationName: string
  organizationAddress?: string | null
  organizationPhone?: string | null
  organizationEmail?: string | null
  organizationWebsite?: string | null
  inviterName?: string | null
  roleName?: string | null
  customMessage?: string | null
  invitationUrl: string
  appUrl?: string
}

export function InvitationEmail({
  organizationName,
  organizationAddress,
  organizationPhone,
  organizationEmail,
  organizationWebsite,
  inviterName,
  roleName,
  customMessage,
  invitationUrl,
  appUrl,
}: InvitationEmailProps) {
  const inviter = inviterName?.trim() || 'A teammate'
  const role = roleName?.trim() || 'a member'
  const preview = `${inviter} invited you to join ${organizationName}`

  return (
    <EmailLayout preview={preview}>
      <EmailHeader organizationName={organizationName} />

      <Text style={paragraph}>Hello,</Text>
      <Text style={paragraph}>
        {inviter} invited you to join <strong>{organizationName}</strong> as{' '}
        <strong>{role}</strong>. Click the button below to accept the invitation
        and get started.
      </Text>

      {customMessage && <Text style={messageBox}>{customMessage}</Text>}

      <Text style={ctaWrap}>
        <EmailButton href={invitationUrl}>Accept Invitation</EmailButton>
      </Text>
      <Text style={secondaryLink}>
        Or copy this link:{' '}
        <Link href={invitationUrl} style={emailLinkStyle}>
          {invitationUrl}
        </Link>
      </Text>

      <EmailFooter
        organizationName={organizationName}
        address={organizationAddress}
        phone={organizationPhone}
        email={organizationEmail}
        website={organizationWebsite}
        appUrl={appUrl}
      />
    </EmailLayout>
  )
}

const paragraph: React.CSSProperties = {
  color: '#3f3f46',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 12px',
}

const messageBox: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  borderRadius: '6px',
  color: '#3f3f46',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 16px',
  padding: '12px 14px',
  whiteSpace: 'pre-wrap' as const,
}

const ctaWrap: React.CSSProperties = {
  margin: '24px 0 12px',
}

const secondaryLink: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 8px',
  wordBreak: 'break-all' as const,
}

