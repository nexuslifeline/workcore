import { api } from '@/lib/api'
import type {
  Project,
  ProjectCreateInput,
  ProjectTaskCreateInput,
  ProjectTaskListItem,
  ProjectUpdateInput,
  ProjectWorkLogInput,
  ProjectWorkLogListItem,
} from '@/types/project'

type ListResponse = {
  projects: Project[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

type ProjectResponse = {
  project: Project
  tasks: ProjectTaskListItem[]
}

export async function getProjects(params?: {
  page?: number
  pageSize?: number
  search?: string
  filters?: Record<string, string | string[]>
}): Promise<ListResponse> {
  const searchParams = new URLSearchParams()
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  if (page > 1) searchParams.set('page', String(page))
  if (pageSize !== 10) searchParams.set('pageSize', String(pageSize))
  if (params?.search) searchParams.set('search', params.search)
  const status = params?.filters?.status
  const statusValues = Array.isArray(status) ? status : status ? [status] : []
  statusValues.filter(Boolean).forEach((value) => searchParams.append('status', value))
  const query = searchParams.toString()
  const { data } = await api.get<ListResponse>(query ? `/projects?${query}` : '/projects')
  return data
}

export async function getProject(id: string): Promise<ProjectResponse> {
  const { data } = await api.get<ProjectResponse>(`/projects/${id}`)
  return data
}

export async function createProject(input: ProjectCreateInput): Promise<Project> {
  const { data } = await api.post<{ project: Project }>('/projects', input, {
    skipErrorToast: true,
  })
  return data.project
}

export async function createProjectTask(
  projectId: string,
  input: ProjectTaskCreateInput
): Promise<ProjectTaskListItem> {
  const { data } = await api.post<{ task: ProjectTaskListItem }>(
    `/projects/${projectId}/tasks`,
    input,
    { skipErrorToast: true }
  )
  return data.task
}

export async function createProjectWorkLog(
  projectId: string,
  taskId: string,
  input: ProjectWorkLogInput
): Promise<ProjectWorkLogListItem> {
  const { data } = await api.post<{ workLog: ProjectWorkLogListItem }>(
    `/projects/${projectId}/tasks/${taskId}/work-logs`,
    input,
    { skipErrorToast: true }
  )
  return data.workLog
}

export async function updateProjectWorkLog(
  projectId: string,
  taskId: string,
  workLogId: string,
  input: ProjectWorkLogInput
): Promise<ProjectWorkLogListItem> {
  const { data } = await api.patch<{ workLog: ProjectWorkLogListItem }>(
    `/projects/${projectId}/tasks/${taskId}/work-logs/${workLogId}`,
    input,
    { skipErrorToast: true }
  )
  return data.workLog
}

export async function updateProject(id: string, input: ProjectUpdateInput): Promise<ProjectResponse> {
  const { data } = await api.patch<ProjectResponse>(`/projects/${id}`, input, {
    skipErrorToast: true,
  })
  return data
}
