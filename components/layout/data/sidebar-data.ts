import {
  LayoutDashboard,
  HelpCircle,
  Palette,
  Settings,
  Wrench,
  Users,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Building2,
  Shield,
  IdCard,
} from 'lucide-react'
import { type SidebarData } from '../types'
import { PERMISSIONS } from '@/lib/constants/permission-codes'

export const sidebarData: SidebarData = {
  user: {
    name: 'Workcore',
    email: 'user@workcore.local',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Workcore',
      logo: Command,
      plan: 'Workspace',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          code: PERMISSIONS.DASHBOARD,
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          code: PERMISSIONS.EMPLOYEES,
          title: 'Employees',
          url: '/employees',
          icon: IdCard,
        },
      ],
    },
    {
      title: 'Administration',
      items: [
        {
          code: PERMISSIONS.SYSTEM_USERS,
          title: 'Users',
          url: '/users',
          icon: Users,
        },
        {
          code: PERMISSIONS.SYSTEM_ROLES,
          title: 'Roles',
          url: '/roles',
          icon: Shield,
        },
        {
          code: PERMISSIONS.SYSTEM_ORGANIZATIONS,
          title: 'Organizations',
          url: '/organizations',
          icon: Building2,
        },
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Appearance',
              url: '/settings/appearance/theme',
              icon: Palette,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              code: PERMISSIONS.SETTINGS_ORGANIZATION,
              title: 'Organization',
              url: '/organizations/{{uuid}}/edit',
              icon: Building2,
            },
          ],
        },
        {
          title: 'Support',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
