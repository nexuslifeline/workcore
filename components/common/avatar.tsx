'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '@/lib/utils'

const colors = [
  'bg-red-500 text-white',
  'bg-green-500 text-white',
  'bg-blue-500 text-white',
  'bg-yellow-400 text-white',
  'bg-orange-500 text-white',
  'bg-red-600 text-white',
  'bg-green-600 text-white',
  'bg-yellow-500 text-white',
  'bg-pink-500 text-white',
  'bg-indigo-500 text-white',
  'bg-rose-500 text-white',
  'bg-amber-500 text-white',
  'bg-lime-500 text-white',
  'bg-cyan-800 text-white',
  'bg-teal-600 text-white',
  'bg-purple-600 text-white',
  'bg-blue-400 text-white',
  'bg-purple-500 text-white',
  'bg-gray-800 text-white',
]

function getColorIndex(initials = '') {
  let hash = 0
  for (let i = 0; i < initials.length; i++) {
    hash = (hash << 5) - hash + initials.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % colors.length
}

function getInitials(name: string): string {
  if (!name) return ''

  const words = name.trim().split(/\s+/)
  if (words.length === 0) return ''

  let initials = words[0][0]?.toUpperCase() || ''

  if (words.length > 1) {
    initials += words[1][0]?.toUpperCase() || ''
  }

  return initials.slice(0, 2)
}

interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string | null
  name: string
  square?: boolean
  size?: number
}

export function Avatar({
  src = null,
  square = false,
  name,
  size = 32,
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false)
  const initials = getInitials(name)
  const colorIndex = initials ? getColorIndex(initials) : -1
  const backgroundColor = initials
    ? colors[colorIndex]
    : 'bg-gray-700 animate-pulse'

  // Reset error state when src changes
  React.useEffect(() => {
    setImageError(false)
  }, [src])

  const shouldShowImage = src && !imageError
  const shouldShowInitials = initials && !shouldShowImage

  return (
    <span
      data-slot='avatar'
      {...props}
      className={cn(
        'inline-grid shrink-0 align-middle *:col-start-1 *:row-start-1',
        square ? 'rounded-lg' : 'rounded-full',
        // Only show background color when showing initials (no image)
        shouldShowInitials && backgroundColor,
        // Border styling: black border when image exists, colored border when initials
        shouldShowImage
          ? 'border border-black/20'
          : shouldShowInitials
            ? square
              ? 'border border-gray-200'
              : 'border border-white'
            : 'border border-gray-200',
        className
      )}
      style={{ width: size, height: size }}
    >
      {shouldShowInitials && (
        <span
          className='flex size-full items-center justify-center select-none uppercase text-white'
          style={{
            fontSize: Math.max(size * 0.5, 12),
            fontWeight: 600,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
          aria-label={name}
        >
          {initials}
        </span>
      )}
      {shouldShowImage && (
        <img
          className={cn(
            'size-full object-cover',
            square ? 'rounded-lg' : 'rounded-full'
          )}
          src={src || ''}
          alt={name}
          onError={() => setImageError(true)}
        />
      )}
    </span>
  )
}

function AvatarRoot({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot='avatar'
      className={cn(
        'relative flex size-8 shrink-0 overflow-hidden rounded-full',
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot='avatar-image'
      className={cn('aspect-square size-full', className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot='avatar-fallback'
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-muted',
        className
      )}
      {...props}
    />
  )
}

export { AvatarRoot, AvatarImage, AvatarFallback }