'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/common/button'

export type TwoPaneWorkspaceTopBarProps = {
  backUrl: string
  title: string
  description?: string
  headerActions?: ReactNode
}

export function TwoPaneWorkspaceTopBar({
  backUrl,
  title,
  description,
  headerActions,
}: TwoPaneWorkspaceTopBarProps) {
  const router = useRouter()

  return (
    <header className='z-50 w-full shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='relative flex h-full items-center gap-3 p-3 sm:gap-4'>
        <div className='w-full flex items-center justify-between gap-4'>
          <div className='flex items-center gap-2 flex-1'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 -ms-2'
              onClick={() => router.push(backUrl)}
              aria-label='Go back'
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <div>
              <h3 className='text-lg font-medium'>{title}</h3>
              {description && (
                <p className='text-sm text-muted-foreground'>{description}</p>
              )}
            </div>
          </div>
          {headerActions && <div>{headerActions}</div>}
        </div>
      </div>
    </header>
  )
}
