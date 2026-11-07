/** String for Avatar `name` so initials match name, or email local-part before @ when name is empty. */
export function avatarNameForInitials(name: string | null, email: string | null): string {
  const trimmed = name?.trim()
  if (trimmed) return trimmed

  const em = email?.trim()
  if (!em) return '?'

  const at = em.indexOf('@')
  const local = at === -1 ? em : em.slice(0, at)
  if (!local) return '?'

  const parts = local.split(/[._-]+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]} ${parts[1]}`
  if (parts.length === 1) {
    const p = parts[0]
    if (p.length >= 2) return `${p[0]} ${p[1]}`
    return p
  }
  return '?'
}
