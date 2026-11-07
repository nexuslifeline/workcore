'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type FormOptionPanelProps = {
  title: string
  icon?: ReactNode
  /** Short explainer under the title, above the main content. */
  description?: string
  children: ReactNode
  helperText?: string
  onLearnMore?: () => void
  learnMoreLabel?: string
  className?: string
  /** Stable hook for E2E (`page.getByTestId(...)`). */
  dataTestId?: string
}

export function FormOptionPanel({
  title,
  icon,
  description,
  children,
  helperText,
  onLearnMore,
  learnMoreLabel = 'Learn more',
  className,
  dataTestId,
}: FormOptionPanelProps) {
  return (
    <div
      className={cn('rounded-lg border-2 border-border bg-muted/50 p-3', className)}
      data-testid={dataTestId}
    >
      <div className='mb-2 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          {icon}
          <span className='text-sm font-medium'>{title}</span>
        </div>
        {onLearnMore && (
          <button
            type='button'
            onClick={onLearnMore}
            className='text-xs text-primary whitespace-nowrap hover:underline'
          >
            {learnMoreLabel}
          </button>
        )}
      </div>
      {description && (
        <p className='mb-3 text-sm text-muted-foreground leading-relaxed'>{description}</p>
      )}
      <div className='space-y-2'>{children}</div>
      {helperText && (
        <p className='mt-1.5 text-xs text-muted-foreground'>{helperText}</p>
      )}
    </div>
  )
}
