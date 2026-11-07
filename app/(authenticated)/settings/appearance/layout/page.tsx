'use client'

import { Settings } from '@/features/settings'
import { SettingsAppearanceLayout } from '@/features/settings/appearance/layout'
import { appearanceSidebarItems } from '@/features/settings/config/sidebar-items'

export default function SettingsAppearanceLayoutPage() {
  return (
    <Settings sidebarItems={appearanceSidebarItems}>
      <SettingsAppearanceLayout />
    </Settings>
  )
}
