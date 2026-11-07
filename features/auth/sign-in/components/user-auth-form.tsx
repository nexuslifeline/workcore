import { useState } from 'react'
import Link from 'next/link'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Loader2, LogIn } from 'lucide-react'
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
import { signInSchema } from '@/features/auth/schemas'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
  email?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  email,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<AuthProvider | null>(null)

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: email ?? '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof signInSchema>) {
    setIsLoading(true)

    const result = await authService.signInWithPassword({
      email: data.email,
      password: data.password,
    })


    if (!result.success) {
      setIsLoading(false)
      toast.error(result.error?.message || 'Failed to sign in')
      return
    }

    if (result.user) {
      toast.success(`Welcome back, ${data.email}!`)
      const destination = redirectTo || '/'

      await authService.waitForSession()

      window.location.assign(destination)
    }
  }

  async function handleOAuthSignIn(provider: AuthProvider) {
    setOauthLoading(provider)

    const result = await authService.signInWithOAuth(provider)

    if (!result.success) {
      toast.error(
        result.error?.message ||
          `Failed to sign in with ${authProviderLabel(provider)}`
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
        <div className='grid grid-cols-2 gap-2'>
          <Button
            variant='outline'
            type='button'
            disabled={isLoading || oauthLoading !== null}
            onClick={() => handleOAuthSignIn('google')}
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
            type='button'
            disabled={isLoading || oauthLoading !== null}
            onClick={() => handleOAuthSignIn('azure')}
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
            <span className='bg-background px-2 text-muted-foreground'>OR</span>
          </div>
        </div>

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='Password' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                href='/forgot-password'
                className='absolute end-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Sign in
        </Button>
      </form>
    </Form>
  )
}
