import { and, asc, count, desc, eq, ilike, inArray, ne, or, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import {
  employees,
  profiles,
  projectExpenses,
  projectTasks,
  projectWorkLogs,
  projects,
} from '@/db/schema'
import { db } from '@/lib/db'
import {
  PROJECT_STATUSES,
  PROJECT_TASK_STATUSES,
  type Project,
  type ProjectCreateInput,
  type ProjectStatus,
  type ProjectTaskCreateInput,
  type ProjectTaskListItem,
  type ProjectTaskStatus,
  type ProjectTaskUpdateInput,
  type ProjectUpdateInput,
  type ProjectWorkLogInput,
  type ProjectWorkLogListItem,
} from '@/types/project'

export class ProjectCodeConflictError extends Error {
  constructor() {
    super('A project with this code already exists in the organization')
    this.name = 'ProjectCodeConflictError'
  }
}

export class ProjectSupervisorError extends Error {
  constructor() {
    super('Supervisor must be an active employee in this organization')
    this.name = 'ProjectSupervisorError'
  }
}

export class ProjectWorkLogEmployeeError extends Error {
  constructor() {
    super('Employee must be an active employee in this organization')
    this.name = 'ProjectWorkLogEmployeeError'
  }
}

function blankToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? ''
  return trimmed === '' ? null : trimmed
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const code = 'code' in error ? String((error as { code?: unknown }).code) : ''
  return code === '23505'
}

const supervisor = alias(employees, 'project_supervisor')

function toMoney(value: unknown): string {
  const num = Number(value ?? 0)
  if (Number.isNaN(num)) return '0.00'
  return num.toFixed(2)
}

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value
}

function progressPercent(completed: unknown, active: unknown): number {
  const activeCount = Number(active ?? 0)
  const completedCount = Number(completed ?? 0)
  if (!activeCount) return 0
  return Math.round((completedCount / activeCount) * 100)
}

function parseDate(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error('Dates must use YYYY-MM-DD')
  }
  return trimmed
}

function parseBudget(value: string): string {
  return parseAmount(value, 'Budget')
}

function parseAmount(value: string, label: string): string {
  const num = Number(value)
  if (!Number.isFinite(num) || num < 0) {
    throw new Error(`${label} must be zero or more`)
  }
  return num.toFixed(2)
}

function parseTaskStatus(value: string): ProjectTaskStatus {
  if (!PROJECT_TASK_STATUSES.includes(value as ProjectTaskStatus)) {
    throw new Error('Status is not valid')
  }
  return value as ProjectTaskStatus
}

function parseTimestamp(value: string | null | undefined, label: string): Date {
  const trimmed = value?.trim() ?? ''
  const date = new Date(trimmed)
  if (!trimmed || Number.isNaN(date.getTime())) {
    throw new Error(`${label} is not valid`)
  }
  return date
}

function parseHourlyRate(value: string): string {
  const num = Number(value)
  if (!Number.isFinite(num) || num < 0) {
    throw new Error('Hourly rate must be zero or more')
  }
  return num.toFixed(2)
}

function laborByProject() {
  return db
    .select({
      projectId: projectWorkLogs.projectId,
      laborHours: sql<string>`coalesce(sum(${projectWorkLogs.totalHours}), 0)`.as('labor_hours'),
      laborSpent: sql<string>`coalesce(sum(${projectWorkLogs.totalAmount}), 0)`.as('labor_spent'),
    })
    .from(projectWorkLogs)
    .groupBy(projectWorkLogs.projectId)
    .as('project_labor')
}

function expenseByProject() {
  return db
    .select({
      projectId: projectExpenses.projectId,
      expenseSpent: sql<string>`coalesce(sum(${projectExpenses.amount}), 0)`.as('expense_spent'),
    })
    .from(projectExpenses)
    .groupBy(projectExpenses.projectId)
    .as('project_expense_spend')
}

function taskProgressByProject() {
  return db
    .select({
      projectId: projectTasks.projectId,
      activeTasks:
        sql<string>`count(*) filter (where ${projectTasks.status} <> 'cancelled')`.as(
          'active_tasks'
        ),
      completedTasks:
        sql<string>`count(*) filter (where ${projectTasks.status} = 'completed')`.as(
          'completed_tasks'
        ),
    })
    .from(projectTasks)
    .groupBy(projectTasks.projectId)
    .as('task_progress')
}

function laborByTask() {
  return db
    .select({
      projectTaskId: projectWorkLogs.projectTaskId,
      laborHours: sql<string>`coalesce(sum(${projectWorkLogs.totalHours}), 0)`.as(
        'task_labor_hours'
      ),
      laborSpent: sql<string>`coalesce(sum(${projectWorkLogs.totalAmount}), 0)`.as(
        'task_labor_spent'
      ),
    })
    .from(projectWorkLogs)
    .groupBy(projectWorkLogs.projectTaskId)
    .as('task_labor')
}

type ProjectRollupRow = {
  id: string
  organizationId: string
  code: string
  name: string
  description: string | null
  startDate: string | null
  dueDate: string | null
  budget: string
  status: ProjectStatus
  completedAt: Date | null
  createdBy: string | null
  createdByName: string | null
  updatedBy: string | null
  supervisorEmployeeId: string
  supervisorName: string | null
  supervisorCode: string | null
  supervisorImageUrl: string | null
  createdAt: Date
  updatedAt: Date
  laborHours: string
  laborSpent: string
  expenseSpent: string
  activeTasks: string | null
  completedTasks: string | null
}

function toProject(row: ProjectRollupRow): Project {
  const laborSpent = toMoney(row.laborSpent)
  const expenseSpent = toMoney(row.expenseSpent)
  const spent = toMoney(Number(laborSpent) + Number(expenseSpent))
  const balance = toMoney(Number(row.budget) - Number(spent))
  return {
    id: row.id,
    organizationId: row.organizationId,
    code: row.code,
    name: row.name,
    description: row.description,
    startDate: row.startDate,
    dueDate: row.dueDate,
    budget: toMoney(row.budget),
    status: row.status,
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    createdBy: row.createdBy,
    createdByName: row.createdByName,
    updatedBy: row.updatedBy,
    supervisorEmployeeId: row.supervisorEmployeeId,
    supervisorName: row.supervisorName,
    supervisorCode: row.supervisorCode,
    supervisorImageUrl: row.supervisorImageUrl,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    laborHours: toMoney(row.laborHours),
    laborSpent,
    expenseSpent,
    spent,
    balance,
    progress: progressPercent(row.completedTasks, row.activeTasks),
  }
}

const projectSelect = {
  id: projects.id,
  organizationId: projects.organizationId,
  code: projects.code,
  name: projects.name,
  description: projects.description,
  startDate: projects.startDate,
  dueDate: projects.dueDate,
  budget: projects.budget,
  status: projects.status,
  completedAt: projects.completedAt,
  createdBy: projects.createdBy,
  createdByName: profiles.name,
  updatedBy: projects.updatedBy,
  supervisorEmployeeId: projects.supervisorEmployeeId,
  supervisorName: supervisor.name,
  supervisorCode: supervisor.code,
  supervisorImageUrl: supervisor.imageUrl,
  createdAt: projects.createdAt,
  updatedAt: projects.updatedAt,
}

export async function projectCodeExists(params: {
  organizationId: string
  code: string
  excludeId?: string
}): Promise<boolean> {
  const conditions = [
    eq(projects.organizationId, params.organizationId),
    eq(sql`lower(${projects.code})`, params.code.trim().toLowerCase()),
  ]
  if (params.excludeId) {
    conditions.push(ne(projects.id, params.excludeId))
  }
  const [row] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(...conditions))
    .limit(1)
  return Boolean(row)
}

async function assertActiveSupervisor(organizationId: string, employeeId: string) {
  const [row] = await db
    .select({ id: employees.id })
    .from(employees)
    .where(
      and(
        eq(employees.id, employeeId),
        eq(employees.organizationId, organizationId),
        eq(employees.status, 'active')
      )
    )
    .limit(1)
  if (!row) throw new ProjectSupervisorError()
}

export async function listProjects(params: {
  organizationId: string
  page: number
  pageSize: number
  skip: number
  search?: string
  status?: string[]
}) {
  const conditions = [eq(projects.organizationId, params.organizationId)]
  if (params.search) {
    const term = `%${params.search}%`
    conditions.push(or(ilike(projects.name, term), ilike(projects.code, term))!)
  }
  const statuses = (params.status ?? []).filter((status): status is ProjectStatus =>
    PROJECT_STATUSES.includes(status as ProjectStatus)
  )
  if (statuses.length > 0) {
    conditions.push(inArray(projects.status, statuses))
  }
  const whereClause = and(...conditions)
  const labor = laborByProject()
  const expenses = expenseByProject()
  const progress = taskProgressByProject()

  const [rows, totalResult] = await Promise.all([
    db
      .select({
        ...projectSelect,
        laborHours: sql<string>`coalesce(${labor.laborHours}, 0)`,
        laborSpent: sql<string>`coalesce(${labor.laborSpent}, 0)`,
        expenseSpent: sql<string>`coalesce(${expenses.expenseSpent}, 0)`,
        activeTasks: progress.activeTasks,
        completedTasks: progress.completedTasks,
      })
      .from(projects)
      .leftJoin(profiles, eq(profiles.id, projects.createdBy))
      .leftJoin(supervisor, eq(supervisor.id, projects.supervisorEmployeeId))
      .leftJoin(labor, eq(labor.projectId, projects.id))
      .leftJoin(expenses, eq(expenses.projectId, projects.id))
      .leftJoin(progress, eq(progress.projectId, projects.id))
      .where(whereClause)
      .orderBy(desc(projects.updatedAt))
      .limit(params.pageSize)
      .offset(params.skip),
    db.select({ count: count() }).from(projects).where(whereClause),
  ])

  return {
    projects: rows.map((row) => toProject(row)),
    total: totalResult[0]?.count ?? 0,
  }
}

export async function listProjectTasks(
  organizationId: string,
  projectId: string
): Promise<ProjectTaskListItem[] | null> {
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.organizationId, organizationId)))
    .limit(1)
  if (!project) return null

  const labor = laborByTask()
  const [rows, logs] = await Promise.all([
    db
      .select({
        id: projectTasks.id,
        projectId: projectTasks.projectId,
        name: projectTasks.name,
        description: projectTasks.description,
        budget: projectTasks.budget,
        estimatedHours: projectTasks.estimatedHours,
        plannedStartDate: projectTasks.plannedStartDate,
        plannedEndDate: projectTasks.plannedEndDate,
        status: projectTasks.status,
        laborHours: sql<string>`coalesce(${labor.laborHours}, 0)`,
        laborSpent: sql<string>`coalesce(${labor.laborSpent}, 0)`,
      })
      .from(projectTasks)
      .leftJoin(labor, eq(labor.projectTaskId, projectTasks.id))
      .where(eq(projectTasks.projectId, projectId))
      .orderBy(desc(projectTasks.createdAt)),
    db
      .select({
        id: projectWorkLogs.id,
        projectTaskId: projectWorkLogs.projectTaskId,
        employeeId: projectWorkLogs.employeeId,
        employeeName: employees.name,
        startDatetime: projectWorkLogs.startDatetime,
        endDatetime: projectWorkLogs.endDatetime,
        hourlyRate: projectWorkLogs.hourlyRate,
        totalHours: projectWorkLogs.totalHours,
        totalAmount: projectWorkLogs.totalAmount,
        notes: projectWorkLogs.notes,
      })
      .from(projectWorkLogs)
      .innerJoin(employees, eq(employees.id, projectWorkLogs.employeeId))
      .where(eq(projectWorkLogs.projectId, projectId))
      .orderBy(asc(projectWorkLogs.startDatetime)),
  ])

  const workLogsByTask = new Map<string, ProjectWorkLogListItem[]>()
  for (const log of logs) {
    const item: ProjectWorkLogListItem = {
      id: log.id,
      employeeId: log.employeeId,
      employeeName: log.employeeName,
      startDatetime: toIso(log.startDatetime),
      endDatetime: toIso(log.endDatetime),
      hourlyRate: toMoney(log.hourlyRate),
      totalHours: toMoney(log.totalHours),
      totalAmount: toMoney(log.totalAmount),
      notes: log.notes,
    }
    const list = workLogsByTask.get(log.projectTaskId)
    if (list) list.push(item)
    else workLogsByTask.set(log.projectTaskId, [item])
  }

  return rows.map((row) => ({
    id: row.id,
    projectId: row.projectId,
    name: row.name,
    description: row.description,
    budget: toMoney(row.budget),
    estimatedHours: toMoney(row.estimatedHours),
    plannedStartDate: row.plannedStartDate,
    plannedEndDate: row.plannedEndDate,
    status: row.status,
    laborHours: toMoney(row.laborHours),
    laborSpent: toMoney(row.laborSpent),
    workLogs: workLogsByTask.get(row.id) ?? [],
  }))
}

export async function createProjectTask(
  organizationId: string,
  userId: string,
  projectId: string,
  input: ProjectTaskCreateInput
): Promise<ProjectTaskListItem | null> {
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.organizationId, organizationId)))
    .limit(1)
  if (!project) return null

  const [row] = await db
    .insert(projectTasks)
    .values({
      projectId,
      name: input.name.trim(),
      description: blankToNull(input.description),
      budget: parseBudget(input.budget?.trim() ? input.budget : '0'),
      plannedEndDate: parseDate(input.dueDate),
      status: 'pending',
      createdBy: userId,
      updatedBy: userId,
    })
    .returning({
      id: projectTasks.id,
      projectId: projectTasks.projectId,
      name: projectTasks.name,
      description: projectTasks.description,
      budget: projectTasks.budget,
      estimatedHours: projectTasks.estimatedHours,
      plannedStartDate: projectTasks.plannedStartDate,
      plannedEndDate: projectTasks.plannedEndDate,
      status: projectTasks.status,
    })
  if (!row) throw new Error('Failed to create task')

  return {
    id: row.id,
    projectId: row.projectId,
    name: row.name,
    description: row.description,
    budget: toMoney(row.budget),
    estimatedHours: toMoney(row.estimatedHours),
    plannedStartDate: row.plannedStartDate,
    plannedEndDate: row.plannedEndDate,
    status: row.status,
    laborHours: '0.00',
    laborSpent: '0.00',
    workLogs: [],
  }
}

function taskUpdateValues(input: ProjectTaskUpdateInput) {
  const plannedStartDate = parseDate(input.plannedStartDate)
  const plannedEndDate = parseDate(input.plannedEndDate)
  if (plannedStartDate && plannedEndDate && plannedEndDate < plannedStartDate) {
    throw new Error('Due date must be on or after the start date')
  }
  return {
    name: input.name.trim(),
    description: blankToNull(input.description),
    budget: parseBudget(input.budget),
    estimatedHours: parseAmount(input.estimatedHours, 'Estimated hours'),
    plannedStartDate,
    plannedEndDate,
    status: parseTaskStatus(input.status),
  }
}

export async function updateProjectTask(
  organizationId: string,
  userId: string,
  projectId: string,
  taskId: string,
  input: ProjectTaskUpdateInput
): Promise<ProjectTaskListItem | null> {
  const existing = await requireProjectTask(organizationId, projectId, taskId)
  if (!existing) return null
  const [row] = await db
    .update(projectTasks)
    .set({
      updatedBy: userId,
      ...taskUpdateValues(input),
    })
    .where(and(eq(projectTasks.id, taskId), eq(projectTasks.projectId, projectId)))
    .returning({ id: projectTasks.id })
  if (!row) return null
  const tasks = await listProjectTasks(organizationId, projectId)
  return tasks?.find((task) => task.id === taskId) ?? null
}

function mapWorkLog(log: {
  id: string
  employeeId: string
  employeeName: string
  startDatetime: Date | string
  endDatetime: Date | string
  hourlyRate: unknown
  totalHours: unknown
  totalAmount: unknown
  notes: string | null
}): ProjectWorkLogListItem {
  return {
    id: log.id,
    employeeId: log.employeeId,
    employeeName: log.employeeName,
    startDatetime: toIso(log.startDatetime),
    endDatetime: toIso(log.endDatetime),
    hourlyRate: toMoney(log.hourlyRate),
    totalHours: toMoney(log.totalHours),
    totalAmount: toMoney(log.totalAmount),
    notes: log.notes,
  }
}

async function selectWorkLog(workLogId: string): Promise<ProjectWorkLogListItem | null> {
  const [log] = await db
    .select({
      id: projectWorkLogs.id,
      employeeId: projectWorkLogs.employeeId,
      employeeName: employees.name,
      startDatetime: projectWorkLogs.startDatetime,
      endDatetime: projectWorkLogs.endDatetime,
      hourlyRate: projectWorkLogs.hourlyRate,
      totalHours: projectWorkLogs.totalHours,
      totalAmount: projectWorkLogs.totalAmount,
      notes: projectWorkLogs.notes,
    })
    .from(projectWorkLogs)
    .innerJoin(employees, eq(employees.id, projectWorkLogs.employeeId))
    .where(eq(projectWorkLogs.id, workLogId))
    .limit(1)
  return log ? mapWorkLog(log) : null
}

async function requireProjectTask(organizationId: string, projectId: string, taskId: string) {
  const [task] = await db
    .select({ id: projectTasks.id })
    .from(projectTasks)
    .innerJoin(projects, eq(projects.id, projectTasks.projectId))
    .where(
      and(
        eq(projectTasks.id, taskId),
        eq(projectTasks.projectId, projectId),
        eq(projects.organizationId, organizationId)
      )
    )
    .limit(1)
  return task ?? null
}

async function requireActiveEmployee(organizationId: string, employeeId: string) {
  const [employee] = await db
    .select({ id: employees.id })
    .from(employees)
    .where(
      and(
        eq(employees.id, employeeId),
        eq(employees.organizationId, organizationId),
        eq(employees.status, 'active')
      )
    )
    .limit(1)
  if (!employee) throw new ProjectWorkLogEmployeeError()
}

function workLogValues(input: ProjectWorkLogInput) {
  const startDatetime = parseTimestamp(input.startDatetime, 'Start')
  const endDatetime = parseTimestamp(input.endDatetime, 'End')
  if (endDatetime <= startDatetime) throw new Error('End must be after start')
  return {
    employeeId: input.employeeId,
    startDatetime,
    endDatetime,
    hourlyRate: parseHourlyRate(input.hourlyRate),
    notes: blankToNull(input.notes),
  }
}

export async function createProjectWorkLog(
  organizationId: string,
  userId: string,
  projectId: string,
  taskId: string,
  input: ProjectWorkLogInput
): Promise<ProjectWorkLogListItem | null> {
  const task = await requireProjectTask(organizationId, projectId, taskId)
  if (!task) return null
  await requireActiveEmployee(organizationId, input.employeeId)
  const values = workLogValues(input)
  const [row] = await db
    .insert(projectWorkLogs)
    .values({
      projectId,
      projectTaskId: taskId,
      createdBy: userId,
      updatedBy: userId,
      ...values,
    })
    .returning({ id: projectWorkLogs.id })
  if (!row) throw new Error('Failed to create work log')
  const created = await selectWorkLog(row.id)
  if (!created) throw new Error('Failed to create work log')
  return created
}

export async function updateProjectWorkLog(
  organizationId: string,
  userId: string,
  projectId: string,
  taskId: string,
  workLogId: string,
  input: ProjectWorkLogInput
): Promise<ProjectWorkLogListItem | null> {
  const task = await requireProjectTask(organizationId, projectId, taskId)
  if (!task) return null
  await requireActiveEmployee(organizationId, input.employeeId)
  const values = workLogValues(input)
  const [row] = await db
    .update(projectWorkLogs)
    .set({
      updatedBy: userId,
      ...values,
    })
    .where(
      and(
        eq(projectWorkLogs.id, workLogId),
        eq(projectWorkLogs.projectId, projectId),
        eq(projectWorkLogs.projectTaskId, taskId)
      )
    )
    .returning({ id: projectWorkLogs.id })
  if (!row) return null
  return selectWorkLog(row.id)
}

export async function deleteProjectWorkLog(
  organizationId: string,
  projectId: string,
  taskId: string,
  workLogId: string
): Promise<boolean> {
  const task = await requireProjectTask(organizationId, projectId, taskId)
  if (!task) return false
  const [row] = await db
    .delete(projectWorkLogs)
    .where(
      and(
        eq(projectWorkLogs.id, workLogId),
        eq(projectWorkLogs.projectId, projectId),
        eq(projectWorkLogs.projectTaskId, taskId)
      )
    )
    .returning({ id: projectWorkLogs.id })
  return Boolean(row)
}

export async function getProject(organizationId: string, id: string): Promise<Project | null> {
  const labor = laborByProject()
  const expenses = expenseByProject()
  const progress = taskProgressByProject()
  const [row] = await db
    .select({
      ...projectSelect,
      laborHours: sql<string>`coalesce(${labor.laborHours}, 0)`,
      laborSpent: sql<string>`coalesce(${labor.laborSpent}, 0)`,
      expenseSpent: sql<string>`coalesce(${expenses.expenseSpent}, 0)`,
      activeTasks: progress.activeTasks,
      completedTasks: progress.completedTasks,
    })
    .from(projects)
    .leftJoin(profiles, eq(profiles.id, projects.createdBy))
    .leftJoin(supervisor, eq(supervisor.id, projects.supervisorEmployeeId))
    .leftJoin(labor, eq(labor.projectId, projects.id))
    .leftJoin(expenses, eq(expenses.projectId, projects.id))
    .leftJoin(progress, eq(progress.projectId, projects.id))
    .where(and(eq(projects.id, id), eq(projects.organizationId, organizationId)))
    .limit(1)
  return row ? toProject(row) : null
}

export async function createProject(
  organizationId: string,
  userId: string,
  input: ProjectCreateInput
) {
  if (await projectCodeExists({ organizationId, code: input.code })) {
    throw new ProjectCodeConflictError()
  }
  await assertActiveSupervisor(organizationId, input.supervisorEmployeeId)
  try {
    const [row] = await db
      .insert(projects)
      .values({
        organizationId,
        code: input.code.trim(),
        name: input.name.trim(),
        description: blankToNull(input.description),
        supervisorEmployeeId: input.supervisorEmployeeId,
        startDate: parseDate(input.startDate),
        dueDate: parseDate(input.dueDate),
        budget: parseBudget(input.budget?.trim() ? input.budget : '0'),
        status: 'draft',
        createdBy: userId,
        updatedBy: userId,
      })
      .returning({ id: projects.id })
    if (!row) throw new Error('Failed to create project')
    return getProject(organizationId, row.id)
  } catch (error) {
    if (isUniqueViolation(error)) throw new ProjectCodeConflictError()
    if (error instanceof Error && error.message.startsWith('Dates')) throw error
    if (error instanceof Error && error.message.startsWith('Budget')) throw error
    throw error
  }
}

export async function updateProject(
  organizationId: string,
  userId: string,
  id: string,
  input: ProjectUpdateInput
) {
  if (await projectCodeExists({ organizationId, code: input.code, excludeId: id })) {
    throw new ProjectCodeConflictError()
  }
  await assertActiveSupervisor(organizationId, input.supervisorEmployeeId)
  const [existing] = await db
    .select({ status: projects.status, completedAt: projects.completedAt })
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.organizationId, organizationId)))
    .limit(1)
  if (!existing) return null

  let completedAt = existing.completedAt
  if (input.status === 'completed' && existing.status !== 'completed') {
    completedAt = new Date()
  } else if (input.status !== 'completed') {
    completedAt = null
  }

  try {
    const [row] = await db
      .update(projects)
      .set({
        code: input.code.trim(),
        name: input.name.trim(),
        description: blankToNull(input.description),
        startDate: parseDate(input.startDate),
        dueDate: parseDate(input.dueDate),
        budget: parseBudget(input.budget),
        status: input.status,
        supervisorEmployeeId: input.supervisorEmployeeId,
        completedAt,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(and(eq(projects.id, id), eq(projects.organizationId, organizationId)))
      .returning({ id: projects.id })
    if (!row) return null
    return getProject(organizationId, row.id)
  } catch (error) {
    if (error instanceof ProjectSupervisorError) throw error
    if (isUniqueViolation(error)) throw new ProjectCodeConflictError()
    if (error instanceof Error && error.message.startsWith('Dates')) throw error
    if (error instanceof Error && error.message.startsWith('Budget')) throw error
    throw error
  }
}
