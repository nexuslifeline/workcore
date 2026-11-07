import { DropdownMenuCheckboxItem } from '@/components/common/dropdown-menu'
import type { VisibilityState } from '@tanstack/react-table'

type DataTableViewOptionsItemProps = {
  columnId: string
  label: string
  isVisible: boolean
  columnVisibility: VisibilityState
  onColumnVisibilityChange: (next: VisibilityState) => void
}

function formatLabel(label: string) {
  // Convert camelCase or snake_case into "Title Case" with spaces.
  const withSpaces = label
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')

  return withSpaces
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function DataTableViewOptionsItem({
  columnId,
  label,
  isVisible,
  columnVisibility,
  onColumnVisibilityChange,
}: DataTableViewOptionsItemProps) {
  return (
    <DropdownMenuCheckboxItem
      className='truncate'
      checked={isVisible}
      onCheckedChange={(value) => {
        const newVisibility = { ...columnVisibility }
        if (value) {
          delete newVisibility[columnId]
        } else {
          newVisibility[columnId] = false
        }
        onColumnVisibilityChange(newVisibility)
      }}
    >
      {formatLabel(label)}
    </DropdownMenuCheckboxItem>
  )
}


