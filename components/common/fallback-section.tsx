'use client'

import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

type FallbackSectionProps = {
  title?: string
  message?: string
  defaultTitle?: string
  defaultMessage?: string
  icon?: React.ReactNode
  showBackButton?: boolean
  backButtonLabel?: string
  onBack?: () => void
  className?: string
}

export function FallbackSection({
  title,
  message,
  defaultTitle = 'Something went wrong',
  defaultMessage = 'We encountered an error while loading this content. Please try again.',
  icon,
  showBackButton = true,
  backButtonLabel = 'Go back',
  onBack,
  className,
}: FallbackSectionProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  const displayIcon = icon || (
    <AlertCircle className='size-12 text-destructive' aria-hidden='true' />
  )

  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center gap-4 py-12 text-center',
        className
      )}
    >
      <div className='flex flex-col items-center gap-4'>
        {displayIcon}
        <div className='space-y-2'>
          <h3 className='text-lg font-semibold'>
            {title || defaultTitle}
          </h3>
          <p className='text-sm text-muted-foreground max-w-md'>
            {message || defaultMessage}
          </p>
        </div>
      </div>
      {showBackButton && (
        <Button
          variant='outline'
          onClick={handleBack}
          className='mt-2'
        >
          {backButtonLabel}
        </Button>
      )}
    </div>
  )
}

