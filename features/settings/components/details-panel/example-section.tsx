'use client'

import React from 'react'
import { FileText } from 'lucide-react'
import { JournalEntryTable } from './journal-entry-table'

type JournalEntryRow = {
  account: string
  debit: string | number
  credit: string | number
}

type ExampleSectionProps = {
  title: string
  description: string | React.ReactNode
  entries: JournalEntryRow[]
  note?: string
}

export function ExampleSection({ title, description, entries, note }: ExampleSectionProps) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="space-y-1.5 text-sm">
        {typeof description === 'string' ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : (
          description
        )}
        <JournalEntryTable rows={entries} />
        {note && (
          <p className="text-xs text-muted-foreground italic">{note}</p>
        )}
      </div>
    </section>
  )
}
