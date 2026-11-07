'use client'

import { useState } from 'react'
import { Mail, Users as UsersIcon } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { Tabs, TabsContent } from '@/components/common/tabs'
import { WorkspaceRouteTabs } from '@/components/common/workspace-route-tabs'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import { InvitationsTable } from './components/invitations-table'

const USERS_TABS = [
  {
    value: 'users',
    label: 'Users',
    icon: <UsersIcon className='size-4' />,
  },
  {
    value: 'invitations',
    label: 'Invitations',
    icon: <Mail className='size-4' />,
  },
] as const

export function Users() {
  const [activeTab, setActiveTab] = useState<'users' | 'invitations'>('users')

  return (
    <>
      <PageHeader
        title='Users'
        description='Manage your users and invitations here.'
        actions={<UsersPrimaryButtons />}
      />
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'users' | 'invitations')}
        className='w-full'
      >
        <WorkspaceRouteTabs
          tabs={USERS_TABS.map((tab) => ({
            value: tab.value,
            label: tab.label,
            icon: tab.icon,
          }))}
          activeValue={activeTab}
        />
        <TabsContent value='users' className='mt-4'>
          <UsersTable />
        </TabsContent>
        <TabsContent value='invitations' className='mt-4'>
          <InvitationsTable />
        </TabsContent>
      </Tabs>
      <UsersDialogs />
    </>
  )
}
