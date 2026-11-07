/**
 * Split a recipient field into individual emails.
 * Accepts comma, semicolon, or whitespace separators.
 */
export function parseRecipientEmails(value: string): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const part of value.split(/[,;\s]+/)) {
    const email = part.trim().toLowerCase()
    if (!email || seen.has(email)) continue
    seen.add(email)
    result.push(email)
  }

  return result
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/**
 * Parse and validate recipients. Returns emails or an error message.
 */
export function resolveRecipientEmails(value: string): {
  emails: string[]
  error: string | null
} {
  const emails = parseRecipientEmails(value)
  if (emails.length === 0) {
    return { emails: [], error: 'Enter at least one email address' }
  }
  const invalid = emails.filter((email) => !isValidEmail(email))
  if (invalid.length > 0) {
    return {
      emails: [],
      error: `Invalid email address${invalid.length > 1 ? 'es' : ''}: ${invalid.join(', ')}`,
    }
  }
  return { emails, error: null }
}
