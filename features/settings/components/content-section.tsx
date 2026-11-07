'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/common/button'
import { Separator } from '@/components/common/separator'

type ContentSectionProps = {
  title: string
  desc: string
  children: React.JSX.Element
  showBackButton?: boolean
  backHref?: string
}

export function ContentSection({
  title,
  desc,
  children,
  showBackButton = false,
  backHref,
}: ContentSectionProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-none'>
        <div className='flex items-center gap-2'>
          {showBackButton && (
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 -ms-2'
              onClick={handleBack}
              aria-label='Go back'
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
          )}
          <h3 className='text-lg font-medium'>{title}</h3>
        </div>
        <p className='text-sm text-muted-foreground'>{desc}</p>
      </div>
      <Separator className='my-4 flex-none' />
      <div className='flex-1 min-h-0 w-full overflow-y-auto scroll-smooth pb-12'>
        <div className='lg:max-w-xl'>{children}</div>
      </div>
    </div>
  )
}
