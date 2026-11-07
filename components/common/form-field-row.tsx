'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from './label'
import { FormControl, FormItem, FormMessage } from './form'

type FormFieldRowProps = {
  label: string | React.ReactNode
  description?: string
  children: React.ReactNode
  className?: string
  isLast?: boolean
  alignItems?: 'start' | 'center'
  alignControl?: 'left' | 'right'
}

export function FormFieldRow({
  label,
  description,
  children,
  className,
  isLast = false,
  alignItems = 'start',
  alignControl = 'left',
}: FormFieldRowProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-[2fr_3fr] gap-6 py-4 border-b border-border px-6',
        !isLast && 'border-b',
        isLast && 'border-b-0',
        alignItems === 'start' && 'items-start',
        alignItems === 'center' && 'items-center',
        className
      )}
    >
      <div className='space-y-1'>
        <Label className='text-sm font-medium'>{label}</Label>
        {description && (
          <p className='text-sm text-muted-foreground'>{description}</p>
        )}
      </div>
      <div className={cn('space-y-2', alignControl === 'right' && 'flex justify-end')}>
        <FormItem>
          <FormControl>{children}</FormControl>
          <FormMessage />
        </FormItem>
      </div>
    </div>
  )
}
