import { CheckCircle2, XCircle } from 'lucide-react'

export const employeeStatuses = [
  {
    value: 'active',
    label: 'Active',
    icon: CheckCircle2,
    colorClasses:
      'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 dark:border-green-500/30',
  },
  {
    value: 'inactive',
    label: 'Inactive',
    icon: XCircle,
    colorClasses:
      'bg-neutral-100/50 text-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700',
  },
]
