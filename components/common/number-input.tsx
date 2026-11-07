'use client'

import * as React from 'react'
import { NumericFormat, type NumberFormatValues } from 'react-number-format'
import { Input } from '@/components/common/input'
import { cn } from '@/lib/utils'
import { stripGrouping } from '@/lib/utils/numeric-string'

export const numberInputAppearances = ['default', 'table'] as const
export type NumberInputAppearance = (typeof numberInputAppearances)[number]

/** Compact right-aligned cell styling for line-item tables. */
export const tableLineItemNumericInputClassName =
  'h-7 w-full text-[12px] text-right border-transparent hover:border-border focus:border-primary bg-transparent shadow-none tabular-nums px-1'

function defaultIsAllowedNonNegative(values: NumberFormatValues): boolean {
  const { floatValue, value } = values
  if (value === '' || value === undefined) return true
  if (floatValue === undefined) return true
  return floatValue >= 0
}

type NativePassthrough = Omit<
  React.ComponentPropsWithoutRef<'input'>,
  'value' | 'defaultValue' | 'onChange' | 'type'
>

export type NumberInputProps = NativePassthrough & {
  /** Raw numeric string without thousand separators (RHF / API shape). */
  value: string
  onValueChange: (value: string) => void
  appearance?: NumberInputAppearance
  /** Omit for unrestricted fractional digits (e.g. quantity). */
  decimalScale?: number
  fixedDecimalScale?: boolean
  thousandSeparator?: boolean | string
  allowNegative?: boolean
  isAllowed?: (values: NumberFormatValues) => boolean
  prefix?: string
  suffix?: string
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput(
    {
      value,
      onValueChange,
      appearance = 'default',
      className,
      decimalScale: decimalScaleProp,
      fixedDecimalScale: fixedDecimalScaleProp,
      thousandSeparator = ',',
      allowNegative = false,
      isAllowed,
      prefix,
      suffix,
      ...rest
    },
    ref
  ) {
    const appearanceClass = appearance === 'table' ? tableLineItemNumericInputClassName : ''

    const scaleProps: { decimalScale?: number; fixedDecimalScale?: boolean } = {}
    if (decimalScaleProp !== undefined) scaleProps.decimalScale = decimalScaleProp
    if (fixedDecimalScaleProp !== undefined) scaleProps.fixedDecimalScale = fixedDecimalScaleProp

    return (
      <NumericFormat
        getInputRef={ref}
        customInput={Input}
        type='text'
        value={stripGrouping(value)}
        valueIsNumericString
        onValueChange={(values) => onValueChange(values.value)}
        thousandSeparator={thousandSeparator}
        decimalSeparator='.'
        allowedDecimalSeparators={['.']}
        {...scaleProps}
        allowNegative={allowNegative}
        inputMode='decimal'
        isAllowed={isAllowed ?? defaultIsAllowedNonNegative}
        prefix={prefix}
        suffix={suffix}
        className={cn(appearanceClass, className)}
        {...rest}
      />
    )
  }
)
NumberInput.displayName = 'NumberInput'
