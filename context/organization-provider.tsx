'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useEnsureActiveOrganization } from '@/hooks/use-ensure-active-organization'
import { useOrganization } from '@/hooks/use-organization'
import { getCurrencyByCode } from '@/lib/constants/currencies'
import { useCurrencyStore } from '@/stores/currency-store'
import { useOrganizationStore } from '@/stores/organization-store'

/**
 * Bootstraps the active organization for the authenticated shell, and refetches
 * queries when the user switches organizations.
 */
export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const { activeOrganizationId } = useOrganizationStore()
  const { data: organization } = useOrganization(activeOrganizationId ?? null)
  const setActiveCurrency = useCurrencyStore((s) => s.setActiveCurrency)
  const previousOrgIdRef = useRef<string | null>(null)

  // Set default org before dashboard / other pages fire org-scoped API calls
  useEnsureActiveOrganization()

  useEffect(() => {
    // Skip on initial mount (when previousOrgIdRef is null and activeOrganizationId is set)
    // Only refetch when organization actually changes
    if (
      previousOrgIdRef.current !== null &&
      previousOrgIdRef.current !== activeOrganizationId
    ) {
      queryClient.refetchQueries()
    }

    previousOrgIdRef.current = activeOrganizationId
  }, [activeOrganizationId, queryClient])

  // Keep client currency formatting in sync with the org's configured currency
  useEffect(() => {
    const code = organization?.currencyCode?.trim()
    if (!code) return

    const currency = getCurrencyByCode(code)
    if (!currency) return

    if (useCurrencyStore.getState().activeCurrency.code === currency.code) return
    setActiveCurrency(currency)
  }, [organization?.currencyCode, setActiveCurrency])

  return <>{children}</>
}
