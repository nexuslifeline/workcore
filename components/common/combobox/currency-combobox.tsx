'use client'

import { useMemo } from 'react'
import { Combobox } from '@/components/common/combobox'
import { COMMON_CURRENCIES } from '@/lib/constants/currencies'

type CurrencyComboboxProps = {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  buttonClassName?: string
  disabled?: boolean
}

export function CurrencyCombobox({
  value,
  onValueChange,
  placeholder = 'Select currency...',
  searchPlaceholder = 'Search currency...',
  emptyMessage = 'No currency found.',
  className,
  buttonClassName,
  disabled = false,
}: CurrencyComboboxProps) {
  const currencyOptions = useMemo(() => {
    return COMMON_CURRENCIES.map((currency) => ({
      label: `${currency.code} - ${currency.name}`,
      value: currency.code,
    }))
  }, [])

  return (
    <Combobox
      options={currencyOptions}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
      className={className}
      buttonClassName={buttonClassName}
      disabled={disabled}
    />
  )
}
