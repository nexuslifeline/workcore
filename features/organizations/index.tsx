'use client'

import { PageHeader } from '@/components/common/page-header'
import { OrganizationsDialogs } from './components/organizations-dialogs'
import { OrganizationsPrimaryButtons } from './components/organizations-primary-buttons'
import { OrganizationsTable } from './components/organizations-table'

export function Organizations() {
  return (
    <>
      <PageHeader
        title='Organizations'
        description='Manage your organizations and their settings here.'
        actions={<OrganizationsPrimaryButtons />}
      />
      <OrganizationsTable />
      <OrganizationsDialogs />
    </>
  )
}

