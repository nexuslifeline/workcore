import { useSearchParams } from 'next/navigation'
import { SignUpView } from './sign-up-view'

export function SignUp() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || undefined

  return <SignUpView redirectTo={redirect} />
}
