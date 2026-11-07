'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { SidebarInset, SidebarProvider } from '@/components/common/sidebar'
import { AppSidebar } from './app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'
import { Header } from './header'
import { HeaderUserActions } from './header-user-actions'
import { Main } from './main'
import { Search } from '@/components/search'

type PageLayoutProps = {
  children: ReactNode
  headerFixed?: boolean
  headerActions?: ReactNode
  mainClassName?: string
  /** When true, removes horizontal padding on `<Main>` (e.g. full-bleed ledger). */
  mainXPaddingDisabled?: boolean
  mainFixed?: boolean
  mainFluid?: boolean
  skipHeaderMain?: boolean
  /**
   * When true, lock SidebarInset to the viewport and hide overflow.
   * Use for full-bleed workspaces that scroll internally (two-pane editors, reports).
   * Do not use for custom-header pages that still need document scroll (e.g. dashboard).
   */
  lockViewport?: boolean
  /** Server-rendered sidebar navigation (RSC slot). */
  sidebarNav: ReactNode
}

export function PageLayout({
  children,
  headerFixed = true,
  headerActions,
  mainClassName,
  mainXPaddingDisabled = false,
  mainFixed,
  mainFluid,
  skipHeaderMain = false,
  lockViewport = false,
  sidebarNav,
}: PageLayoutProps) {
  // Always start expanded so SSR matches the client's first paint.
  // `getCookie` is unavailable during SSR (`document` is undefined), so reading
  // it during render caused expanded (server) vs collapsed (client) hydration errors.
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    setSidebarOpen(getCookie('sidebar_state') !== 'false')
  }, [])

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SkipToMain />
      <AppSidebar sidebarNav={sidebarNav} />
      <SidebarInset
        className={cn(
          // Set content container, so we can use container queries
          '@container/content',

          // If layout is fixed, set the height
          // to 100svh to prevent overflow
          'has-data-[layout=fixed]:h-svh',

          // If layout is fixed and sidebar is inset,
          // set the height to 100svh - spacing (total margins) to prevent overflow
          'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]',

          // Contain scroll within this container when layout is fixed
          'has-data-[layout=fixed]:overflow-hidden',

          // Full-bleed workspaces skip <Main> and use h-full children, so lock the
          // inset to the viewport. Keep this separate from skipHeaderMain so
          // custom-header pages (dashboard) can still document-scroll.
          lockViewport && 'h-svh overflow-hidden',
          lockViewport &&
            'md:peer-data-[variant=inset]:h-[calc(100svh-(var(--spacing)*4))]'
        )}
      >
        {skipHeaderMain ? (
          children
        ) : (
          <>
            <Header fixed={headerFixed}>
              {headerActions || <Search />}
              <HeaderUserActions leading={headerActions ? <Search /> : null} />
            </Header>

            <Main
              fixed={mainFixed}
              fluid={mainFluid}
              className={cn(
                'flex flex-1 flex-col gap-4 sm:gap-6',
                // Full-bleed workspaces under the shared Header should sit flush
                // (default Main `py-6` creates a visible gap above PageHeader).
                mainFixed && 'pt-0',
                mainXPaddingDisabled && 'px-0',
                mainClassName
              )}
            >
              {children}
            </Main>
          </>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}

