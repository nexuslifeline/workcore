'use client'

import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Settings } from '@/features/settings'
import { accountSidebarItems } from '@/features/settings/config/sidebar-items'
import { ContentSection } from '@/features/settings/components/content-section'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/common/form'
import { Button } from '@/components/common/button'
import { CurrencyCombobox } from '@/components/common/combobox/currency-combobox'
import { useOrganizationStore } from '@/stores/organization-store'
import { useOrganization } from '@/hooks/use-organization'
import { useUpdateOrganization } from '@/hooks/use-organization-mutations'
import { getCurrencyByCode } from '@/lib/constants/currencies'
import { useCurrencyStore } from '@/stores/currency-store'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { FormSkeleton, Skeleton } from '@/components/common/skeletons'

const preferencesSchema = z.object({
  currencyCode: z.string().min(1, 'Currency is required'),
})

type PreferencesValues = z.infer<typeof preferencesSchema>

export default function AccountPreferencesPage() {
  const { activeOrganizationId } = useOrganizationStore()
  const { data: organization, isLoading } = useOrganization(activeOrganizationId)
  const updateOrganization = useUpdateOrganization()
  const { setActiveCurrency } = useCurrencyStore()

  const form = useForm<PreferencesValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      currencyCode: 'PHP',
    },
  })

  // Sync form with organization data when loaded
  useEffect(() => {
    if (organization) {
      form.reset({
        currencyCode: organization.currencyCode || 'PHP',
      })
    }
  }, [organization, form])

  const onSubmit = (values: PreferencesValues) => {
    if (!activeOrganizationId) {
      toast.error('No active organization selected')
      return
    }

    updateOrganization.mutate(
      {
        id: activeOrganizationId,
        data: {
          currencyCode: values.currencyCode,
        },
      },
      {
        onSuccess: () => {
          const currency = getCurrencyByCode(values.currencyCode)
          if (currency) {
            setActiveCurrency(currency)
          }
          toast.success('Preferences updated successfully')
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.error ||
              error?.message ||
              'Failed to update preferences'
          )
        },
      }
    )
  }

  // If no active organization, prompt user to select one first
  if (!activeOrganizationId) {
    return (
      <Settings sidebarItems={accountSidebarItems}>
        <ContentSection
          title='Preferences'
          desc='Configure your personal and organization-level preferences, including default currency.'
        >
          <p className='text-sm text-muted-foreground'>
            No active organization selected. Please choose an organization from the top
            organization switcher first.
          </p>
        </ContentSection>
      </Settings>
    )
  }

  // While loading the organization, show skeleton loading state
  if (isLoading) {
    return (
      <Settings sidebarItems={accountSidebarItems}>
        <ContentSection
          title='Preferences'
          desc='Configure your personal and organization-level preferences, including default currency.'
        >
          <div className='space-y-8'>
            <FormSkeleton fields={1} />
            <div className='flex justify-start'>
              <Skeleton className='h-10 w-32' />
            </div>
          </div>
        </ContentSection>
      </Settings>
    )
  }

  return (
    <Settings sidebarItems={accountSidebarItems}>
      <ContentSection
        title='Preferences'
        desc='Configure your personal and organization-level preferences, including default currency.'
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-8'
          >
            <FormField
              control={form.control}
              name='currencyCode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Currency</FormLabel>
                  <FormControl>
                    <CurrencyCombobox
                      value={field.value}
                      onValueChange={field.onChange}
                      buttonClassName='w-full'
                      className='w-full'
                      disabled={isLoading || updateOrganization.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type='submit'
              disabled={!activeOrganizationId || updateOrganization.isPending}
            >
              {updateOrganization.isPending && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              Save Preferences
            </Button>
          </form>
        </Form>
      </ContentSection>
    </Settings>
  )
}


