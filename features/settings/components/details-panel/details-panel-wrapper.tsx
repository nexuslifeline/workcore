'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/common/sheet'
import { Separator } from '@/components/common/separator'
import { ReactNode } from 'react'

type DetailsPanelWrapperProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  children: ReactNode
}

export function DetailsPanelWrapper({
  open,
  onOpenChange,
  title,
  description,
  children,
}: DetailsPanelWrapperProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-lg">{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function DetailsPanelSeparator() {
  return <Separator />
}
