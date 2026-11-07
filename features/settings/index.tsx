'use client'

import { useMemo } from 'react'
import { PageHeader } from '@/components/common/page-header'
import { Header } from '@/components/layout/header'
import { HeaderUserActions } from '@/components/layout/header-user-actions'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { useCurrentUserRolePermissions } from '@/hooks/use-current-user-role-permissions'
import { useOrganizationStore } from '@/stores/organization-store'
import { SidebarNav } from './components/sidebar-nav'
import { filterSidebarItemsByPermissions } from './config/sidebar-filter'
import type { SidebarNavItem } from './config/sidebar-items'

type SettingsProps = {
  children?: React.ReactNode
  sidebarItems: SidebarNavItem[]
}

export function Settings({ children, sidebarItems }: SettingsProps) {
  const { activeOrganizationId } = useOrganizationStore()
  const { data: permissions } = useCurrentUserRolePermissions({
    enabled: !!activeOrganizationId,
  })
  
  const filteredSidebarItems = useMemo(
    () => filterSidebarItemsByPermissions(sidebarItems, permissions),
    [sidebarItems, permissions]
  )

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <HeaderUserActions />
      </Header>

      <Main fixed>
        <PageHeader
          title='Settings'
          description='Configure your application settings, preferences, and system configurations.'
        />
        <div className='flex flex-1 flex-col space-y-2 md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12 min-h-0 overflow-hidden'>
          <aside className='top-0 lg:sticky lg:w-1/5 flex-shrink-0'>
            <SidebarNav items={filteredSidebarItems} />
          </aside>
          <div className='flex flex-1 w-full flex-col gap-3 min-h-0 overflow-y-auto'>
            {children}
          </div>
        </div>
      </Main>
    </>
  )
}
