'use client'

import { useEffect } from 'react'
import { HelpCircle } from 'lucide-react'
import { Button } from '@/components/common/button'
import { openTawkChat, toggleTawkChat } from '@/components/support/tawk-widget'

export default function HelpCenterPage() {
  useEffect(() => {
    openTawkChat()
  }, [])

  return (
    <div className='flex min-h-[60vh] w-full flex-col items-center justify-center gap-3'>
      <HelpCircle className='size-16 text-muted-foreground' />
      <h1 className='text-3xl font-bold'>Support</h1>
      <p className='max-w-md text-center text-muted-foreground'>
        Chat with support from this page, or use Support in the sidebar.
      </p>
      <Button type='button' onClick={() => toggleTawkChat()}>
        Chat with support
      </Button>
    </div>
  )
}
