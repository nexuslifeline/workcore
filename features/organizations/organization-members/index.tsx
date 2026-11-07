'use client'

import { PageHeader } from '@/components/common/page-header'
import { FallbackSection } from '@/components/common/fallback-section'
import { useOrganization } from '@/hooks/use-organization'
import { OrganizationMembersTable } from './organization-members-table'
import { OrganizationMembersPrimaryButtons } from './organization-members-primary-buttons'

type OrganizationMembersProps = {
  organizationId: string
}

export function OrganizationMembers({ organizationId }: OrganizationMembersProps) {
  const { data: organization, isLoading: isLoadingOrg, error } = useOrganization(organizationId)

  // Show error only if organization fetch fails, but still render table
  // The table will handle its own loading state with skeleton
  const showError = error && !isLoadingOrg

  const title = isLoadingOrg
    ? 'Members'
    : organization
      ? `${organization.name} - Members`
      : 'Members'

  return (
    <>
      <PageHeader
        title={title}
        description='View and manage organization members.'
        actions={<OrganizationMembersPrimaryButtons organizationId={organizationId} />}
        showBackButton
        backHref='/organizations'
      />
      {showError ? (
        <FallbackSection
          title='Organization not found'
          message={error?.message || 'The organization you are looking for does not exist or you do not have access to it.'}
        />
      ) : (
        <OrganizationMembersTable organizationId={organizationId} />
      )}
    </>
  )
}
