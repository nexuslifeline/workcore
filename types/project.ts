export type ProjectStatus = 'draft' | 'approved' | 'in_progress' | 'cancelled' | 'completed'

export type ProjectTaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export const PROJECT_TASK_STATUSES: ProjectTaskStatus[] = [
  'pending',
  'in_progress',
  'completed',
  'cancelled',
]

export const PROJECT_STATUSES: ProjectStatus[] = [
  'draft',
  'approved',
  'in_progress',
  'cancelled',
  'completed',
]

export type ProjectTaskCreateInput = {
  name: string
  description?: string | null
  budget?: string | null
  dueDate?: string | null
}

export type ProjectTaskUpdateInput = {
  name: string
  description?: string | null
  budget: string
  estimatedHours: string
  plannedStartDate?: string | null
  plannedEndDate?: string | null
  status: ProjectTaskStatus
}

export type ProjectWorkLogInput = {
  employeeId: string
  startDatetime: string
  endDatetime: string
  workDate: string
  breakMinutes: number
  hourlyRate: string
  notes?: string | null
}

export type ProjectWorkLogListItem = {
  id: string
  employeeId: string
  employeeName: string
  employeeCode: string
  employeeImageUrl: string | null
  startDatetime: string
  endDatetime: string
  workDate: string
  breakMinutes: number
  maxRegularShiftHours: number
  nsdStartTime: string
  nsdEndTime: string
  hourlyRate: string
  totalHours: string
  totalRegularHours: string
  totalOvertimeHours: string
  totalNightShiftDifferentialHours: string
  totalAmount: string
  notes: string | null
}

export type ProjectTaskListItem = {
  id: string
  projectId: string
  name: string
  description: string | null
  budget: string
  estimatedHours: string
  plannedStartDate: string | null
  plannedEndDate: string | null
  status: ProjectTaskStatus
  laborHours: string
  laborSpent: string
  workLogs: ProjectWorkLogListItem[]
}

export type Project = {
  id: string
  organizationId: string
  code: string
  name: string
  description: string | null
  startDate: string | null
  dueDate: string | null
  budget: string
  status: ProjectStatus
  completedAt: string | null
  createdBy: string | null
  createdByName: string | null
  updatedBy: string | null
  supervisorEmployeeId: string
  supervisorName: string | null
  supervisorCode: string | null
  supervisorImageUrl: string | null
  createdAt: string | Date
  updatedAt: string | Date
  laborHours: string
  laborSpent: string
  expenseSpent: string
  spent: string
  balance: string
  progress: number
}

export type ProjectCreateInput = {
  code: string
  name: string
  description?: string | null
  startDate?: string | null
  dueDate?: string | null
  budget?: string | null
  supervisorEmployeeId: string
}

export type ProjectUpdateInput = {
  code: string
  name: string
  description?: string | null
  startDate?: string | null
  dueDate?: string | null
  budget: string
  status: ProjectStatus
  supervisorEmployeeId: string
}
