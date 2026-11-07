'use client'

import { useEffect } from 'react'
import { GeneralError } from '@/features/errors/general-error'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return <GeneralError />
}













