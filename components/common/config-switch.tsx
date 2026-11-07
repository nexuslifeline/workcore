'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { Control, FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/common/form'
import { Switch } from '@/components/common/switch'

type ConfigSwitchProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>
  name: TName
  label: string
  description: string | ((value: any) => string)
  viewConfigLink?: {
    href: string
    label: string
  }
  learnMoreLink?: string | {
    href: string
    onClick?: () => void
  }
  disabled?: boolean
  activeOrganizationId?: string | null
  // Optional transformers for non-boolean values
  getChecked?: (value: any) => boolean
  getValue?: (checked: boolean) => any
  children?: React.ReactNode
}

export function ConfigSwitch<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  viewConfigLink,
  learnMoreLink,
  disabled = false,
  activeOrganizationId,
  getChecked,
  getValue,
  children,
}: ConfigSwitchProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const descriptionText = typeof description === 'function' 
          ? description(field.value) 
          : description

        const checked = getChecked ? getChecked(field.value) : (field.value || false)
        const handleChange = (checked: boolean) => {
          const newValue = getValue ? getValue(checked) : checked
          field.onChange(newValue)
        }

        return (
          <FormItem className='rounded-lg border p-4 space-y-0'>
            <div className='flex items-center justify-between'>
              <FormLabel className='text-base font-medium cursor-pointer' onClick={() => !disabled && handleChange(!checked)}>
                {label}
              </FormLabel>
              <FormControl>
                <Switch
                  checked={checked}
                  onCheckedChange={handleChange}
                  disabled={disabled}
                />
              </FormControl>
            </div>
            <p className='text-xs text-muted-foreground'>
              {descriptionText}
            </p>
            {(viewConfigLink || learnMoreLink) && (
              <div className='flex justify-between pt-1'>
                {activeOrganizationId && viewConfigLink && (
                  <Link
                    href={viewConfigLink.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1 text-primary hover:underline text-xs'
                  >
                    {viewConfigLink.label}
                    <ExternalLink className='h-3 w-3' />
                  </Link>
                )}
                {learnMoreLink && (
                  <Link
                    href={typeof learnMoreLink === 'string' ? learnMoreLink : learnMoreLink.href}
                    onClick={typeof learnMoreLink === 'object' && learnMoreLink.onClick ? (e) => {
                      e.preventDefault()
                      learnMoreLink.onClick?.()
                    } : undefined}
                    className={`text-xs text-primary hover:underline cursor-pointer ${activeOrganizationId && viewConfigLink ? 'ml-auto' : ''}`}
                  >
                    Learn more
                  </Link>
                )}
              </div>
            )}
            {children && (
              <div className='pt-4 border-t mt-2'>
                {children}
              </div>
            )}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
