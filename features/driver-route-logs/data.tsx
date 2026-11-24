import { CheckCircle2, CircleDashed, Truck, XCircle } from 'lucide-react'
import type { StatusConfig } from '@/components/common/badges/status-badge'

export const driverRouteLogStatuses: StatusConfig[] = [
  {
    value: 'scheduled',
    label: 'Scheduled',
    icon: CircleDashed,
    colorClasses:
      'bg-neutral-100/50 text-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700',
  },
  {
    value: 'in_transit',
    label: 'In transit',
    icon: Truck,
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
    icon: XCircle,
    colorClasses:
      'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 dark:border-red-500/30',
  },
]
