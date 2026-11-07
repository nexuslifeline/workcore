'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

import { SignInView } from '@/features/auth/sign-in/sign-in-view'

function SignInContent() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || undefined
  const email = searchParams.get('email') || undefined

  return <SignInView redirectTo={redirect} email={email} />
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  )
}
