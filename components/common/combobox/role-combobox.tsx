'use client'

import * as React from 'react'
import { useRoles } from '@/hooks/use-roles'
import { Combobox, type ComboboxOption } from '../combobox'

type RoleComboboxProps = {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  buttonClassName?: string
  disabled?: boolean
  enabled?: boolean
  pageSize?: number
}

export function RoleCombobox({
  value,
  onValueChange,
  placeholder = 'Select role...',
  searchPlaceholder = 'Search role...',
  emptyMessage = 'No role found.',
  className,
  buttonClassName,
  disabled = false,
  enabled = true,
  pageSize = 100,
}: RoleComboboxProps) {
  const [searchInput, setSearchInput] = React.useState('')

  const { data, isLoading, isPending, isFetching, error } = useRoles({
    search: searchInput || undefined,
    filters: { isActive: ['active'] },
    pageSize,
    enabled,
  })

  const noPermission =
    error &&
    typeof error === 'object' &&
    'response' in error &&
    (error as { response?: { status?: number } }).response?.status === 403

  const options: ComboboxOption[] = React.useMemo(
    () =>
      (data?.roles ?? []).map((role) => ({
        label: role.name,
        value: role.id,
      })),
    [data?.roles]
  )

  const handleSearchChange = React.useCallback((search: string) => {
    setSearchInput(search)
  }, [])

  const listLoading =
    !noPermission &&
    options.length === 0 &&
    (isPending || isFetching)

  return (
    <Combobox
      options={options}
      value={value}
      onValueChange={onValueChange}
      placeholder={noPermission ? 'No Permission Access' : placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
      className={className}
      buttonClassName={buttonClassName}
      disabled={disabled || noPermission}
      onSearchChange={handleSearchChange}
      isLoading={isLoading}
      listLoading={listLoading}
    />
  )
}
