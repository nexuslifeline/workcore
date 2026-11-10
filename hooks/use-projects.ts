import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProject,
  createProjectTask,
  createProjectWorkLog,
  deleteProjectWorkLog,
  getProject,
  getProjects,
  updateProject,
  updateProjectTask,
  updateProjectWorkLog,
} from '@/services/client/projects/project-service'
import type {
  ProjectCreateInput,
  ProjectTaskCreateInput,
  ProjectTaskUpdateInput,
  ProjectUpdateInput,
  ProjectWorkLogInput,
} from '@/types/project'

export function useProjects(params?: {
  page?: number
  pageSize?: number
  search?: string
  filters?: Record<string, string | string[]>
}) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => getProjects(params),
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id),
    enabled: Boolean(id),
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProjectCreateInput) => createProject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useCreateProjectTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProjectTaskCreateInput) => createProjectTask(projectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateProjectTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: ProjectTaskUpdateInput }) =>
      updateProjectTask(projectId, taskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useCreateProjectWorkLog(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: ProjectWorkLogInput }) =>
      createProjectWorkLog(projectId, taskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateProjectWorkLog(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      taskId,
      workLogId,
      input,
    }: {
      taskId: string
      workLogId: string
      input: ProjectWorkLogInput
    }) => updateProjectWorkLog(projectId, taskId, workLogId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useDeleteProjectWorkLog(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, workLogId }: { taskId: string; workLogId: string }) =>
      deleteProjectWorkLog(projectId, taskId, workLogId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProjectUpdateInput }) =>
      updateProject(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.setQueryData(['project', data.project.id], data)
    },
  })
}
