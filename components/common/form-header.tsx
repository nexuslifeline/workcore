'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from './button'
import { Separator } from './separator'

type FormHeaderProps = {
  title: string
  description: string
  showBackButton?: boolean
  onBack?: () => void
  className?: string
}

export function FormHeader({
  title,
  description,
  showBackButton = false,
  onBack,
  className,
}: FormHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      window.history.back()
    }
  }

  return (
    <div className={className}>
      <div className='space-y-0.5 flex-none'>
        <div className='flex items-start gap-2'>
          {showBackButton && (
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 -ms-2 mt-0.5 flex-shrink-0'
              onClick={handleBack}
              aria-label='Go back'
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
          )}
          <div className='flex-1'>
            <h3 className='text-lg font-medium'>{title}</h3>
            <p className='text-sm text-muted-foreground mt-0.5'>{description}</p>
          </div>
        </div>
        <Separator className='my-4 lg:my-6' />
      </div>
    </div>
  )
}
