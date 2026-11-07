import * as React from 'react'
import { Button } from '@react-email/components'
import { EMAIL_PRIMARY, EMAIL_PRIMARY_FOREGROUND } from '@/emails/theme'

type EmailButtonProps = {
  href: string
  children: React.ReactNode
}

export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Button href={href} style={button}>
      {children}
    </Button>
  )
}

const button: React.CSSProperties = {
  backgroundColor: EMAIL_PRIMARY,
  borderRadius: '6px',
  color: EMAIL_PRIMARY_FOREGROUND,
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: 600,
  lineHeight: '20px',
  padding: '12px 20px',
  textAlign: 'center' as const,
  textDecoration: 'none',
}
