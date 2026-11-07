'use client'

import { useParams, useRouter } from 'next/navigation'
import { OrganizationEdit } from '@/features/organizations/organization-edit'

export default function OrganizationEditPage() {
  const params = useParams()
  const organizationId = params.id as string

  return <OrganizationEdit organizationId={organizationId} />
}

