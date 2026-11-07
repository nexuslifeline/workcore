import { Skeleton } from './skeleton'
import { AvatarSkeleton } from './avatar-skeleton'
import { cn } from '@/lib/utils'

interface UserProfileSkeletonProps {
  showAvatar?: boolean
  avatarSize?: number
  avatarSquare?: boolean
  className?: string
}

export function UserProfileSkeleton({
  showAvatar = true,
  avatarSize = 32,
  avatarSquare = false,
  className,
}: UserProfileSkeletonProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showAvatar && (
        <AvatarSkeleton size={avatarSize} square={avatarSquare} />
      )}
      <div className='grid flex-1 gap-1 min-w-0 text-start text-sm leading-tight'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-3 w-32' />
      </div>
    </div>
  )
}





