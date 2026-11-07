'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/common/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/common/form'
import { PasswordInput } from '@/components/password-input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/common/card'
import { AuthLayout } from '@/features/auth/auth-layout'

const formSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Please enter your password')
      .min(7, 'Password must be at least 7 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

function ResetPasswordContent() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    // Verify we have a valid session for password reset
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error('Invalid or expired reset link')
        router.push('/forgot-password')
      }
    })
  }, [router, supabase.auth])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) {
        toast.error(error.message || 'Failed to reset password')
        setIsLoading(false)
        return
      }

      toast.success('Password reset successfully!')
      router.push('/sign-in')
    } catch (error) {
      toast.error('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            Reset Password
          </CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='grid gap-3'
            >
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder='New password' {...field} />
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
                Reset Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
