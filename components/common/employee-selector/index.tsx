'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { ChevronDown, Loader2, Plus, X } from 'lucide-react'
import { Avatar } from '@/components/common/avatar'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
} from '@/components/common/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/common/popover'
import { PERMISSIONS } from '@/lib/constants/permission-codes'
import { useEmployeesInfinite } from '@/hooks/use-employees-infinite'
import { useHasRolePermissions } from '@/hooks/use-has-role-permissions'
import { getEmployee } from '@/services/client/employees/employee-service'
import { cn } from '@/lib/utils'
import type { Employee } from '@/types/employee'

type EmployeeSelectorProps = {
  value?: string
  onValueChange: (value: string) => void
  disabled?: boolean
  /** Empty-state label. */
  placeholder?: string
  /** Pre-loaded employee so the selected value displays before the list loads. */
  initialEmployee?: Pick<Employee, 'id' | 'name' | 'code' | 'imageUrl'> | null
}

export function EmployeeSelector({
  value,
  onValueChange,
  disabled = false,
  placeholder = 'Add supervisor',
  initialEmployee,
}: EmployeeSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<Pick<
    Employee,
    'id' | 'name' | 'code' | 'imageUrl'
  > | null>(null)
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(false)

  const { allowed: hasEmployeePermission } = useHasRolePermissions(PERMISSIONS.EMPLOYEES, {
    whenPending: 'allow',
  })

  const {
    employees,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    fetchNextPage,
  } = useEmployeesInfinite({
    search,
    filters: { status: ['active'] },
    enabled: (open || !!value) && hasEmployeePermission,
    pageSize: 20,
  })

  useEffect(() => {
    if (!value) {
      setSelectedEmployee(null)
      setIsLoadingEmployee(false)
      return
    }
    const fromList = employees.find((employee) => employee.id === value)
    if (fromList) {
      setSelectedEmployee(fromList)
      setIsLoadingEmployee(false)
      return
    }
    if (initialEmployee && initialEmployee.id === value) {
      setSelectedEmployee(initialEmployee)
      setIsLoadingEmployee(false)
      return
    }
    setIsLoadingEmployee(true)
    getEmployee(value)
      .then((employee) => setSelectedEmployee(employee))
      .catch(() => setSelectedEmployee(null))
      .finally(() => setIsLoadingEmployee(false))
  }, [value, employees, initialEmployee])

  const handleListScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (!hasNextPage || isFetchingNextPage) return
      const el = event.currentTarget
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      if (distanceFromBottom <= 50) {
        void fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  )

  const handleSelect = (employeeId: string) => {
    const employee = employees.find((item) => item.id === employeeId)
    if (employee) setSelectedEmployee(employee)
    onValueChange(employeeId)
    setOpen(false)
    setSearch('')
  }

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation()
    onValueChange('')
    setSelectedEmployee(null)
  }

  const popoverDisabled = disabled || !hasEmployeePermission
  const showListLoading = open && (isLoading || (isFetching && employees.length === 0))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type='button'
          disabled={popoverDisabled}
          className={cn('w-full text-left', popoverDisabled && 'cursor-not-allowed opacity-50')}
        >
          {selectedEmployee ? (
            <div className='flex items-center gap-2.5 rounded-lg border border-gray-200 bg-background p-3 transition-colors hover:bg-accent cursor-pointer'>
              <Avatar src={selectedEmployee.imageUrl} name={selectedEmployee.name} size={36} square />
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-1.5'>
                  <div className='truncate text-sm font-medium'>{selectedEmployee.name}</div>
                  <ChevronDown className='h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-50' />
                </div>
                <div className='truncate text-xs text-muted-foreground'>{selectedEmployee.code}</div>
              </div>
              <div
                role='button'
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handleClear(event as unknown as React.MouseEvent)
                  }
                }}
                className='shrink-0 cursor-pointer rounded-sm p-1 opacity-70 transition-opacity hover:bg-accent hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                aria-label='Clear selection'
              >
                <X className='h-4 w-4' />
              </div>
            </div>
          ) : (
            <div className='flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50'>
              {isLoadingEmployee ? (
                <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
              ) : !hasEmployeePermission ? (
                <span className='text-sm font-medium text-muted-foreground'>
                  No permission to select employee
                </span>
              ) : (
                <>
                  <Plus className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm font-medium text-muted-foreground'>{placeholder}</span>
                </>
              )}
            </div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className='w-[400px] p-0' align='start'>
        <Command shouldFilter={false}>
          <CommandInput placeholder='Search employees...' value={search} onValueChange={setSearch} />
          <div
            role='listbox'
            className='max-h-[300px] overflow-y-auto overflow-x-hidden p-1'
            onScroll={handleListScroll}
          >
            {showListLoading ? (
              <div className='flex items-center justify-center p-4'>
                <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
              </div>
            ) : employees.length === 0 ? (
              <CommandEmpty>{isLoading ? 'Loading...' : 'No employee found.'}</CommandEmpty>
            ) : (
              <>
                {employees.map((employee) => (
                  <CommandItem
                    key={employee.id}
                    value={employee.id}
                    onSelect={() => handleSelect(employee.id)}
                    className='flex cursor-pointer items-start gap-3 px-3 py-2'
                  >
                    <Avatar src={employee.imageUrl} name={employee.name} size={32} square />
                    <div className='min-w-0 flex-1'>
                      <div className='font-medium'>{employee.name}</div>
                      <div className='truncate text-xs text-muted-foreground'>{employee.code}</div>
                    </div>
                  </CommandItem>
                ))}
                {isFetchingNextPage ? (
                  <div className='flex items-center justify-center p-2'>
                    <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                  </div>
                ) : null}
                {hasNextPage && !isFetchingNextPage ? (
                  <button
                    type='button'
                    className='flex w-full items-center justify-center px-2 py-2 text-xs text-muted-foreground hover:text-foreground'
                    onClick={() => void fetchNextPage()}
                  >
                    Load more
                  </button>
                ) : null}
              </>
            )}
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
