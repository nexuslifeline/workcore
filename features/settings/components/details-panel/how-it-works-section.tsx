'use client'

import { CheckCircle2, LucideIcon } from 'lucide-react'
import * as React from 'react'

type BulletPoint = {
  title: string
  description: string
}

type HowItWorksSectionProps = {
  icon: LucideIcon
  title?: string
  description: string | React.ReactNode
  bulletPoints?: BulletPoint[]
}

export function HowItWorksSection({
  icon: Icon,
  title = 'How it works',
  description,
  bulletPoints,
}: HowItWorksSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed">
        {typeof description === 'string' ? <p>{description}</p> : description}
      </div>
      {bulletPoints && bulletPoints.length > 0 && (
        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
          {bulletPoints.map((point, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{point.title}</p>
                <p className="text-xs text-muted-foreground">{point.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
