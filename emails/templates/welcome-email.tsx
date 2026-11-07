import * as React from 'react'
import { Link, Text } from '@react-email/components'
import { EmailLayout } from '@/emails/components/email-layout'
import { EmailHeader } from '@/emails/components/email-header'
import { EmailFooter } from '@/emails/components/email-footer'
import { EmailButton } from '@/emails/components/email-button'
import { emailLinkStyle } from '@/emails/theme'

export type WelcomeEmailProps = {
  productName: string
  recipientName?: string | null
  signInUrl: string
  appUrl?: string
}

export function WelcomeEmail({
  productName,
  recipientName,
  signInUrl,
  appUrl,
}: WelcomeEmailProps) {
  const name = recipientName?.trim()
  const preview = `Welcome to ${productName}`

  return (
    <EmailLayout preview={preview}>
      <EmailHeader organizationName={productName} />

      <Text style={paragraph}>
        {name ? `Welcome aboard, ${name}!` : 'Welcome aboard!'}
      </Text>
      <Text style={paragraph}>
        Your email is confirmed and your <strong>{productName}</strong> account
        is ready. We&apos;re glad you&apos;re here.
      </Text>
      <Text style={paragraph}>
        Sign in to set up your organization, invite your team, and keep
        employee records in one place. We can&apos;t wait to see what you
        build.
      </Text>

      <Text style={ctaWrap}>
        <EmailButton href={signInUrl}>Sign in and get started</EmailButton>
      </Text>
      <Text style={secondaryLink}>
        Or copy this link:{' '}
        <Link href={signInUrl} style={emailLinkStyle}>
          {signInUrl}
        </Link>
      </Text>

      <EmailFooter appUrl={appUrl} />
    </EmailLayout>
  )
}

const paragraph: React.CSSProperties = {
  color: '#3f3f46',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 12px',
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
