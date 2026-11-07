'use client'

import { Suspense, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type PageSuspenseProps = {
  children: ReactNode
  fallback?: ReactNode
  className?: string
}

function DefaultFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex min-h-[400px] w-full items-center justify-center',
        className
      )}
    >
      <div className='flex flex-col items-center gap-4'>
        <Loader2 className='size-8 animate-spin text-muted-foreground' />
        <p className='text-sm text-muted-foreground'>Loading...</p>
      </div>
    </div>
  )
}

export function PageSuspense({
  children,
  fallback,
  className,
}: PageSuspenseProps) {
  return (
    <Suspense fallback={fallback || <DefaultFallback className={className} />}>
      {children}
    </Suspense>
  )
}

