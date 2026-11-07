type LogContext = Record<string, unknown>

function formatContext(context?: LogContext): string {
  if (!context || Object.keys(context).length === 0) return ''
  try {
    return ` ${JSON.stringify(context)}`
  } catch {
    return ''
  }
}

/**
 * Thin structured logger for server-side use.
 * Prefer scoped prefixes (e.g. scope: 'email') for greppable logs.
 * Never pass secrets, full email HTML, or full share tokens.
 */
export const logger = {
  info(message: string, context?: LogContext) {
    // eslint-disable-next-line no-console
    console.info(`[info] ${message}${formatContext(context)}`)
  },

  warn(message: string, context?: LogContext) {
    // eslint-disable-next-line no-console
    console.warn(`[warn] ${message}${formatContext(context)}`)
  },

  error(message: string, error?: unknown, context?: LogContext) {
    // eslint-disable-next-line no-console
    console.error(`[error] ${message}${formatContext(context)}`, error ?? '')
  },
}

/** Truncate share tokens for log correlation without leaking the full secret. */
export function truncateToken(token: string, length = 8): string {
  if (token.length <= length) return token
  return `${token.slice(0, length)}…`
}
