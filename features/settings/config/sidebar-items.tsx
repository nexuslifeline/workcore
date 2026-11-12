'use client'

import {
  Palette,
  Wrench,
  UserCog,
  Sun,
  PanelLeft,
  Layout,
  Languages,
  Globe2,
  Banknote,
} from 'lucide-react'
import type { JSX } from 'react'
import { PERMISSIONS } from '@/lib/constants/permission-codes'

export type SidebarNavItem = {
  code?: string
  title: string
  href: string
  icon: JSX.Element
}

export const appearanceSidebarItems: SidebarNavItem[] = [
  {
    title: 'Theme',
    href: '/settings/appearance/theme',
    icon: <Sun size={18} />,
  },
  {
    title: 'Sidebar',
    href: '/settings/appearance/sidebar',
    icon: <PanelLeft size={18} />,
  },
  {
    title: 'Layout',
    href: '/settings/appearance/layout',
    icon: <Layout size={18} />,
  },
  {
    title: 'Direction',
    href: '/settings/appearance/direction',
    icon: <Languages size={18} />,
  },
]

export const accountSidebarItems: SidebarNavItem[] = [
  {
    title: 'Profile',
    href: '/settings',
    icon: <UserCog size={18} />,
  },
  {
    title: 'Account',
    href: '/settings/account',
    icon: <Wrench size={18} />,
  },
  {
    title: 'Preferences',
    href: '/settings/account/preferences',
    icon: <Globe2 size={18} />,
  },
]

export const payrollSidebarItems: SidebarNavItem[] = [
  {
    code: PERMISSIONS.SETTINGS_PAYROLL,
    title: 'Payroll',
    href: '/settings/payroll',
    icon: <Banknote size={18} />,
  },
]

export const defaultSidebarItems: SidebarNavItem[] = [
  {
    title: 'Profile',
    href: '/settings',
    icon: <UserCog size={18} />,
  },
  {
    title: 'Account',
    href: '/settings/account',
    icon: <Wrench size={18} />,
  },
  {
    title: 'Appearance',
    href: '/settings/appearance',
    icon: <Palette size={18} />,
  },
]
