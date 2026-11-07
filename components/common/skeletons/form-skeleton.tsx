import { Skeleton } from './skeleton'

interface FormSkeletonProps {
  fields?: number
  className?: string
}

export function FormSkeleton({ fields = 3, className }: FormSkeletonProps) {
  return (
    <div className={className}>
      <div className='space-y-4'>
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full' />
          </div>
        ))}
      </div>
    </div>
  )
}





