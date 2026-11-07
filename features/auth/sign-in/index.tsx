'use client'

import { useSearchParams } from 'next/navigation'

import { SignInView } from './sign-in-view'

export function SignIn() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || undefined

  return <SignInView redirectTo={redirect} />
}
