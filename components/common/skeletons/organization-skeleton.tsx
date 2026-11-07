import { Skeleton } from './skeleton'
import { cn } from '@/lib/utils'

export function OrganizationSkeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex h-12 items-center gap-2 rounded-md p-2',
        className
      )}
      {...props}
    >
      <Skeleton className='size-8 rounded-lg shrink-0' />
      <div className='grid flex-1 gap-1 min-w-0 text-start text-sm leading-tight'>
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-3 w-1/2' />
      </div>
      <Skeleton className='size-4 shrink-0 ms-auto' />
    </div>
  )
}

