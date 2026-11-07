'use client'

import { useState } from 'react'
import type React from 'react'
import { ChevronDown } from 'lucide-react'

type AccordionSectionProps = {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function AccordionSection({
  title,
  defaultOpen = true,
  children,
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className='mb-3 last:mb-0'>
      <button
        type='button'
        onClick={() => setIsOpen((prev) => !prev)}
        className='mb-1 flex w-full items-center justify-between gap-2 text-sm font-medium text-muted-foreground hover:text-foreground'
      >
        <span>{title}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`}
        />
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  )
}

