'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

type ListEditNameLinkProps = {
  id: string
  name?: string | null
  /** Dedicated edit page. When set, query-param edit is not used. */
  href?: string
  /** List path for `?action=edit&id=`. Defaults to the current pathname. */
  listPath?: string
  className?: string
}

export function hrefWithListEditAction(
  listPath: string,
  search: string,
  id: string
): string {
  const params = new URLSearchParams(search)
  params.set('action', 'edit')
  params.set('id', id)
  return `${listPath}?${params.toString()}`
}

export function ListEditNameLink({
  id,
  name,
  href,
  listPath,
  className,
}: ListEditNameLinkProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const label = name?.trim()

  if (!label) {
    return <span className={cn('truncate font-medium', className)}>-</span>
  }

  const editHref =
    href ?? hrefWithListEditAction(listPath ?? pathname, searchParams.toString(), id)

  return (
    <Link
      href={editHref}
      className={cn(
        'truncate font-medium text-inherit no-underline decoration-inherit hover:underline',
        className
      )}
    >
      {label}
    </Link>
  )
}
