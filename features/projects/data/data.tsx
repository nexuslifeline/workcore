import {
  Ban,
  CheckCircle2,
  Circle,
  CircleDashed,
  PlayCircle,
  XCircle,
} from 'lucide-react'
import type { StatusConfig } from '@/components/common/badges/status-badge'

export const projectStatuses: StatusConfig[] = [
  {
    value: 'draft',
    label: 'Draft',
    icon: CircleDashed,
    colorClasses:
      'bg-neutral-100/50 text-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700',
  },
  {
    value: 'approved',
    label: 'Approved',
    icon: CheckCircle2,
    colorClasses:
      'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20 dark:border-sky-500/30',
  },
  {
    value: 'in_progress',
    label: 'In progress',
    icon: PlayCircle,
    colorClasses:
      'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/30',
  },
  {
    value: 'completed',
    label: 'Completed',
    icon: Circle,
    colorClasses:
      'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 dark:border-green-500/30',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    icon: XCircle,
    colorClasses:
      'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 dark:border-red-500/30',
  },
]

export const projectTaskStatuses: StatusConfig[] = [
  {
    value: 'pending',
    label: 'Pending',
    icon: CircleDashed,
    colorClasses:
      'bg-neutral-100/50 text-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700',
  },
  {
    value: 'in_progress',
    label: 'In progress',
    icon: PlayCircle,
    colorClasses:
      'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/30',
  },
  {
    value: 'completed',
    label: 'Completed',
    icon: CheckCircle2,
    colorClasses:
      'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 dark:border-green-500/30',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    icon: Ban,
    colorClasses:
      'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 dark:border-red-500/30',
  },
]
