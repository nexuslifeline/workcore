'use client'

import { useParams } from 'next/navigation'
import { OrganizationMembers } from '@/features/organizations/organization-members'

export default function OrganizationMembersPage() {
  const params = useParams()
  const organizationId = params.id as string

  return <OrganizationMembers organizationId={organizationId} />
}
