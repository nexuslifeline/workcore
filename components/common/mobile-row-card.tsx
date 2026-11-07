'use client'

import * as React from 'react'

type MobileRowCardProps = {
  title: React.ReactNode
  content: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function MobileRowCard({
  title,
  content,
  actions,
  className,
}: MobileRowCardProps) {
  return (
    <div className={`border rounded-lg p-3 space-y-3 bg-card ${className ?? ''}`}>
      <div className='-mx-3 px-3 flex items-center justify-between border-b pb-2'>
        <p className='text-xs font-medium text-muted-foreground'>{title}</p>
        {actions}
      </div>
      {content}
    </div>
  )
}
