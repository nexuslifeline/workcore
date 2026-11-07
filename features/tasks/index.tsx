'use client'

import { PageHeader } from '@/components/common/page-header'
import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import { TasksProvider } from './components/tasks-provider'
import { TasksTable } from './components/tasks-table'
import { tasks } from './data/tasks'

export function Tasks() {
  return (
    <TasksProvider>
      <PageHeader
        title='Tasks'
        description="Here's a list of your tasks for this month!"
        actions={<TasksPrimaryButtons />}
      />
      <TasksTable data={tasks} />
      <TasksDialogs />
    </TasksProvider>
  )
}
