import { Shield, UserCheck, Users, CreditCard } from 'lucide-react'
import { type UserStatus } from './schema'

export const callTypes = new Map<string, string>([
  [
    'active',
    'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 dark:border-green-500/30',
  ],
  [
    'inactive',
    'bg-neutral-100/50 text-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700',
  ],
  [
    'invited',
    'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/30',
  ],
  [
    'pending',
    'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/30',
  ],
  [
    'suspended',
    'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive border-destructive/30 dark:border-destructive/50',
  ],
  [
    'accepted',
    'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 dark:border-green-500/30',
  ],
  [
    'revoked',
    'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive border-destructive/30 dark:border-destructive/50',
  ],
  [
    'expired',
    'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20 dark:border-orange-500/30',
  ],
])

export const roles = [
  {
    label: 'Superadmin',
    value: 'superadmin',
    icon: Shield,
  },
  {
    label: 'Admin',
    value: 'admin',
    icon: UserCheck,
  },
  {
    label: 'Manager',
    value: 'manager',
    icon: Users,
  },
  {
    label: 'Cashier',
    value: 'cashier',
    icon: CreditCard,
  },
] as const
