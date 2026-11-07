import { Plus } from 'lucide-react'
import { Button } from '@/components/common/button'
import { useOrganizationsInteractionStore } from '@/stores/organizations-interaction-store'

export function OrganizationsPrimaryButtons() {
  const setDialogOpen = useOrganizationsInteractionStore((state) => state.setDialogOpen)
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setDialogOpen('create')}>
        <span>Add Organization</span> <Plus size={18} />
      </Button>
    </div>
  )
}

