import * as React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from './badge'

export type StatusConfig = {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  colorClasses?: string
}

type StatusBadgeProps = {
  value: string | null | undefined
  // Option 1: Array of status configs to search
  statusConfigs?: StatusConfig[]
  // Option 2: Direct status config object
  statusConfig?: StatusConfig
  // Option 3: Direct color classes (for Map pattern compatibility)
  colorClasses?: string
  // Badge props
  variant?: React.ComponentProps<typeof Badge>['variant']
  className?: string
  // Display options
  showIcon?: boolean
  fallbackToValue?: boolean
  capitalize?: boolean
}

export function StatusBadge({
  value,
  statusConfigs,
  statusConfig,
  colorClasses,
  variant = 'outline',
  className,
  showIcon = true,
  fallbackToValue = true,
  capitalize = true,
}: StatusBadgeProps) {
  // Early return if no value
  if (!value) return null

  // Find status config from array if provided
  const foundConfig = statusConfigs?.find((config) => config.value === value)

  // Use provided config, found config, or create fallback
  const config: StatusConfig | null =
    statusConfig || foundConfig || (fallbackToValue ? { value, label: value } : null)

  // If no config and fallback disabled, return null
  if (!config) return null

  const { label, icon: Icon, colorClasses: configColorClasses } = config
  const finalColorClasses = colorClasses || configColorClasses

  return (
    <Badge
      variant={variant}
      className={cn(
        capitalize && 'capitalize',
        finalColorClasses,
        className
      )}
    >
      {showIcon && Icon && <Icon className='size-3' />}
      {label}
    </Badge>
  )
}




