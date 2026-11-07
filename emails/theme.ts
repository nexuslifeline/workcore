import type { CSSProperties } from 'react'

/** Matches --primary / --primary-foreground in styles/theme.css. */
export const EMAIL_PRIMARY = '#7332FE'
export const EMAIL_PRIMARY_FOREGROUND = '#ffffff'

export const emailLinkStyle: CSSProperties = {
  color: EMAIL_PRIMARY,
  textDecoration: 'underline',
}
