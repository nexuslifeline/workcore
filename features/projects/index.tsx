'use client'

import { Plus } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/common/button'
import { PageHeader } from '@/components/common/page-header'
import { ProjectPanel } from './components/project-panel'
import { ProjectsTable } from './components/projects-table'

export function Projects() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <>
      <PageHeader
        title='Projects'
        description='Plan work, track labor, and watch the budget for the current organization.'
        actions={
          <Button className='space-x-1' onClick={() => router.push(`${pathname}?action=new`)}>
            <span>Add project</span> <Plus size={18} />
          </Button>
        }
      />
      <ProjectsTable />
      <ProjectPanel />
    </>
  )
}
