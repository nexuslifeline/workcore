import { CalendarDays, Repeat, Sparkles } from 'lucide-react'

export const holidayTypes = [
  {
    value: 'regular_holiday',
    label: 'Regular holiday',
    icon: CalendarDays,
    colorClasses:
      'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/30',
  },
  {
    value: 'special_holiday',
    label: 'Special holiday',
    icon: Sparkles,
    colorClasses:
      'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/30',
  },
]

export const holidayRecurringOptions = [
  {
    value: 'recurring',
    label: 'Recurring',
    icon: Repeat,
  },
  {
    value: 'one-off',
    label: 'One-off',
  },
]
