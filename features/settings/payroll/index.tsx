'use client'

import { ContentSection } from '@/features/settings/components/content-section'
import { FormSkeleton, Skeleton } from '@/components/common/skeletons'
import { usePayrollSetup } from '@/hooks/use-payroll-setup'
import { useOrganizationStore } from '@/stores/organization-store'
import { PayrollSetupForm } from './payroll-form'

const title = 'Payroll'
const description = 'Default break, regular shift length, and night differential hours for this organization.'

export function SettingsPayroll() {
  const { activeOrganizationId } = useOrganizationStore()
  const { data: payrollSetup, isLoading, error } = usePayrollSetup(activeOrganizationId)

  if (!activeOrganizationId) {
    return (
      <ContentSection title={title} desc={description}>
        <p className='text-sm text-muted-foreground'>
          No active organization selected. Choose an organization from the organization switcher
          first.
        </p>
      </ContentSection>
    )
  }

  if (isLoading) {
    return (
      <ContentSection title={title} desc={description}>
        <div className='space-y-8'>
          <FormSkeleton fields={4} />
          <Skeleton className='h-10 w-44' />
        </div>
      </ContentSection>
    )
  }

  if (error || !payrollSetup) {
    return (
      <ContentSection title={title} desc={description}>
        <p className='text-sm text-muted-foreground'>
          Payroll settings could not be loaded for this organization.
        </p>
      </ContentSection>
    )
  }

  return (
    <ContentSection title={title} desc={description}>
      <PayrollSetupForm payrollSetup={payrollSetup} />
    </ContentSection>
  )
}
