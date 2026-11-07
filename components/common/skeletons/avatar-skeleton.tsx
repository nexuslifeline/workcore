import { Skeleton } from './skeleton'
import { cn } from '@/lib/utils'

interface AvatarSkeletonProps {
  size?: number
  square?: boolean
  className?: string
}

export function AvatarSkeleton({ size = 32, square = false, className }: AvatarSkeletonProps) {
  return (
    <Skeleton
      className={cn(
        'shrink-0',
        square ? 'rounded-lg' : 'rounded-full',
        className
      )}
      style={{ width: size, height: size }}
    />
  )
}








