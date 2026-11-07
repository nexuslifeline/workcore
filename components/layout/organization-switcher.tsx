'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  ChevronsUpDown,
  Plus,
  Building2,
  MoreVertical,
  Settings,
  Users,
  Loader2,
  Search,
  AlertCircle,
  Landmark,
  FileText,
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/common/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/common/sidebar'
import { Avatar } from '@/components/common/avatar'
import { OrganizationSkeleton } from '@/components/common/skeletons'
import { Button } from '@/components/common/button'
import { Input } from '@/components/common/input'
import { cn } from '@/lib/utils'
import { useOrganizations } from '@/hooks/use-organizations'
import { useOrganizationStore, useActiveOrganization } from '@/stores/organization-store'
import { AddOrganizationDialog } from './add-organization-dialog'
import type { Organization } from '@/types/organization'

function organizationRoleLabel(org: Organization) {
  return org.currentUserRole?.trim() || null
}

export function OrganizationSwitcher() {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const { activeOrganizationId, setActiveOrganizationId } = useOrganizationStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [loadedPages, setLoadedPages] = useState<number[]>([1]) // Start with page 1
  const [accumulatedOrganizations, setAccumulatedOrganizations] = useState<Organization[]>([])

  // Fetch current page (always fetch the latest page we're loading)
  const currentPage = Math.max(...loadedPages)
  const { data: currentPageData, isLoading: isLoadingCurrentPage } = useOrganizations({
    page: currentPage,
    pageSize: 10, // Same as organization list default
  })

  // Accumulate organizations from all loaded pages and update existing ones
  useEffect(() => {
    if (currentPageData?.organizations) {
      setAccumulatedOrganizations((prev) => {
        // Create a map of existing organizations for quick lookup
        const existingMap = new Map(prev.map((org) => [org.id, org]))
        
        // Process organizations from current page data
        const updated: Organization[] = []
        const processedIds = new Set<string>()
        
        // First, update existing organizations and add new ones from current page
        currentPageData.organizations.forEach((org) => {
          processedIds.add(org.id)
          updated.push(org) // Use the latest data from query
        })
        
        // Then, add any existing organizations that weren't in the current page
        prev.forEach((org) => {
          if (!processedIds.has(org.id)) {
            updated.push(org)
          }
        })
        
        return updated
      })
    }
  }, [currentPageData])

  // Get all organizations (accumulated from all loaded pages)
  const organizations = accumulatedOrganizations

  // Client-side search over accumulated organizations
  const filteredOrganizations = organizations.filter((org) => {
    if (!search.trim()) return true
    const term = search.toLowerCase()
    const name = org.name?.toLowerCase() ?? ''
    const role = org.currentUserRole?.toLowerCase() ?? ''
    return name.includes(term) || role.includes(term)
  })

  // Find active organization from accumulated list
  const activeOrganization = useActiveOrganization(organizations)

  // Check if there are more pages to load
  const hasMorePages =
    currentPageData?.pagination &&
    currentPageData.pagination.page < currentPageData.pagination.totalPages

  // Default active org is set by OrganizationProvider / useEnsureActiveOrganization

  // Handle "Load More" click
  const handleLoadMore = () => {
    if (currentPageData?.pagination) {
      const nextPage = currentPageData.pagination.page + 1
      setLoadedPages((prev) => [...prev, nextPage])
    }
  }

  const isLoading = isLoadingCurrentPage && loadedPages.length === 1

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <OrganizationSkeleton />
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (!activeOrganization) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg'>
            <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
              <Building2 className='size-4' />
            </div>
            <div className='grid flex-1 text-start text-sm leading-tight'>
              <span className='truncate font-semibold'>No Organization</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const activeRoleLabel = organizationRoleLabel(activeOrganization)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              aria-label='Organization switcher'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar
                src={activeOrganization.logoUrl}
                name={activeOrganization.name}
                size={32}
                square
              />
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {activeOrganization.name}
                </span>
                {activeRoleLabel ? (
                  <span className='truncate text-xs text-muted-foreground'>
                    {activeRoleLabel}
                  </span>
                ) : null}
              </div>
              <ChevronsUpDown className='ms-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-72 rounded-lg p-0'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <div className='py-0.5 px-2 border-b mb-1'>
              <div className='relative'>
                <Search className='absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground' />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Search organizations...'
                  className='h-8 pl-7 text-xs border-none shadow-none focus-visible:ring-0 focus-visible:outline-none'
                />
              </div>
            </div>
            {!isLoadingCurrentPage && filteredOrganizations.length === 0 && search.trim().length > 0 && (
              <div className='px-4 py-6 text-xs text-muted-foreground flex flex-col items-center justify-center gap-2 text-center'>
                <AlertCircle className='h-4 w-4 text-muted-foreground' />
                <span>No organizations found. Try a different name.</span>
              </div>
            )}
            {filteredOrganizations.map((org, index) => {
              const isActive = org.id === activeOrganizationId
              const isLast = index === filteredOrganizations.length - 1
              const roleLabel = organizationRoleLabel(org)

              return (
                <div
                  key={org.id}
                  className={cn(
                    'group/item relative mx-2',
                    !isLast && 'border-b border-border/50'
                  )}
                >
                  <DropdownMenuItem
                    onClick={() => {
                      if (org.id === activeOrganizationId) return
                      setActiveOrganizationId(org.id)
                      router.refresh()
                    }}
                    className={cn(
                      'gap-2 py-1 px-2 pr-12 transition-colors',
                      isActive && 'bg-green-500/10 border border-green-500',
                      'hover:bg-accent/30'
                    )}
                  >
                    <Avatar
                      src={org.logoUrl}
                      name={org.name}
                      size={28}
                      square
                    />
                    <div className='flex flex-1 flex-col min-w-0'>
                      <span className='truncate'>{org.name}</span>
                      {roleLabel ? (
                        <span className='truncate text-xs text-muted-foreground'>
                          {roleLabel}
                        </span>
                      ) : null}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type='button'
                        className='absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 flex items-center justify-center rounded-sm hover:bg-accent focus:bg-accent outline-hidden transition-colors'
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`More options for ${org.name}`}
                      >
                        <MoreVertical className='size-4' />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' sideOffset={4}>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/organizations/${org.id}/edit`)
                        }}
                      >
                        <Settings className='size-4' />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/organizations/${org.id}/edit?tab=tax`)
                        }}
                      >
                        <Landmark className='size-4' />
                        Tax Configuration
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/organizations/${org.id}/edit?tab=registration`)
                        }}
                      >
                        <FileText className='size-4' />
                        Business Registration
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/organizations/${org.id}/members`)
                        }}
                      >
                        <Users className='size-4' />
                        Members
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
            {hasMorePages && (
              <>
                <DropdownMenuSeparator />
                <div className='p-1 mx-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-center'
                    onClick={handleLoadMore}
                    disabled={isLoadingCurrentPage}
                  >
                    {isLoadingCurrentPage ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Loading...
                      </>
                    ) : (
                      `Load More${
                        currentPageData?.pagination
                          ? ` (${currentPageData.pagination.totalPages - currentPageData.pagination.page} more)`
                          : ''
                      }`
                    )}
                  </Button>
                </div>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='gap-2 p-2'
              onClick={() => setIsAddDialogOpen(true)}
            >
              <div className='flex size-6 items-center justify-center rounded-md border bg-background text-foreground'>
                <Plus className='size-4' />
              </div>
              <div className='font-medium text-foreground'>Add organization</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <AddOrganizationDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </SidebarMenu>
  )
}

