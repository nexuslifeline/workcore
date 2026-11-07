'use client'

import { Header } from '@/components/layout/header'
import { HeaderUserActions } from '@/components/layout/header-user-actions'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'

export default function DashboardPage() {
  return (
    <>
      <Header>
        <Search />
        <HeaderUserActions />
      </Header>

      <Main className='pt-3'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold tracking-tight'>Dashboard</h1>
          <p className='text-sm text-muted-foreground'>
            Your workspace is ready. Employee, user, and organization tools are in the sidebar.
          </p>
        </div>
      </Main>
    </>
  )
}
