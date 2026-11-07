import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAccount } from '@/hooks/use-account'
import { useUpdateAccount } from '@/hooks/use-account-mutations'
import { Button } from '@/components/common/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/common/form'
import { Input } from '@/components/common/input'
import { Combobox } from '@/components/common/combobox'
import { Loader2, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import React from 'react'
import { AccountFormSkeleton } from './account-form-skeleton'
import { ChangePasswordDialog } from './change-password-dialog'

const languages = [
  { label: 'English', value: 'en' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Spanish', value: 'es' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Russian', value: 'ru' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
  { label: 'Chinese', value: 'zh' },
]

const accountFormSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  locale: z.string().optional(),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

export function AccountForm() {
  const { data: account, isLoading } = useAccount()
  const updateMutation = useUpdateAccount()
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = React.useState(false)

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: '',
      locale: '',
    },
  })

  // Update form when account data loads
  React.useEffect(() => {
    if (account) {
      form.reset({
        email: account.email || '',
        locale: account.locale || '',
      })
    }
  }, [account, form])

  const onSubmit = (values: AccountFormValues) => {
    const payload: {
      locale?: string
    } = {}

    // Email is readonly - don't include it in updates
    // Password changes are handled in the modal

    if (values.locale !== account?.locale) {
      payload.locale = values.locale || null
    }

    // Only submit if there are changes
    if (Object.keys(payload).length > 0) {
      updateMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Account updated successfully')
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to update account')
        }
      })
    }
  }

  if (isLoading) {
    return <AccountFormSkeleton />
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Email</FormLabel>
              <FormControl>
                <Input
                  type='email'
                  placeholder='your.email@example.com'
                  readOnly
                  className='bg-muted cursor-not-allowed'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This is your account email address. You'll use this to sign in. To change your email, please contact support or use the password reset flow.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='text-sm font-medium'>Password</h4>
              <p className='text-sm text-muted-foreground'>
                Change your account password to keep it secure.
              </p>
            </div>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsPasswordDialogOpen(true)}
              className='flex items-center gap-2'
            >
              <KeyRound className='h-4 w-4' />
              Change Password
            </Button>
          </div>
        </div>

        <FormField
          control={form.control}
          name='locale'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Language</FormLabel>
              <FormControl>
                <Combobox
                  options={languages}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder='Select language'
                  searchPlaceholder='Search language...'
                  emptyMessage='No language found.'
                />
              </FormControl>
              <FormDescription>
                This is the language that will be used in the dashboard.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Updating...
            </>
          ) : (
            'Update account'
          )}
        </Button>
      </form>

      <ChangePasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />
    </Form>
  )
}
