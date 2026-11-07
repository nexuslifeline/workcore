import Link from 'next/link'

import { SignUpForm } from './components/sign-up-form'
import { RightPanelContent } from '../components/right-panel-content'
import { LogoTitle } from '../components/logo-title'

type SignUpViewProps = {
  redirectTo?: string
}

export function SignUpView({ redirectTo }: SignUpViewProps) {
  return (
    <div className='grid min-h-svh grid-cols-1 lg:h-svh lg:grid-cols-[1fr_1.2fr] lg:overflow-hidden'>
      <div className='flex h-full flex-col px-4 py-8 sm:px-8 lg:px-8 lg:py-[4rem]'>
        <div className='w-full max-w-md mb-8'>
          <LogoTitle />
        </div>

        <div className='mx-auto mt-10 flex w-full max-w-md flex-col items-start gap-6'>
          <div className='flex flex-col items-start gap-2 text-left'>
            <h1 className='text-3xl font-semibold tracking-tight'>
              Create your account
            </h1>
            <p className='text-muted-foreground'>
              Sign up with Google or Microsoft, or create an account with your
              email.
            </p>
          </div>
          <div className='w-full'>
            <SignUpForm redirectTo={redirectTo} />
          </div>
          <div className='flex w-full flex-col gap-4 text-left'>
            <p className='text-sm text-muted-foreground'>
              Already have an account?{' '}
              <Link
                href={
                  redirectTo
                    ? `/sign-in?redirect=${encodeURIComponent(redirectTo)}`
                    : '/sign-in'
                }
                className='underline underline-offset-4 hover:text-primary'
              >
                Sign In
              </Link>
            </p>
            <p className='text-xs text-muted-foreground'>
              By creating an account, you agree to our{' '}
              <Link
                href='/terms'
                className='underline underline-offset-4 hover:text-primary'
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href='/privacy'
                className='underline underline-offset-4 hover:text-primary'
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
      <div className='hidden h-full p-4 lg:block' aria-hidden>
        <RightPanelContent />
      </div>
    </div>
  )
}
