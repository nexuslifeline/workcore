import sampleDashboard from '@/assets/dashboard.png'

export function RightPanelContent() {
  return (
    <div className='relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl bg-primary px-[5rem] py-[4rem]'>
      <div className='mb-[4rem] flex flex-col items-start text-left'>
        <h1 className='flex flex-col gap-1 text-4xl font-semibold tracking-tight text-primary-foreground'>
          <span className='block'>Your workspace.</span>
          <span className='block'>Your people.</span>
        </h1>
        <p className='text-lg text-primary-foreground/80 mt-2'>
          Organizations, users, roles, and employee records in one place.
        </p>
      </div>

      <div className='relative min-h-0 flex-1 w-full'>
        <img
          src={sampleDashboard.src}
          alt=''
          className='h-full w-[170%] max-w-none select-none rounded-xl object-cover object-left-top'
        />
        {/* <div className='absolute inset-x-0 bottom-0 h-1/2 w-[170%] bg-gradient-to-t from-primary to-transparent' /> */}
      </div>
    </div>
  )
}
