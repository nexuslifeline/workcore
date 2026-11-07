'use client'

import { Settings } from '@/features/settings'
import { SettingsAppearanceTheme } from '@/features/settings/appearance/theme'
import { appearanceSidebarItems } from '@/features/settings/config/sidebar-items'

export default function SettingsAppearanceThemePage() {
  return (
    <Settings sidebarItems={appearanceSidebarItems}>
      <SettingsAppearanceTheme />
    </Settings>
  )
}
