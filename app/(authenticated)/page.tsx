'use client'

import { ComingSoon } from '@/components/coming-soon'
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

      <Main fixed className='pt-0'>
        <ComingSoon />
      </Main>
    </>
  )
}
