import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/common/card'

export type PanelCardProps = {
  title: React.ReactNode
  description?: React.ReactNode
  /** Right side of the header row (aligned with title + description via `CardAction`). */
  headerAction?: React.ReactNode
  children?: React.ReactNode
  /** Merged onto the root `Card`. */
  className?: string
  /** Merged after default `gap-0.5` on `CardHeader` (tighter title ↔ description than base `gap-1.5`). */
  headerClassName?: string
  /** Merged onto `CardAction` when `headerAction` is set. */
  headerActionClassName?: string
  titleClassName?: string
  descriptionClassName?: string
  /** Merged after default `ps-2` on `CardContent`. */
  contentClassName?: string
}

/**
 * Dashboard-style card panel: title, optional description, optional body.
 * Optional `headerAction` renders in the header’s right column (with title + description on the left), using `CardAction` / `CardHeader`’s two-column layout.
 */
export function PanelCard({
  title,
  description,
  headerAction,
  children,
  className,
  headerClassName,
  headerActionClassName,
  titleClassName,
  descriptionClassName,
  contentClassName,
}: PanelCardProps) {
  const hasDescription =
    description != null &&
    (typeof description !== 'string' || description.trim() !== '')
  const hasHeaderAction = headerAction != null

  return (
    <Card className={cn('rounded-lg', className)}>
      <CardHeader className={cn('gap-0.5', headerClassName)}>
        <CardTitle className={cn('col-start-1 row-start-1 text-lg', titleClassName)}>
          {title}
        </CardTitle>
        {hasDescription ? (
          <CardDescription className={cn('col-start-1 row-start-2', descriptionClassName)}>
            {description}
          </CardDescription>
        ) : null}
        {hasHeaderAction ? (
          <CardAction className={cn(headerActionClassName)}>{headerAction}</CardAction>
        ) : null}
      </CardHeader>
      {children != null ? (
        <CardContent className={cn('ps-2', contentClassName)}>{children}</CardContent>
      ) : null}
    </Card>
  )
}
