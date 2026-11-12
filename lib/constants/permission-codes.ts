/**
 * Permission `code` values (snake_case slugs) stored in `permissions.code`.
 */
export const PERMISSIONS = {
  DASHBOARD: 'dashboard',
  EMPLOYEES: 'employees',
  PROJECTS: 'projects',
  PROJECT_WORK_LOGS: 'project_work_logs',
  SYSTEM_USERS: 'system_users',
  SYSTEM_ROLES: 'system_roles',
  SYSTEM_ORGANIZATIONS: 'system_organizations',
  SETTINGS_ORGANIZATION: 'settings_organization',
  SETTINGS_PAYROLL: 'settings_payroll',
} as const

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
