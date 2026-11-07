import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/common/form'
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form'
import { Label } from '@/components/common/label'

type FormFieldWithDescriptionProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerProps<TFieldValues, TName>, 'render'> & {
  label: string
  description?: string
  note?: string
  required?: boolean
  children: (field: {
    value: any
    onChange: (value: any) => void
    onBlur: () => void
    name: string
    ref: React.Ref<any>
  }) => React.ReactNode
  className?: string
}

export function FormFieldWithDescription<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  description,
  note,
  required,
  children,
  className,
  ...props
}: FormFieldWithDescriptionProps<TFieldValues, TName>) {
  return (
    <FormField
      {...props}
      render={({ field }) => (
        <div className={cn('grid grid-cols-[1fr_2fr] gap-6 items-start py-4 border-b border-border last:border-b-0', className)}>
          <div className='space-y-1'>
            <Label className='text-sm font-medium'>
              {label}
              {required && <span className='text-destructive ml-1'>*</span>}
            </Label>
            {description && (
              <p className='text-sm text-muted-foreground mt-1'>
                {description}
              </p>
            )}
            {note && (
              <p className='text-xs text-muted-foreground mt-2'>
                <span className='font-medium'>Note:</span> {note}
              </p>
            )}
          </div>
          <div className='space-y-2'>
            <FormItem>
              <FormControl>{children(field)}</FormControl>
              <FormMessage />
            </FormItem>
          </div>
        </div>
      )}
    />
  )
}
