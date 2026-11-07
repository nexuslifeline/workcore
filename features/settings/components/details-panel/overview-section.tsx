'use client'

import type { ReactNode } from 'react'
import { Info } from 'lucide-react'

type OverviewSectionProps = {
  description: ReactNode
}

export function OverviewSection({ description }: OverviewSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">Overview</h3>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{description}</div>
    </section>
  )
}
