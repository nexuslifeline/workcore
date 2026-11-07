'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SignUpView } from '@/features/auth/sign-up/sign-up-view'

function SignUpContent() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || undefined

  return <SignUpView redirectTo={redirect} />
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpContent />
    </Suspense>
  )
}
