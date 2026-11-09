import { relations } from "drizzle-orm";
import { appNotificationReads, appNotifications } from "./app-notifications";
import { authUsers } from "./auth-users";
import { employees } from "./employees";
import { projectExpenses } from "./project-expenses";
import { projectTaskAssignees } from "./project-task-assignees";
import { projectTasks } from "./project-tasks";
import { projectWorkLogs } from "./project-work-logs";
import { projects } from "./projects";
import { internalUserRoles } from "./internal-user-roles";
import { invitations } from "./invitations";
import { organizationUsers } from "./organization-users";
import { organizations } from "./organizations";
import { permissions } from "./permissions";
import { profiles } from "./profiles";
import { rolePermissions } from "./role-permissions";
import { roles } from "./roles";

export const organizationsRelations = relations(organizations, ({ many }) => ({
    users: many(organizationUsers),
    invitations: many(invitations),
    roles: many(roles),
    employees: many(employees),
    projects: many(projects),
    appNotifications: many(appNotifications),
}));

export const organizationUsersRelations = relations(organizationUsers, ({ one }) => ({
    organization: one(organizations, {
        fields: [organizationUsers.organizationId],
        references: [organizations.id],
    }),
    role: one(roles, {
        fields: [organizationUsers.roleId],
        references: [roles.id],
    }),
    user: one(authUsers, {
        fields: [organizationUsers.userId],
        references: [authUsers.id],
    }),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [roles.organizationId],
        references: [organizations.id],
    }),
    permissions: many(rolePermissions),
    members: many(organizationUsers),
    invitations: many(invitations),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
    role: one(roles, {
        fields: [rolePermissions.roleId],
        references: [roles.id],
    }),
    permission: one(permissions, {
        fields: [rolePermissions.permissionId],
        references: [permissions.id],
    }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
    organization: one(organizations, {
        fields: [invitations.organizationId],
        references: [organizations.id],
    }),
    role: one(roles, {
        fields: [invitations.roleId],
        references: [roles.id],
    }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
    user: one(authUsers, {
        fields: [profiles.userId],
        references: [authUsers.id],
    }),
}));

export const internalUserRolesRelations = relations(internalUserRoles, ({ one }) => ({
    user: one(authUsers, {
        fields: [internalUserRoles.userId],
        references: [authUsers.id],
    }),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [employees.organizationId],
        references: [organizations.id],
    }),
    taskAssignments: many(projectTaskAssignees),
    workLogs: many(projectWorkLogs),
    supervisedProjects: many(projects, { relationName: "projectSupervisor" }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [projects.organizationId],
        references: [organizations.id],
    }),
    tasks: many(projectTasks),
    expenses: many(projectExpenses),
    workLogs: many(projectWorkLogs),
    supervisor: one(employees, {
        fields: [projects.supervisorEmployeeId],
        references: [employees.id],
        relationName: "projectSupervisor",
    }),
    createdByUser: one(authUsers, {
        fields: [projects.createdBy],
        references: [authUsers.id],
        relationName: "projectCreatedBy",
    }),
    updatedByUser: one(authUsers, {
        fields: [projects.updatedBy],
        references: [authUsers.id],
        relationName: "projectUpdatedBy",
    }),
}));

export const projectTasksRelations = relations(projectTasks, ({ one, many }) => ({
    project: one(projects, {
        fields: [projectTasks.projectId],
        references: [projects.id],
    }),
    assignees: many(projectTaskAssignees),
    workLogs: many(projectWorkLogs),
}));

export const projectTaskAssigneesRelations = relations(projectTaskAssignees, ({ one }) => ({
    task: one(projectTasks, {
        fields: [projectTaskAssignees.projectTaskId],
        references: [projectTasks.id],
    }),
    employee: one(employees, {
        fields: [projectTaskAssignees.employeeId],
        references: [employees.id],
    }),
}));

export const projectWorkLogsRelations = relations(projectWorkLogs, ({ one }) => ({
    project: one(projects, {
        fields: [projectWorkLogs.projectId],
        references: [projects.id],
    }),
    task: one(projectTasks, {
        fields: [projectWorkLogs.projectTaskId],
        references: [projectTasks.id],
    }),
    employee: one(employees, {
        fields: [projectWorkLogs.employeeId],
        references: [employees.id],
    }),
}));

export const projectExpensesRelations = relations(projectExpenses, ({ one }) => ({
    project: one(projects, {
        fields: [projectExpenses.projectId],
        references: [projects.id],
    }),
}));

export const appNotificationsRelations = relations(appNotifications, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [appNotifications.organizationId],
        references: [organizations.id],
    }),
    reads: many(appNotificationReads),
}));

export const appNotificationReadsRelations = relations(appNotificationReads, ({ one }) => ({
    notification: one(appNotifications, {
        fields: [appNotificationReads.notificationId],
        references: [appNotifications.id],
    }),
    user: one(authUsers, {
        fields: [appNotificationReads.userId],
        references: [authUsers.id],
    }),
}));
