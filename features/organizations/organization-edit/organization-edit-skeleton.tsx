import { Skeleton } from '@/components/common/skeletons'

export function OrganizationEditSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Tabs (Basic / Tax Configuration / Business Registration) */}
      <div className='md:hidden'>
        <Skeleton className='h-12 w-48 rounded-md' />
      </div>
      <div className='hidden flex-wrap gap-2 md:flex'>
        <Skeleton className='h-8 w-28 rounded-md' />
        <Skeleton className='h-8 w-40 rounded-md' />
        <Skeleton className='h-8 w-64 rounded-md' />
      </div>

      <div className='space-y-8'>
        {/* Basic Information Section */}
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-9 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-20 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-9 w-full' />
          </div>
        </div>

        {/* Contact Details Section */}
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-16 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-9 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-9 w-full' />
          </div>
        </div>
      </div>

      <Skeleton className='h-10 w-32' />
    </div>
  )
}






