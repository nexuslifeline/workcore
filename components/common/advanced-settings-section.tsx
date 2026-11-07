'use client'

import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/common/collapsible'
import { cn } from '@/lib/utils'

type AdvancedSettingsSectionProps = {
  title?: string
  className?: string
  children: ReactNode
  /** Initial open state (e.g. expand when editing a supplier with tax data). */
  defaultOpen?: boolean
}

export function AdvancedSettingsSection({
  title = 'Advanced Settings',
  className,
  children,
  defaultOpen = false,
}: AdvancedSettingsSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={cn('mt-6 space-y-2', className)}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className='flex cursor-pointer items-center gap-2 text-sm font-medium leading-none text-foreground transition-colors hover:text-foreground/80 peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
          <span>{title}</span>
        </CollapsibleTrigger>
        <CollapsibleContent className='CollapsibleContent space-y-4 pt-5'>
          {children}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

