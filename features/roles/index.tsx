'use client'

import { PageHeader } from '@/components/common/page-header'
import { RolesPrimaryButtons } from './components/roles-primary-buttons'
import { RolesTable } from './components/roles-table'
import { RolesDialogs } from './components/roles-dialogs'
import { RolesPanel } from './components/roles-panel'

export function Roles() {
  return (
    <>
      <PageHeader
        title='Roles'
        description='Manage roles here.'
        actions={<RolesPrimaryButtons />}
      />
      <RolesTable />
      <RolesPanel />
      <RolesDialogs />
    </>
  )
}
