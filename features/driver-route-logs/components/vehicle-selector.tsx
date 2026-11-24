'use client'

import { useEffect, useMemo, useState } from 'react'
import { Combobox } from '@/components/common/combobox'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useVehicles } from '@/hooks/use-vehicles'

type VehicleOption = {
  id: string
  name: string
  plateNumber: string
}

export function VehicleSelector({
  value,
  onValueChange,
  initialVehicle,
  disabled = false,
}: {
  value?: string
  onValueChange: (value: string) => void
  initialVehicle?: VehicleOption | null
  disabled?: boolean
}) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<VehicleOption | null>(initialVehicle ?? null)
  const debouncedSearch = useDebouncedValue(search, 300)
  const query = useVehicles({
    page: 1,
    pageSize: 20,
    search: debouncedSearch || undefined,
  })
  const vehicles = query.data?.vehicles ?? []

  useEffect(() => {
    if (!value) {
      setSelected(null)
      return
    }
    const fromList = vehicles.find((vehicle) => vehicle.id === value)
    if (fromList) {
      setSelected({
        id: fromList.id,
        name: fromList.name,
        plateNumber: fromList.plateNumber,
      })
      return
    }
    if (initialVehicle && initialVehicle.id === value) {
      setSelected(initialVehicle)
    }
  }, [value, vehicles, initialVehicle])

  const options = useMemo(() => {
    const rows = vehicles.map((vehicle) => ({
      value: vehicle.id,
      label: `${vehicle.name} ${vehicle.plateNumber}`,
      display: (
        <div className='min-w-0'>
          <div className='truncate font-medium'>{vehicle.name}</div>
          <div className='truncate text-xs text-muted-foreground'>{vehicle.plateNumber}</div>
        </div>
      ),
      triggerDisplay: (
        <span className='truncate text-left'>
          {vehicle.name}
          <span className='text-muted-foreground'> · {vehicle.plateNumber}</span>
        </span>
      ),
    }))
    if (selected && !rows.some((option) => option.value === selected.id)) {
      rows.unshift({
        value: selected.id,
        label: `${selected.name} ${selected.plateNumber}`,
        display: (
          <div className='min-w-0'>
            <div className='truncate font-medium'>{selected.name}</div>
            <div className='truncate text-xs text-muted-foreground'>{selected.plateNumber}</div>
          </div>
        ),
        triggerDisplay: (
          <span className='truncate text-left'>
            {selected.name}
            <span className='text-muted-foreground'> · {selected.plateNumber}</span>
          </span>
        ),
      })
    }
    return rows
  }, [vehicles, selected])

  return (
    <Combobox
      options={options}
      value={value}
      onValueChange={onValueChange}
      onSearchChange={setSearch}
      placeholder='Select vehicle'
      searchPlaceholder='Search vehicles...'
      emptyMessage='No vehicle found.'
      disabled={disabled}
      listLoading={query.isLoading}
      allowClear
      ariaLabel='Vehicle'
    />
  )
}
