'use client'

import { CheckCircle2 } from 'lucide-react'

type Note = {
  label: string
  description: string
}

type NotesSectionProps = {
  title?: string
  notes: Note[]
}

export function NotesSection({ title = 'Important notes', notes }: NotesSectionProps) {
  return (
    <section className="space-y-4 mb-8">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        {notes.map((note, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
            <span>
              <strong className="text-foreground">{note.label}:</strong> {note.description}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
