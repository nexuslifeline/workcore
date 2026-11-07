import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Organization } from '@/types/organization'
import { removeCookie, setCookie } from '@/lib/cookies'
import {
  ACTIVE_ORGANIZATION_COOKIE_MAX_AGE,
  ACTIVE_ORGANIZATION_COOKIE_NAME,
} from '@/lib/constants/active-organization-cookie'

interface OrganizationState {
  activeOrganizationId: string | null
  setActiveOrganizationId: (id: string | null) => void
  reset: () => void
}

const STORAGE_KEY = 'active-organization-id'

function syncActiveOrganizationCookie(id: string | null) {
  if (typeof window === 'undefined') return
  if (id) {
    setCookie(
      ACTIVE_ORGANIZATION_COOKIE_NAME,
      id,
      ACTIVE_ORGANIZATION_COOKIE_MAX_AGE
    )
  } else {
    removeCookie(ACTIVE_ORGANIZATION_COOKIE_NAME)
  }
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      activeOrganizationId: null,
      setActiveOrganizationId: (id) => {
        set({ activeOrganizationId: id })
        syncActiveOrganizationCookie(id)
      },
      reset: () => {
        set({ activeOrganizationId: null })
        syncActiveOrganizationCookie(null)
      },
    }),
    {
      name: STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        if (state?.activeOrganizationId) {
          syncActiveOrganizationCookie(state.activeOrganizationId)
        }
      },
    }
  )
)

/**
 * Helper hook to get the active organization object from organizations list
 */
export function useActiveOrganization(organizations: Organization[]) {
  const { activeOrganizationId } = useOrganizationStore()
  return organizations.find((org) => org.id === activeOrganizationId) || organizations[0] || null
}

