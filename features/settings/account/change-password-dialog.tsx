'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/common/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/common/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/common/form'
import { PasswordInput } from '@/components/password-input'
import { useUpdateAccount } from '@/hooks/use-account-mutations'
import { useAccount } from '@/hooks/use-account'
import { Loader2 } from 'lucide-react'

// Dynamic schema based on whether user has existing password
const createPasswordFormSchema = (hasPassword: boolean) => {
  return z
    .object({
      currentPassword: hasPassword
        ? z.string().min(1, 'Current password is required.')
        : z.string().optional(),
      password: z.string().min(7, 'Password must be at least 7 characters long.'),
      confirmPassword: z.string().min(1, 'Please confirm your password.'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match.",
      path: ['confirmPassword'],
    })
}

type PasswordFormValues = {
  currentPassword?: string
  password: string
  confirmPassword: string
}

type ChangePasswordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const { data: account } = useAccount()
  const updateMutation = useUpdateAccount()
  const hasPassword = account?.hasPassword ?? true // Default to true for safety

  const form = useForm<any>({
    resolver: zodResolver(createPasswordFormSchema(hasPassword)),
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: PasswordFormValues) => {
    try {
      await updateMutation.mutateAsync({
        password: values.password,
        // Only include currentPassword if user has an existing password
        ...(hasPassword && values.currentPassword
          ? { currentPassword: values.currentPassword }
          : {}),
      })
      // Reset form and close dialog on success
      form.reset()
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in the mutation hook (toast notification)
      // Form errors will be displayed inline
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      form.reset()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {hasPassword ? 'Change Password' : 'Set Password'}
          </DialogTitle>
          <DialogDescription>
            {hasPassword
              ? "Update your account password to keep it secure. You'll need to enter your current password to confirm the change."
              : "Set a password for your account. This will allow you to sign in with your email and password in addition to your social login."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {hasPassword && (
              <FormField
                control={form.control}
                name='currentPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder='Enter your current password'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder='Enter your new password'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Password must be at least 7 characters long.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder='Confirm your new password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
