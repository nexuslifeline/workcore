export function inviteAcceptPath(token: string) {
  return `/invite/accept?token=${encodeURIComponent(token)}`
}

export function inviteSignInPath(token: string, email: string) {
  const params = new URLSearchParams({
    email,
    redirect: inviteAcceptPath(token),
  })
  return `/sign-in?${params.toString()}`
}
