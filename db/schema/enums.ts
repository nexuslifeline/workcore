import { pgEnum } from "drizzle-orm/pg-core";

export const profileStatusEnum = pgEnum("profile_status", [
    "active",
    "suspended",
    "inactive",
    "pending"
]);

export const invitationStatusEnum = pgEnum("invitation_status", [
    "pending",
    "accepted",
    "revoked",
    "expired"
]);

export const internalUserRoleStatusEnum = pgEnum("internal_user_role_status", [
    "pending",
    "active",
    "suspended",
]);

export const internalUserRoleEnum = pgEnum("internal_user_role", [
    "admin",
    "partner",
]);

export const employeeGenderEnum = pgEnum("employee_gender", [
    "male",
    "female",
]);

export const employeeStatusEnum = pgEnum("employee_status", [
    "active",
    "inactive",
]);
