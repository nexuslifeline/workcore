'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/common/button'
import { NotFoundError } from '@/features/errors/not-found-error'

export default function NotFound() {
  return <NotFoundError />
}













