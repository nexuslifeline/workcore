'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogIn, Mail } from 'lucide-react'
import { Button } from '@/components/common/button'
import { SignUpForm } from '@/features/auth/sign-up/components/sign-up-form'
import { inviteSignInPath } from '@/features/invitations/lib/invite-paths'

export function InviteSignUpPanel({
  email,
  token,
  organizationName,
}: {
  email: string
  token: string
  organizationName: string
}) {
  const [signedUp, setSignedUp] = useState(false)

  if (signedUp) {
    return (
      <div className='space-y-3'>
        <div className='flex items-start gap-2'>
          <Mail className='mt-0.5 h-4 w-4 shrink-0' />
          <p className='text-sm text-muted-foreground'>
            Account created. Check your email to verify, then sign in to join{' '}
            {organizationName}.
          </p>
        </div>
        <Button asChild className='w-full'>
          <Link href={inviteSignInPath(token, email)}>
            <LogIn className='h-4 w-4' />
            Sign in
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-2 border-t pt-4'>
      <p className='text-sm font-medium'>Create an account to join {organizationName}</p>
      <p className='text-sm text-muted-foreground'>
        Use {email}. That is the address this invite was sent to.
      </p>
      <SignUpForm
        lockedEmail={email}
        inviteToken={token}
        hideOAuth
        onSignedUp={() => setSignedUp(true)}
      />
    </div>
  )
}
