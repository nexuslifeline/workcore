'use client'

import { Settings } from '@/features/settings'
import { SettingsAppearanceDirection } from '@/features/settings/appearance/direction'
import { appearanceSidebarItems } from '@/features/settings/config/sidebar-items'

export default function SettingsAppearanceDirectionPage() {
  return (
    <Settings sidebarItems={appearanceSidebarItems}>
      <SettingsAppearanceDirection />
    </Settings>
  )
}
