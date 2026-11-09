'use client'

import { createListTableQueryShell } from '@/components/common/list-table-shell'
import { useProjects } from '@/hooks/use-projects'
import type { PaginatedTableQueryParams } from '@/hooks/use-table-state'
import type { Project } from '@/types/project'
import { projectStatuses } from '../data/data'
import { projectColumns } from './projects-columns'

function useProjectsListQuery(params: PaginatedTableQueryParams) {
  const query = useProjects({
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
    filters: params.filters,
  })
  return {
    rows: query.data?.projects ?? [],
    isLoading: query.isLoading,
    error: query.error,
    totalPages: query.data?.pagination.totalPages ?? 0,
  }
}

const ProjectsListTableShell = createListTableQueryShell<Project>(useProjectsListQuery)

export function ProjectsTable() {
  return (
    <ProjectsListTableShell
      name='projects'
      toolbar={{
        facetedFilterOptions: [
          {
            columnId: 'status',
            title: 'Status',
            options: projectStatuses,
          },
        ],
      }}
      columns={projectColumns}
      dataTableProps={{
        enableSorting: false,
      }}
    />
  )
}
