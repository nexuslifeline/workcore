'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CardSelectorOption<T = string | boolean> = {
  title: string
  description: string
  value: T
  icon?: React.ReactNode
}

type CardSelectorProps<T = string | boolean> = {
  options: CardSelectorOption<T>[]
  value: T | null | undefined
  onChange: (value: T) => void
  disabled?: boolean
  /**
   * Option values that cannot be selected (cards look disabled and ignore clicks).
   * Compared with strict equality to each option’s `value`.
   */
  disabledValues?: readonly T[]
  className?: string
  columns?: number
}

export function CardSelector<T = string | boolean>({
  options,
  value,
  onChange,
  disabled = false,
  disabledValues,
  className,
  columns = 2,
}: CardSelectorProps<T>) {
  const disabledValueSet = React.useMemo(
    () =>
      disabledValues && disabledValues.length > 0 ? new Set(disabledValues) : null,
    [disabledValues]
  )

  const handleSelect = (optionValue: T, optionDisabled: boolean) => {
    if (!disabled && !optionDisabled) {
      onChange(optionValue)
    }
  }

  // Helper function to check if values are equal
  const isSelected = (optionValue: T): boolean => {
    if (value === undefined || value === null) return false
    // Handle both primitive and object comparison
    return value === optionValue
  }

  return (
    <div
      className={cn(
        'grid gap-2',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-2',
        columns === 3 && 'grid-cols-3',
        columns === 4 && 'grid-cols-4',
        className
      )}
    >
      {options.map((option, index) => {
        const selected = isSelected(option.value)
        const valueLocked =
          disabledValueSet !== null && disabledValueSet.has(option.value)
        const optionDisabled = Boolean(disabled || valueLocked)
        return (
          <button
            key={index}
            type='button'
            onClick={() => handleSelect(option.value, optionDisabled)}
            disabled={optionDisabled}
            className={cn(
              'relative p-3 border-2 rounded-lg border-border transition-all text-left',
              selected
                ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                : !optionDisabled && 'hover:border-primary/50',
              optionDisabled && 'cursor-not-allowed pointer-events-none',
              optionDisabled && !selected && 'opacity-50',
              optionDisabled && selected && 'opacity-[0.92]'
            )}
          >
            {selected && (
              <div className='absolute top-1.5 right-1.5'>
                <Check className='h-4 w-4 text-green-600' />
              </div>
            )}
            <div className={cn(option.icon && 'flex gap-3')}>
              {option.icon ? (
                <div className='mt-0.5 shrink-0 text-muted-foreground [&>svg]:h-5 [&>svg]:w-5'>
                  {option.icon}
                </div>
              ) : null}
              <div className='min-w-0'>
                <div className='font-medium'>{option.title}</div>
                <div className='text-xs text-muted-foreground mt-1.5'>
                  {option.description}
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
