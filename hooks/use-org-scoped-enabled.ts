'use client'

import { useOrganizationStore } from '@/stores/organization-store'

/** Gate org-scoped API queries until an active organization is selected. */
export function useOrgScopedEnabled(enabled = true): boolean {
  const { activeOrganizationId } = useOrganizationStore()
  return enabled && !!activeOrganizationId
}
