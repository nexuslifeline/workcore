import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createOrganization,
  updateOrganization,
} from '@/services/client/organizations/organization-service'
import type { Organization } from '@/types/organization'

export function useCreateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    },
  })
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Organization> }) =>
      updateOrganization(id, data),
    onSuccess: (updatedOrganization, variables) => {
      // Update the specific organization query cache
      queryClient.setQueryData(['organization', variables.id], updatedOrganization)
      
      // Update the organization in all list queries
      queryClient.setQueriesData<{ organizations: Organization[]; pagination?: any }>(
        { queryKey: ['organizations'] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            organizations: old.organizations.map((org) =>
              org.id === variables.id ? updatedOrganization : org
            ),
          }
        }
      )
      
      // Force refetch all organization queries to ensure UI updates
      queryClient.invalidateQueries({ 
        queryKey: ['organizations'],
        refetchType: 'active' // Only refetch active queries
      })
      queryClient.invalidateQueries({ 
        queryKey: ['organization', variables.id],
        refetchType: 'active'
      })
    },
  })
}



