import * as React from 'react'
import { Text } from '@react-email/components'

export type EmailDetailRow = {
  label: string
  value?: string | null
}

export function EmailDetailList({
  heading,
  rows,
}: {
  heading?: string
  rows: EmailDetailRow[]
}) {
  const visible = rows.filter((row) => row.value?.trim())
  if (visible.length === 0) return null

  return (
    <>
      {heading ? <Text style={summaryHeading}>{heading}</Text> : null}
      {visible.map((row) => (
        <Text key={row.label} style={summaryLine}>
          <strong>{row.label}:</strong> {row.value}
        </Text>
      ))}
    </>
  )
}

const summaryHeading: React.CSSProperties = {
  color: '#18181b',
  fontSize: '14px',
  fontWeight: 600,
  lineHeight: '20px',
  margin: '8px 0 8px',
}

const summaryLine: React.CSSProperties = {
  color: '#3f3f46',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 4px',
}
