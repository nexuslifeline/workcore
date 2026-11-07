import { Skeleton } from '@/components/common/skeletons'

export function ProfileFormSkeleton() {
  return (
    <div className='space-y-8'>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-16' />
        <Skeleton className='h-9 w-full' />
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-12' />
        <Skeleton className='h-24 w-full' />
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-20' />
        <Skeleton className='h-9 w-full' />
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-16' />
        <Skeleton className='h-9 w-full' />
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-20' />
        <Skeleton className='h-9 w-full' />
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-20' />
        <Skeleton className='h-10 w-full' />
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-28' />
        <Skeleton className='h-9 w-full' />
      </div>
      <Skeleton className='h-10 w-32' />
    </div>
  )
}
