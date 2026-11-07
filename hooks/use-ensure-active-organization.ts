'use client'

import { useEffect } from 'react'

import { useOrganizations } from '@/hooks/use-organizations'
import { useOrganizationStore } from '@/stores/organization-store'

/**
 * Ensures `activeOrganizationId` is set once the user's organizations are known.
 * Runs in the authenticated shell so dashboard/API calls are not blocked on the
 * sidebar switcher mounting.
 */
export function useEnsureActiveOrganization() {
  const { activeOrganizationId, setActiveOrganizationId } =
    useOrganizationStore()
  const { data, isLoading, isFetched } = useOrganizations({
    page: 1,
    pageSize: 10,
  })

  const organizations = data?.organizations ?? []

  useEffect(() => {
    const list = data?.organizations
    if (!list || list.length === 0) return

    const isValid = activeOrganizationId
      ? list.some((org) => org.id === activeOrganizationId)
      : false

    if (!isValid) {
      setActiveOrganizationId(list[0].id)
    }
  }, [data?.organizations, activeOrganizationId, setActiveOrganizationId])

  return {
    activeOrganizationId,
    isLoadingOrganizations: isLoading,
    hasOrganizations: organizations.length > 0,
    /** True once we have an active org, or orgs finished loading with an empty list. */
    isActiveOrganizationReady:
      !!activeOrganizationId || (isFetched && organizations.length === 0),
  }
}
