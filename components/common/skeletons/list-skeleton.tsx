import { Skeleton } from './skeleton'

interface ListSkeletonProps {
  items?: number
  showAvatar?: boolean
  className?: string
}

export function ListSkeleton({ items = 5, showAvatar = false, className }: ListSkeletonProps) {
  return (
    <div className={className}>
      <div className='space-y-3'>
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className='flex items-center gap-3'>
            {showAvatar && <Skeleton className='h-10 w-10 rounded-full' />}
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-3 w-1/2' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}





