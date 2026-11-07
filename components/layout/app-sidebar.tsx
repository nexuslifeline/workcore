'use client'

import { type ReactNode } from 'react'
import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/common/sidebar'
import { NavUser } from './nav-user'
import { OrganizationSwitcher } from './organization-switcher'

type AppSidebarProps = {
  /** Filtered nav from the server (`SidebarNavGroups` RSC). */
  sidebarNav: ReactNode
}

export function AppSidebar({ sidebarNav }: AppSidebarProps) {
  const { collapsible, variant } = useLayout()

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <OrganizationSwitcher />

        {/* Replace <TeamSwitch /> with the following <AppTitle />
         /* if you want to use the normal app title instead of TeamSwitch dropdown */}
        {/* <AppTitle /> */}
      </SidebarHeader>
      <SidebarContent>{sidebarNav}</SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
