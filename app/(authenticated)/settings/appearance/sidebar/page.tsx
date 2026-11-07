'use client'

import { Settings } from '@/features/settings'
import { SettingsAppearanceSidebar } from '@/features/settings/appearance/sidebar'
import { appearanceSidebarItems } from '@/features/settings/config/sidebar-items'

export default function SettingsAppearanceSidebarPage() {
  return (
    <Settings sidebarItems={appearanceSidebarItems}>
      <SettingsAppearanceSidebar />
    </Settings>
  )
}
