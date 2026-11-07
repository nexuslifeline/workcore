import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { BsGoogle, BsMicrosoft } from 'react-icons/bs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { authService } from '@/services/client/auth/auth-service'
import {
  authProviderLabel,
  type AuthProvider,
} from '@/services/client/auth/types'
import { Button } from '@/components/common/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/common/form'
import { Input } from '@/components/common/input'
import { PasswordInput } from '@/components/password-input'
import { signUpSchema } from '@/features/auth/schemas'

function getInviteTokenFromRedirect(redirectTo?: string): string | undefined {
  if (!redirectTo) return undefined
  try {
    const url = new URL(redirectTo, 'https://placeholder.local')
    if (!url.pathname.startsWith('/invite/accept')) return undefined
    return url.searchParams.get('token') ?? undefined
  } catch {
    return undefined
  }
}

interface SignUpFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
  inviteToken?: string
  lockedEmail?: string
  hideOAuth?: boolean
  onSignedUp?: () => void
}

export function SignUpForm({
  className,
  redirectTo,
  inviteToken,
  lockedEmail,
  hideOAuth,
  onSignedUp,
  ...props
}: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<AuthProvider | null>(null)
  const router = useRouter()
  const resolvedInviteToken =
    inviteToken ?? getInviteTokenFromRedirect(redirectTo)
  const showOAuth = !hideOAuth && !resolvedInviteToken

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: lockedEmail ?? '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: z.infer<typeof signUpSchema>) {
    setIsLoading(true)

    const result = await authService.signUp({
      email: lockedEmail?.trim() || data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      inviteToken: resolvedInviteToken,
    })

    setIsLoading(false)

    if (!result.success) {
      toast.error(result.error?.message || 'Failed to create account')
      return
    }

    if (!result.user) return

    toast.success('Account created! Please check your email to verify your account.')
    form.reset({
      email: lockedEmail ?? '',
      password: '',
      confirmPassword: '',
    })

    if (onSignedUp) {
      onSignedUp()
      return
    }

    if (resolvedInviteToken || !redirectTo) {
      router.push('/sign-in')
      return
    }

    router.push(`/sign-in?redirect=${encodeURIComponent(redirectTo)}`)
  }

  async function handleOAuthSignUp(provider: AuthProvider) {
    setOauthLoading(provider)

    const result = await authService.signInWithOAuth(provider, {
      redirectTo: redirectTo || '/',
    })

    if (!result.success) {
      toast.error(
        result.error?.message ||
          `Failed to sign up with ${authProviderLabel(provider)}`
      )
      setOauthLoading(null)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        {showOAuth ? (
          <>
            <div className='grid grid-cols-2 gap-2'>
              <Button
                variant='outline'
                className='w-full'
                type='button'
                disabled={isLoading || oauthLoading !== null}
                onClick={() => handleOAuthSignUp('google')}
              >
                {oauthLoading === 'google' ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <BsGoogle size={16} />
                )}
                Google
              </Button>
              <Button
                variant='outline'
                className='w-full'
                type='button'
                disabled={isLoading || oauthLoading !== null}
                onClick={() => handleOAuthSignUp('azure')}
              >
                {oauthLoading === 'azure' ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <BsMicrosoft size={16} />
                )}
                Microsoft
              </Button>
            </div>

            <div className='relative my-2'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-background px-2 text-muted-foreground'>
                  OR
                </span>
              </div>
            </div>
          </>
        ) : null}

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder='name@example.com'
                  autoComplete='email'
                  disabled={Boolean(lockedEmail)}
                  readOnly={Boolean(lockedEmail)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='Password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='Confirm password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : null}
          Create Account
        </Button>
      </form>
    </Form>
  )
}
