import { Building2, CheckCircle2, XCircle, Clock } from 'lucide-react'

export const statuses = [
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
  {
    value: 'pending',
    label: 'Pending',
    icon: Clock,
    colorClasses:
      'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20 dark:border-yellow-500/30',
  },
  {
    value: 'suspended',
    label: 'Suspended',
    icon: XCircle,
    colorClasses:
      'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive border-destructive/30 dark:border-destructive/50',
  },
]

export const industries = [
  {
    value: 'technology',
    label: 'Technology',
    icon: Building2,
  },
  {
    value: 'finance',
    label: 'Finance',
    icon: Building2,
  },
  {
    value: 'healthcare',
    label: 'Healthcare',
    icon: Building2,
  },
  {
    value: 'retail',
    label: 'Retail',
    icon: Building2,
  },
  {
    value: 'manufacturing',
    label: 'Manufacturing',
    icon: Building2,
  },
  {
    value: 'education',
    label: 'Education',
    icon: Building2,
  },
  {
    value: 'consulting',
    label: 'Consulting',
    icon: Building2,
  },
  {
    value: 'other',
    label: 'Other',
    icon: Building2,
  },
]



