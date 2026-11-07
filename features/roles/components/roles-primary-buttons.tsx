import { Plus } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/common/button'

export function RolesPrimaryButtons() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleAddClick = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('action', 'new')
    params.delete('id')
    router.push(`/roles?${params.toString()}`)
  }

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={handleAddClick}>
        <span>Add Role</span> <Plus size={18} />
      </Button>
    </div>
  )
}
