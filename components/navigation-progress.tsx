'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import LoadingBar, { type LoadingBarRef } from 'react-top-loading-bar'

export function NavigationProgress() {
  const ref = useRef<LoadingBarRef>(null)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Start loading bar when route changes
    ref.current?.continuousStart()
    
    // Complete loading bar after a short delay
    const timer = setTimeout(() => {
      ref.current?.complete()
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  return (
    <LoadingBar
      color='var(--muted-foreground)'
      ref={ref}
      shadow={true}
      height={2}
    />
  )
}
