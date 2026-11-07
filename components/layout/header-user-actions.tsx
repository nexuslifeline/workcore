'use client'

import type { ReactNode } from 'react'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { NotificationBell } from './notification-bell'

type HeaderUserActionsProps = {
  leading?: ReactNode
}

export function HeaderUserActions({ leading }: HeaderUserActionsProps) {
  return (
    <div className='ms-auto flex items-center space-x-4'>
      {leading}
      <ThemeSwitch />
      <NotificationBell />
      <ProfileDropdown />
    </div>
  )
}
