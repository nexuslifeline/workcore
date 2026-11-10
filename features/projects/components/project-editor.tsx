'use client'

import { useState } from 'react'
import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { format } from 'date-fns'
import {
  AlignLeft,
  Banknote,
  Calendar,
  ChevronDown,
  CircleDot,
  Clock,
  Pencil,
  Plus,
  Trash2,
  UserPen,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/common/badges/status-badge'
import { Button } from '@/components/common/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/common/collapsible'
import { DeleteDialog } from '@/components/common/delete-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/common/dropdown-menu'
import { FallbackSection } from '@/components/common/fallback-section'
import { Skeleton } from '@/components/common/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/select'
import { SlidePanel } from '@/components/common/slide-panel'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common/table'
import {
  TwoPaneWorkspaceLayout,
  TwoPaneWorkspaceLeftColumn,
} from '@/components/common/two-pane-workspace'
import { useDeleteProjectWorkLog, useProject, useUpdateProject } from '@/hooks/use-projects'
import { cn } from '@/lib/utils'
import { toCurrency } from '@/lib/utils/currency'
import { useCurrencyStore } from '@/stores/currency-store'
import {
  PROJECT_STATUSES,
  type ProjectStatus,
  type ProjectTaskListItem,
  type ProjectWorkLogListItem,
} from '@/types/project'
import { projectStatuses, projectTaskStatuses } from '../data/data'
import { ProjectEditForm } from './project-edit-form'
import { ProjectTaskCreateForm } from './project-task-create-form'
import { ProjectTaskEditForm } from './project-task-edit-form'
import { ProjectWorkLogForm } from './project-work-log-form'

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'response' in error) {
    const message = (error as { response?: { data?: { error?: string } } }).response?.data?.error
    if (message) return message
  }
  return error instanceof Error ? error.message : fallback
}

function formatDateOnly(value: string | null) {
  if (!value) return '-'
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return '-'
  return format(new Date(year, month - 1, day), 'MMM dd, yyyy')
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return format(date, 'MMM dd, yyyy h:mm a')
}

function money(amount: number) {
  const { activeCurrency } = useCurrencyStore.getState()
  return toCurrency(amount, activeCurrency.code)
}

export function ProjectEditor({ projectId }: { projectId: string }) {
  const { data, isLoading, error } = useProject(projectId)
  const updateProject = useUpdateProject()
  const [editOpen, setEditOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)
  const project = data?.project
  const tasks = data?.tasks ?? []

  const planned = Number(project?.budget ?? 0)
  const spent = Number(project?.spent ?? 0)
  const balance = (Number.isFinite(planned) ? planned : 0) - spent

  const onStatusChange = async (status: ProjectStatus) => {
    if (!project || status === project.status) return
    try {
      await updateProject.mutateAsync({
        id: project.id,
        input: {
          code: project.code,
          name: project.name,
          description: project.description,
          startDate: project.startDate,
          dueDate: project.dueDate,
          budget: project.budget,
          status,
          supervisorEmployeeId: project.supervisorEmployeeId,
        },
      })
    } catch (submitError) {
      toast.error(errorMessage(submitError, 'Failed to update status'))
    }
  }

  return (
    <TwoPaneWorkspaceLayout
      title={project?.name || 'Project'}
      description={project ? `By ${project.createdByName?.trim() || 'Unknown'}` : undefined}
      backUrl='/projects'
      collapseSidebar={false}
      headerActions={
        <Button
          type='button'
          variant='outline'
          size='icon'
          aria-label='Edit project'
          disabled={!project}
          onClick={() => setEditOpen(true)}
        >
          <Pencil />
        </Button>
      }
    >
      <TwoPaneWorkspaceLeftColumn innerClassName='max-w-none'>
        {isLoading ? (
          <ProjectEditorSkeleton />
        ) : error || !project ? (
          <FallbackSection
            title='Project not found'
            message={error?.message || 'This project does not exist or you do not have access to it.'}
          />
        ) : (
          <div className='space-y-8'>
              <div className='flex flex-wrap items-stretch justify-between gap-y-4 rounded-lg border bg-card shadow-sm'>
                <div className='flex flex-col justify-center gap-1 px-5 py-3'>
                  <Select
                    value={project.status}
                    onValueChange={(value) => onStatusChange(value as ProjectStatus)}
                    disabled={updateProject.isPending}
                  >
                    <SelectTrigger className='h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0'>
                      <span className={cn('size-2 shrink-0 rounded-full', statusDotClass[project.status])} />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {projectStatuses.find((item) => item.value === status)?.label ?? status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className='text-[11px] font-medium tracking-wide text-muted-foreground uppercase'>
                    Current status
                  </p>
                </div>
                <div className='ml-auto flex items-stretch'>
                  <Metric
                    label='Planned'
                    value={money(Number.isFinite(planned) ? planned : 0)}
                    labelClassName='text-blue-600 dark:text-blue-400'
                  />
                  <Metric
                    label='Actual'
                    value={money(spent)}
                    valueClassName='text-emerald-600 dark:text-emerald-400'
                    labelClassName='text-emerald-600 dark:text-emerald-400'
                  />
                  <Metric
                    label='Budget balance'
                    value={money(balance)}
                    valueClassName={balance < 0 ? 'text-destructive' : undefined}
                    labelClassName='text-muted-foreground'
                  />
                  <Metric
                    label='Progress'
                    value={`${project.progress}%`}
                    labelClassName='text-muted-foreground'
                  />
                </div>
              </div>

              <button
                type='button'
                onClick={() => setTaskOpen(true)}
                className='flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-primary/5 px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10'
              >
                <Plus className='size-4' />
                Add task
              </button>

              <section className='space-y-3'>
                <h2 className='text-base font-semibold'>Tasks</h2>
                {tasks.length > 0 ? (
                  <div className='space-y-3'>
                    {tasks.map((task) => (
                      <TaskPanel key={task.id} projectId={project.id} task={task} />
                    ))}
                  </div>
                ) : null}
              </section>
          </div>
        )}
      </TwoPaneWorkspaceLeftColumn>
      {project && taskOpen ? (
        <SlidePanel
          open={taskOpen}
          onOpenChange={setTaskOpen}
          title='Add task'
          showDefaultActions={false}
          className='w-full sm:max-w-xl'
          contentClassName='flex flex-col overflow-hidden p-0 min-h-0'
        >
          <ProjectTaskCreateForm projectId={project.id} onClose={() => setTaskOpen(false)} />
        </SlidePanel>
      ) : null}
      {project && editOpen ? (
        <SlidePanel
          open={editOpen}
          onOpenChange={setEditOpen}
          title='Edit project'
          showDefaultActions={false}
          className='w-full sm:max-w-xl'
          contentClassName='flex flex-col overflow-hidden p-0 min-h-0'
        >
          <ProjectEditForm project={project} onClose={() => setEditOpen(false)} />
        </SlidePanel>
      ) : null}
    </TwoPaneWorkspaceLayout>
  )
}

const statusDotClass: Record<ProjectStatus, string> = {
  draft: 'bg-neutral-400',
  approved: 'bg-sky-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
}

function ProjectEditorSkeleton() {
  return (
    <div className='space-y-8'>
      <div className='flex flex-wrap items-stretch justify-between gap-y-4 rounded-lg border bg-card shadow-sm'>
        <div className='flex flex-col justify-center gap-2 px-5 py-3'>
          <Skeleton className='h-5 w-28' />
          <Skeleton className='h-3 w-24' />
        </div>
        <div className='ml-auto flex items-stretch'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className='flex min-w-36 flex-col items-end justify-center gap-2 border-l px-6 py-3'
            >
              <Skeleton className='h-6 w-24' />
              <Skeleton className='h-3 w-16' />
            </div>
          ))}
        </div>
      </div>
      <section className='space-y-3'>
        <Skeleton className='h-5 w-16' />
        <div className='space-y-3'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className='flex items-center gap-3 rounded-md border px-3 py-3'>
              <Skeleton className='size-4 shrink-0 rounded-sm' />
              <div className='space-y-2'>
                <Skeleton className='h-4 w-40' />
                <Skeleton className='h-3 w-64' />
              </div>
              <Skeleton className='ms-auto h-5 w-20 rounded-full' />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function TaskPanel({ projectId, task }: { projectId: string; task: ProjectTaskListItem }) {
  const description = task.description?.trim()
  const deleteWorkLog = useDeleteProjectWorkLog(projectId)
  const [taskEditOpen, setTaskEditOpen] = useState(false)
  const [workLogOpen, setWorkLogOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<ProjectWorkLogListItem | null>(null)
  const [deletingLog, setDeletingLog] = useState<ProjectWorkLogListItem | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const openCreate = () => {
    setEditingLog(null)
    setWorkLogOpen(true)
  }

  const openEdit = (log: ProjectWorkLogListItem) => {
    setEditingLog(log)
    setWorkLogOpen(true)
  }

  return (
    <Collapsible className='group/task overflow-hidden rounded-md border bg-card'>
      <CollapsibleTrigger className='flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-muted/40'>
        <ChevronDown className='mt-0.5 size-4 shrink-0 self-start text-muted-foreground transition-transform group-data-[state=closed]/task:-rotate-90' />
        <span className='min-w-0 flex-1'>
          <span className='block truncate font-medium'>{task.name}</span>
          {description ? (
            <span className='mt-0.5 block truncate text-muted-foreground group-data-[state=open]/task:hidden'>
              {description}
            </span>
          ) : null}
        </span>
        <span className='shrink-0 group-data-[state=open]/task:hidden'>
          <StatusBadge value={task.status} statusConfigs={projectTaskStatuses} />
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className='bg-muted'>
        <TaskDetails
          task={task}
          onEditTask={() => setTaskEditOpen(true)}
          onAddWorkLog={openCreate}
          onEditWorkLog={openEdit}
          onDeleteWorkLog={(log) => {
            setDeletingLog(log)
            setDeleteOpen(true)
          }}
        />
      </CollapsibleContent>
      {taskEditOpen ? (
        <SlidePanel
          open={taskEditOpen}
          onOpenChange={setTaskEditOpen}
          title='Edit task'
          showDefaultActions={false}
          className='w-full sm:max-w-xl'
          contentClassName='flex flex-col overflow-hidden p-0 min-h-0'
        >
          <ProjectTaskEditForm
            projectId={projectId}
            task={task}
            onClose={() => setTaskEditOpen(false)}
          />
        </SlidePanel>
      ) : null}
      {workLogOpen ? (
        <SlidePanel
          open={workLogOpen}
          onOpenChange={setWorkLogOpen}
          title={editingLog ? 'Edit work log' : 'Add work log'}
          showDefaultActions={false}
          className='w-full sm:max-w-xl'
          contentClassName='flex flex-col overflow-hidden p-0 min-h-0'
        >
          <ProjectWorkLogForm
            key={editingLog?.id ?? 'new'}
            projectId={projectId}
            taskId={task.id}
            workLog={editingLog}
            onClose={() => setWorkLogOpen(false)}
          />
        </SlidePanel>
      ) : null}
      {deletingLog ? (
        <DeleteDialog
          open={deleteOpen}
          onOpenChange={(open) => {
            setDeleteOpen(open)
            if (!open) {
              setTimeout(() => setDeletingLog(null), 500)
            }
          }}
          id={deletingLog.id}
          displayName={deletingLog.employeeName || 'this work log'}
          entityName='Work log'
          entityNameLower='work log'
          onDelete={async (id) => {
            await deleteWorkLog.mutateAsync({ taskId: task.id, workLogId: id })
          }}
        />
      ) : null}
    </Collapsible>
  )
}

function TaskDetails({
  task,
  onEditTask,
  onAddWorkLog,
  onEditWorkLog,
  onDeleteWorkLog,
}: {
  task: ProjectTaskListItem
  onEditTask: () => void
  onAddWorkLog: () => void
  onEditWorkLog: (log: ProjectWorkLogListItem) => void
  onDeleteWorkLog: (log: ProjectWorkLogListItem) => void
}) {
  const description = task.description?.trim()
  return (
    <div className='space-y-4 px-3 py-3'>
      <TaskSection title='Details'>
        <dl className='grid grid-cols-1 text-sm sm:grid-cols-2'>
          <DetailItem
            icon={CircleDot}
            label='Status'
            action={
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-8 shrink-0 text-muted-foreground'
                aria-label='Edit task'
                onClick={onEditTask}
              >
                <Pencil />
              </Button>
            }
          >
            <StatusBadge value={task.status} statusConfigs={projectTaskStatuses} />
          </DetailItem>
          <DetailItem icon={Calendar} label='Due date'>
            {formatDateOnly(task.plannedEndDate)}
          </DetailItem>
          <DetailItem icon={Wallet} label='Budget'>
            {money(Number(task.budget))}
          </DetailItem>
          <DetailItem icon={Calendar} label='Start date'>
            {formatDateOnly(task.plannedStartDate)}
          </DetailItem>
          <DetailItem icon={Clock} label='Estimated hours'>
            {task.estimatedHours}
          </DetailItem>
          <DetailItem icon={Clock} label='Labor hours'>
            {task.laborHours}
          </DetailItem>
          <DetailItem icon={Banknote} label='Labor spent'>
            {money(Number(task.laborSpent))}
          </DetailItem>
          {description ? (
            <DetailItem icon={AlignLeft} label='Description' className='border-e sm:col-span-2'>
              {description}
            </DetailItem>
          ) : null}
        </dl>
      </TaskSection>
      <TaskSection title='Work logs'>
        <WorkLogTable
          logs={task.workLogs}
          onAdd={onAddWorkLog}
          onEdit={onEditWorkLog}
          onDelete={onDeleteWorkLog}
        />
      </TaskSection>
    </div>
  )
}

function TaskSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Collapsible defaultOpen className='group/section'>
      <CollapsibleTrigger className='flex w-full items-center justify-between gap-3 py-2 text-left'>
        <span className='text-sm font-medium'>{title}</span>
        <ChevronDown className='size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=closed]/section:-rotate-90' />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className='overflow-hidden border bg-card'>{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function DetailItem({
  icon: Icon,
  label,
  children,
  action,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-3 border-b px-4 py-3 sm:odd:border-e', className)}>
      <Icon className='size-4 shrink-0 text-muted-foreground' />
      <dt className='w-32 shrink-0 text-muted-foreground'>{label}</dt>
      <dd className='min-w-0 flex-1 font-medium'>{children}</dd>
      {action}
    </div>
  )
}

function WorkLogRowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 shrink-0 p-0 data-[state=open]:bg-muted'
        >
          <DotsVerticalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem onClick={onEdit}>
          <UserPen className='mr-2 h-4 w-4 flex-shrink-0' />
          <span className='flex-1'>Edit</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant='destructive' className='text-red-500!' onClick={onDelete}>
          <Trash2 className='mr-2 h-4 w-4 flex-shrink-0' />
          <span className='flex-1'>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function WorkLogTable({
  logs,
  onAdd,
  onEdit,
  onDelete,
}: {
  logs: ProjectWorkLogListItem[]
  onAdd: () => void
  onEdit: (log: ProjectWorkLogListItem) => void
  onDelete: (log: ProjectWorkLogListItem) => void
}) {
  const totalHours = logs.reduce((sum, log) => sum + Number(log.totalHours || 0), 0)
  const totalAmount = logs.reduce((sum, log) => sum + Number(log.totalAmount || 0), 0)

  return (
    <div>
      <Table className='[&_td]:px-4 [&_td]:py-3 [&_th]:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_10%)] [&_th]:px-4 [&_th]:py-3 dark:[&_th]:bg-[color-mix(in_oklch,var(--card),var(--muted)_45%)]'>
        <TableHeader>
          <TableRow className='hover:bg-transparent'>
            <TableHead>Employee</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className='text-right'>Rate</TableHead>
            <TableHead className='text-right'>Hours</TableHead>
            <TableHead className='text-right'>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className='text-muted-foreground'>
                No work logs
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className='flex w-full items-center gap-2'>
                    <span className='min-w-0 flex-1'>{log.employeeName}</span>
                    <WorkLogRowActions onEdit={() => onEdit(log)} onDelete={() => onDelete(log)} />
                  </div>
                </TableCell>
                <TableCell>{formatDateTime(log.startDatetime)}</TableCell>
                <TableCell>{formatDateTime(log.endDatetime)}</TableCell>
                <TableCell className='whitespace-normal'>{log.notes || '-'}</TableCell>
                <TableCell className='text-right tabular-nums'>{money(Number(log.hourlyRate))}</TableCell>
                <TableCell className='text-right tabular-nums'>{log.totalHours}</TableCell>
                <TableCell className='text-right tabular-nums'>{money(Number(log.totalAmount))}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        <TableFooter className='bg-transparent'>
          {logs.length > 0 ? (
            <TableRow>
              <TableCell colSpan={4} className='text-right'>
                Total
              </TableCell>
              <TableCell />
              <TableCell className='text-right tabular-nums'>{totalHours.toFixed(2)}</TableCell>
              <TableCell className='text-right tabular-nums'>{money(totalAmount)}</TableCell>
            </TableRow>
          ) : null}
          <TableRow className='hover:bg-transparent'>
            <TableCell colSpan={7} className='!p-0'>
              <button
                type='button'
                onClick={onAdd}
                className='flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/5'
              >
                <Plus className='size-4' />
                Add work log
              </button>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}

function Metric({
  label,
  value,
  valueClassName,
  labelClassName,
}: {
  label: string
  value: string
  valueClassName?: string
  labelClassName?: string
}) {
  return (
    <div className='flex min-w-36 flex-col items-end justify-center border-l px-6 py-3 text-right'>
      <p className={cn('text-lg font-semibold tabular-nums tracking-tight', valueClassName)}>{value}</p>
      <p className={cn('mt-1 text-[11px] font-medium tracking-wide uppercase', labelClassName)}>{label}</p>
    </div>
  )
}
