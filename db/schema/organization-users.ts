import { pgTable, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { authUsers } from "./auth-users";
import { organizations } from "./organizations";
import { roles } from "./roles";

export const organizationUsers = pgTable("organization_users", {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => authUsers.id, { onDelete: "cascade" }),
    /** Null when the user is the organization owner; required for non-owners. */
    roleId: uuid("role_id").references(() => roles.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (t) => ({
    unq: unique().on(t.organizationId, t.userId),
}));
