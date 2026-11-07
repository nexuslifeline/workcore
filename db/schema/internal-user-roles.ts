import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { authUsers } from "./auth-users";
import { internalUserRoleEnum, internalUserRoleStatusEnum } from "./enums";

/**
 * Grant of an internal console role (admin | partner) to an existing Auth/profile user.
 * Not a second identity — name/email live on profiles.
 * id is the grant row; user_id is auth.users.id (one grant per user).
 */
export const internalUserRoles = pgTable("internal_user_roles", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .unique()
        .references(() => authUsers.id, { onDelete: "cascade" }),
    role: internalUserRoleEnum("role").default("admin").notNull(),
    status: internalUserRoleStatusEnum("status").default("pending").notNull(),
    notes: text("notes"),
    createdBy: uuid("created_by").references(() => authUsers.id, {
        onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});
