import { Telescope } from 'lucide-react'

export function ComingSoon() {
  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div className='m-auto flex w-full flex-col items-center justify-center gap-2'>
        <Telescope size={72} />
        <h1 className='text-4xl leading-tight font-bold'>Coming Soon!</h1>
        <p className='text-center text-muted-foreground'>
          This page has not been created yet. <br />
          Stay tuned though!
        </p>
      </div>
    </div>
  )
}
