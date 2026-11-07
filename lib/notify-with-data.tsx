import { toast } from 'sonner'

/**
 * Shows a toast with an optional title and a pretty-printed JSON snapshot of `data`.
 * Use for demos, settings previews, or any payload you want surfaced in the UI.
 */
export function notifyWithData(data: unknown, title: string = 'Details:') {
  toast.message(title, {
    description: (
      <pre className='mt-2 w-full overflow-x-auto rounded-md bg-slate-950 p-4'>
        <code className='text-white'>{JSON.stringify(data, null, 2)}</code>
      </pre>
    ),
  })
}
