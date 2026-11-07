'use client'

import { ContentSection } from '@/features/settings/components/content-section'
import { FallbackSection } from '@/components/common/fallback-section'
import { useOrganization } from '@/hooks/use-organization'
import { OrganizationEditForm } from './organization-edit-form'
import { OrganizationEditSkeleton } from './organization-edit-skeleton'

type OrganizationEditProps = {
  organizationId: string
}

export function OrganizationEdit({ organizationId }: OrganizationEditProps) {
  const { data: organization, isLoading, error } = useOrganization(organizationId)

  return (
    <ContentSection
      title='Organization Settings'
      desc='Manage your organization name, contact details, and status.'
      showBackButton
      backHref='/organizations'
    >
      {isLoading ? (
        <OrganizationEditSkeleton />
      ) : error || !organization ? (
        <FallbackSection
          title='Organization not found'
          message={error?.message || 'The organization you are looking for does not exist or you do not have access to it.'}
        />
      ) : (
        <OrganizationEditForm organization={organization} />
      )}
    </ContentSection>
  )
}

