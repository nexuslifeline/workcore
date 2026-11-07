import type { ReactNode } from 'react'

import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { PermissionRouteGuard } from '@/components/layout/permission-route-guard'
import { SidebarNavGroups } from '@/components/layout/sidebar-nav-groups'
import { TawkWidget } from '@/components/support/tawk-widget'

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <PermissionRouteGuard>
      <AuthenticatedLayout sidebarNav={<SidebarNavGroups />}>
        {children}
      </AuthenticatedLayout>
      <TawkWidget />
    </PermissionRouteGuard>
  )
}
