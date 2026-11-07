import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center border font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        success:
          'border-transparent bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 [a&]:hover:bg-emerald-500/25',
        warning:
          'border-transparent bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 [a&]:hover:bg-amber-500/25',
        info:
          'border-transparent bg-sky-500/15 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400 [a&]:hover:bg-sky-500/25',
      },
      size: {
        sm: 'px-1.5 py-0 text-[10px] [&>svg]:size-2.5 gap-0.5',
        md: 'px-2 py-0.5 text-xs [&>svg]:size-3 gap-1',
        lg: 'px-2.5 py-1 text-sm [&>svg]:size-3.5 gap-1.5',
      },
      shape: {
        rounded: 'rounded-md',
        pill: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      shape: 'rounded',
    },
  }
)

export type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }

function Badge({
  className,
  variant,
  size,
  shape,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot='badge'
      className={cn(badgeVariants({ variant, size, shape }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }




