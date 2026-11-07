import { Skeleton } from '@/components/common/skeletons'

export function AccountFormSkeleton() {
  return (
    <div className='space-y-8'>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-16' />
        <Skeleton className='h-9 w-full' />
      </div>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-4 w-64' />
          </div>
          <Skeleton className='h-9 w-36' />
        </div>
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-20' />
        <Skeleton className='h-9 w-[200px]' />
      </div>
      <Skeleton className='h-10 w-32' />
    </div>
  )
}
