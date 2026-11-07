'use client'

import { Settings } from '@/features/settings'
import { SettingsProfile } from '@/features/settings/profile'
import { accountSidebarItems } from '@/features/settings/config/sidebar-items'

export default function SettingsPage() {
  return (
    <Settings sidebarItems={accountSidebarItems}>
      <SettingsProfile />
    </Settings>
  )
}













