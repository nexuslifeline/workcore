import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
} from '@react-email/components'

type EmailLayoutProps = {
  preview: string
  children: React.ReactNode
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang='en'>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={section}>{children}</Section>
        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: 0,
  padding: '24px 0',
}

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  margin: '0 auto',
  maxWidth: '560px',
  padding: '32px 28px',
}

const section: React.CSSProperties = {
  width: '100%',
}
