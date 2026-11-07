import { Skeleton } from './skeleton'

export function CardSkeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={className} {...props}>
      <div className='space-y-3 p-4'>
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-2/3' />
      </div>
    </div>
  )
}








