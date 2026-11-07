import { relations } from "drizzle-orm";
import { appNotificationReads, appNotifications } from "./app-notifications";
import { authUsers } from "./auth-users";
import { employees } from "./employees";
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

export const employeesRelations = relations(employees, ({ one }) => ({
    organization: one(organizations, {
        fields: [employees.organizationId],
        references: [organizations.id],
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
