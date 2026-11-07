import Image from 'next/image'

export function LogoTitle() {
  return (
    <div className='flex shrink-0 items-center justify-center'>
      <Image
        src='/logo/seed-logo.png'
        alt='Workcore'
        width={217}
        height={48}
        className='h-9 w-auto max-w-full'
        priority
      />
    </div>
  )
}
