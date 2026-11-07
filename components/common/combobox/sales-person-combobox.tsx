'use client'

import * as React from 'react'
import { useUsersInfinite } from '@/hooks/use-users-infinite'
import { Combobox, type ComboboxOption } from '../combobox'

type SalesPersonComboboxProps = {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  buttonClassName?: string
  disabled?: boolean
  onlyActive?: boolean
  enabled?: boolean
  pageSize?: number
}

export function SalesPersonCombobox({
  value,
  onValueChange,
  placeholder = 'Select sales person...',
  searchPlaceholder = 'Search sales person...',
  emptyMessage = 'No sales person found.',
  className,
  buttonClassName,
  disabled = false,
  onlyActive = true,
  enabled = true,
  pageSize = 20,
}: SalesPersonComboboxProps) {
  const [searchInput, setSearchInput] = React.useState('')

  const {
    users,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isPending,
    isFetching,
    fetchNextPage,
  } = useUsersInfinite({
    search: searchInput,
    filters: onlyActive ? { status: ['active'] } : undefined,
    enabled,
    pageSize,
  })

  // Convert to Combobox format
  // Use userId as the value (as requested)
  const options: ComboboxOption[] = React.useMemo(
    () =>
      users
        .filter((user) => user.userId) // Filter out users without userId
        .map((user) => ({
          label: user.name || user.email || 'Unknown',
          value: user.userId!, // Use userId field as requested (non-null assertion after filter)
        })),
    [users]
  )

  // Handle loading more when scrolling
  const handleLoadMore = React.useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Handle search change from combobox
  const handleSearchChange = React.useCallback((search: string) => {
    setSearchInput(search)
  }, [])

  const listLoading =
    options.length === 0 &&
    (isPending || isFetching)

  return (
    <Combobox
      options={options}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
      className={className}
      buttonClassName={buttonClassName}
      disabled={disabled}
      onSearchChange={handleSearchChange}
      onLoadMore={hasNextPage ? handleLoadMore : undefined}
      isLoadingMore={isFetchingNextPage && users.length > 0}
      isLoading={isLoading}
      listLoading={listLoading}
    />
  )
}
