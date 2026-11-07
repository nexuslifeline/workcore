'use client'

import { Suspense, useEffect } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { queryClient } from '@/lib/react-query/client'
import { createClient } from '@/lib/supabase/client'
import { useCurrencyStore } from '@/stores/currency-store'
import { useOrganizationStore } from '@/stores/organization-store'
import { DirectionProvider } from '@/context/direction-provider'
import { FontProvider } from '@/context/font-provider'
import { ThemeProvider } from '@/context/theme-provider'
import { NotificationProvider } from '@/context/notification-provider'
import { NavigationProgress } from '@/components/navigation-progress'

export function Providers({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  // Clear React Query cache and organization store on auth state change
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        queryClient.invalidateQueries()
        useOrganizationStore.getState().reset()
        useCurrencyStore.getState().reset()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <FontProvider>
          <DirectionProvider>
            <NotificationProvider duration={3000} position='top-right'>
              <Suspense fallback={null}>
                <NavigationProgress />
              </Suspense>
              {children}
              {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools buttonPosition='bottom-left' />
              )}
            </NotificationProvider>
          </DirectionProvider>
        </FontProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
