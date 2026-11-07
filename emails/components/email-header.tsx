import * as React from 'react'
import { Heading, Text } from '@react-email/components'

type EmailHeaderProps = {
  organizationName: string
}

export function EmailHeader({ organizationName }: EmailHeaderProps) {
  return (
    <>
      <Heading as='h1' style={heading}>
        {organizationName}
      </Heading>
      <Text style={divider}>&nbsp;</Text>
    </>
  )
}

const heading: React.CSSProperties = {
  color: '#18181b',
  fontSize: '22px',
  fontWeight: 700,
  lineHeight: '28px',
  margin: '0 0 8px',
}

const divider: React.CSSProperties = {
  borderBottom: '1px solid #e4e4e7',
  fontSize: '1px',
  lineHeight: '1px',
  margin: '0 0 20px',
}
