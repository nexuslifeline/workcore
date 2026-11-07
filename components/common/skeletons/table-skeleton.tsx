import { Skeleton } from './skeleton'

interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={className}>
      <div className='space-y-2'>
        {/* Header */}
        <div className='flex gap-2'>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`header-${i}`} className='h-4 flex-1' />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className='flex gap-2'>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={`cell-${rowIndex}-${colIndex}`} className='h-4 flex-1' />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}








