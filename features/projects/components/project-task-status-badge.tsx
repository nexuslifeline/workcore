'use client'

import { useState } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/common/badges/status-badge'
import { Badge } from '@/components/common/badges/badge'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/common/dropdown-menu'
import { useUpdateProjectTaskStatus } from '@/hooks/use-projects'
import { cn } from '@/lib/utils'
import { PROJECT_TASK_STATUS_TRANSITIONS, type ProjectTaskStatus } from '@/types/project'
import { projectTaskStatuses } from '../data/data'

type ProjectTaskStatusBadgeProps = {
  projectId: string
  taskId: string
  status: ProjectTaskStatus
  align?: 'start' | 'end'
}

function statusConfig(status: ProjectTaskStatus) {
  return projectTaskStatuses.find((item) => item.value === status) ?? projectTaskStatuses[0]
}

function transitionLabel(current: ProjectTaskStatus, next: ProjectTaskStatus) {
  if (current === 'paused' && next === 'in_progress') return 'Resume'
  return statusConfig(next).label
}

function statusChangeCopy(status: ProjectTaskStatus) {
  if (status === 'completed') {
    return {
      title: 'Mark this task completed?',
      desc: 'Completed tasks cannot be changed.',
      confirmText: 'Mark completed',
      destructive: false,
    }
  }
  if (status === 'cancelled') {
    return {
      title: 'Cancel this task?',
      desc: 'Cancelled tasks cannot be changed.',
      confirmText: 'Cancel task',
      destructive: true,
    }
  }
  return null
}

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'response' in error) {
    const message = (error as { response?: { data?: { error?: string } } }).response?.data?.error
    if (message) return message
  }
  return error instanceof Error ? error.message : fallback
}

export function ProjectTaskStatusBadge({
  projectId,
  taskId,
  status,
  align = 'start',
}: ProjectTaskStatusBadgeProps) {
  const updateStatus = useUpdateProjectTaskStatus(projectId)
  const [open, setOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<ProjectTaskStatus | null>(null)
  const current = statusConfig(status)
  const StatusIcon = current.icon
  const availableTransitions = PROJECT_TASK_STATUS_TRANSITIONS[status] ?? []
  const isUpdating = updateStatus.isPending

  const handleStatusChange = async (next: ProjectTaskStatus) => {
    if (next === status || isUpdating) return
    try {
      await updateStatus.mutateAsync({ taskId, status: next })
      toast.success(`Task status updated to ${statusConfig(next).label}`)
      setOpen(false)
      setPendingStatus(null)
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to update task status'))
    }
  }

  const requestStatusChange = (next: ProjectTaskStatus) => {
    if (statusChangeCopy(next)) {
      setOpen(false)
      setPendingStatus(next)
      return
    }
    void handleStatusChange(next)
  }

  const confirmCopy = pendingStatus ? statusChangeCopy(pendingStatus) : null

  if (availableTransitions.length === 0) {
    return (
      <StatusBadge
        value={status}
        statusConfig={{
          value: status,
          label: current.label,
          colorClasses: current.colorClasses,
          icon: current.icon,
        }}
        variant='outline'
        capitalize={false}
      />
    )
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            disabled={isUpdating}
            className={cn(
              'inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50'
            )}
            aria-haspopup='menu'
            aria-expanded={open}
            onClick={(event) => event.stopPropagation()}
          >
            <Badge
              variant='outline'
              className={cn(
                'max-w-full min-w-0 gap-1 transition-all hover:scale-[1.02] hover:shadow-sm',
                current.colorClasses,
                isUpdating && 'opacity-70'
              )}
            >
              {isUpdating ? (
                <Loader2 className='size-3 shrink-0 animate-spin' />
              ) : (
                <>
                  {StatusIcon ? <StatusIcon className='size-3 shrink-0' aria-hidden /> : null}
                  <span className='truncate font-medium'>{current.label}</span>
                  <ChevronDown className='size-3 shrink-0 opacity-50' aria-hidden />
                </>
              )}
            </Badge>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          className='w-48'
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <DropdownMenuItem
            disabled
            className='cursor-default opacity-100 focus:bg-transparent data-highlighted:bg-transparent'
            onSelect={(event) => event.preventDefault()}
          >
            <div className='flex w-full min-w-0 items-center gap-2'>
              {StatusIcon ? <StatusIcon className='size-4 shrink-0' aria-hidden /> : null}
              <span className='min-w-0 font-medium'>{current.label}</span>
              <span className='ms-auto shrink-0 text-xs text-muted-foreground'>(current)</span>
            </div>
          </DropdownMenuItem>
          <div className='my-1 h-px bg-border' />
          {availableTransitions.map((next) => {
            const nextConfig = statusConfig(next)
            const NextIcon = nextConfig.icon
            return (
              <DropdownMenuItem
                key={next}
                disabled={isUpdating}
                className='cursor-pointer'
                onSelect={() => {
                  requestStatusChange(next)
                }}
              >
                {NextIcon ? <NextIcon className='size-4 shrink-0' aria-hidden /> : null}
                <span className='font-medium'>{transitionLabel(status, next)}</span>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={pendingStatus !== null}
        title={confirmCopy?.title ?? ''}
        desc={confirmCopy?.desc ?? ''}
        confirmText={confirmCopy?.confirmText}
        destructive={confirmCopy?.destructive}
        isLoading={isUpdating}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !isUpdating) setPendingStatus(null)
        }}
        handleConfirm={() => {
          if (pendingStatus) void handleStatusChange(pendingStatus)
        }}
      />
    </>
  )
}
