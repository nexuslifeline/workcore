'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from './button'
import { Separator } from './separator'

type PageHeaderProps = {
  title: string
  description: string
  actions?: React.ReactNode
  showBackButton?: boolean
  backHref?: string
  className?: string
}

export function PageHeader({
  title,
  description,
  actions,
  showBackButton = false,
  backHref,
  className,
}: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  return (
    <div className={className}>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div className='flex min-w-0 items-center gap-2'>
          {showBackButton && (
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 shrink-0 -ms-2'
              onClick={handleBack}
              aria-label='Go back'
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
          )}
          <div className='min-w-0'>
            <h3 className='truncate text-lg font-medium'>{title}</h3>
            <p className='text-muted-foreground truncate text-sm'>{description}</p>
          </div>
        </div>
        {actions && <div className='ms-auto flex max-w-full shrink-0 justify-end'>{actions}</div>}
      </div>
      {!className && <Separator className='my-4 flex-none' />}
    </div>
  )
}
