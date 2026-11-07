'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Separator } from './separator'

type FormSectionCardProps = {
  title: string
  description: string
  children: React.ReactNode
  className?: string
  id?: string
}

export function FormSectionCard({
  title,
  description,
  children,
  className,
  id,
}: FormSectionCardProps) {
  return (
    <div
      id={id}
      className={cn('rounded-lg border bg-card p-6 space-y-4', className)}
    >
      <div className='space-y-1'>
        <h3 className='text-base font-semibold'>{title}</h3>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
      <Separator />
      <div className='space-y-4'>
        {children}
      </div>
    </div>
  )
}
