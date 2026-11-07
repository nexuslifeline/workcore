import * as React from 'react'
import { Link, Text } from '@react-email/components'
import { emailLinkStyle } from '@/emails/theme'

type EmailFooterProps = {
  organizationName?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  /** App origin used for the Workcore link. Falls back to NEXT_PUBLIC_APP_URL. */
  appUrl?: string
}

export function EmailFooter({
  organizationName,
  address,
  phone,
  email,
  website,
  appUrl,
}: EmailFooterProps) {
  const orgName = organizationName?.trim()
  const contactParts = [address, phone, email].filter(Boolean)
  const websiteHref = website?.trim()
  const workcoreUrl =
    appUrl?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim() || ''

  return (
    <>
      <Text style={divider}>&nbsp;</Text>
      {orgName ? <Text style={orgLine}>{orgName}</Text> : null}
      {contactParts.length > 0 && (
        <Text style={muted}>{contactParts.join(' · ')}</Text>
      )}
      {websiteHref ? (
        <Text style={muted}>
          <Link
            href={websiteHref.startsWith('http') ? websiteHref : `https://${websiteHref}`}
            style={emailLinkStyle}
          >
            {websiteHref}
          </Link>
        </Text>
      ) : null}
      <Text style={poweredBy}>
        Powered by{' '}
        {workcoreUrl ? (
          <Link href={workcoreUrl} style={emailLinkStyle}>
            Workcore
          </Link>
        ) : (
          'Workcore'
        )}
      </Text>
    </>
  )
}

const divider: React.CSSProperties = {
  borderBottom: '1px solid #e4e4e7',
  fontSize: '1px',
  lineHeight: '1px',
  margin: '24px 0 16px',
}

const orgLine: React.CSSProperties = {
  color: '#3f3f46',
  fontSize: '13px',
  fontWeight: 600,
  lineHeight: '20px',
  margin: '0 0 4px',
}

const muted: React.CSSProperties = {
  color: '#71717a',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0 0 4px',
}

const poweredBy: React.CSSProperties = {
  color: '#a1a1aa',
  fontSize: '11px',
  lineHeight: '16px',
  margin: '16px 0 0',
}

