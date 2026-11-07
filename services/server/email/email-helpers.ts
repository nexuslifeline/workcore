import { format } from 'date-fns'

export { isValidEmail, parseRecipientEmails, resolveRecipientEmails } from '@/lib/email-recipients'

export function getAppBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    'http://localhost:3000'
  return base.replace(/\/$/, '')
}

export function formatOptionalDate(
  value: Date | string | null | undefined
): string | null {
  if (!value) return null
  try {
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return format(date, 'MMM d, yyyy')
  } catch {
    return null
  }
}

export type EmailOrganization = {
  id: string
  name: string
  address?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  currencyCode?: string | null
}
