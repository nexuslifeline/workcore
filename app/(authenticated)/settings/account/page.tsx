'use client'

import { Settings } from '@/features/settings'
import { SettingsAccount } from '@/features/settings/account'
import { accountSidebarItems } from '@/features/settings/config/sidebar-items'

export default function SettingsAccountPage() {
  return (
    <Settings sidebarItems={accountSidebarItems}>
      <SettingsAccount />
    </Settings>
  )
}













