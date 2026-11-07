'use client'

import * as React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from './sheet'
import { Separator } from './separator'
import { Button } from './button'
import { cn } from '@/lib/utils'

type SlidePanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  showDefaultActions?: boolean
  onCancel?: () => void
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
  contentClassName?: string
  /** Rendered in the header, opposite the title (e.g. a date filter). */
  headerActions?: React.ReactNode
}

export function SlidePanel({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  showDefaultActions = true,
  onCancel,
  side = 'right',
  className,
  contentClassName,
  headerActions,
}: SlidePanelProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      onOpenChange(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={side} 
        className={cn('flex flex-col', className)}
      >
        <div className="flex flex-col h-full min-h-0">
          <SheetHeader className="flex-none !px-6 !py-3">
            <div className="flex items-center justify-between gap-3 pe-8">
              <div className="min-w-0">
                <SheetTitle className="text-lg truncate">{title}</SheetTitle>
                {typeof description === 'string' ? (
                  <SheetDescription>{description}</SheetDescription>
                ) : description ? (
                  <div className='mt-0.5 text-sm text-muted-foreground'>{description}</div>
                ) : null}
              </div>
              {headerActions ? (
                <div className="shrink-0">{headerActions}</div>
              ) : null}
            </div>
          </SheetHeader>
          <Separator className="flex-none" />
          
          <div className={cn('flex-1 overflow-y-auto min-h-0 px-6 py-4', contentClassName)}>
            {children}
          </div>

          {(footer || showDefaultActions) && (
            <SheetFooter className="flex-none mt-auto border-t !px-6 !py-3">
              {footer || (
                showDefaultActions && (
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                )
              )}
            </SheetFooter>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
