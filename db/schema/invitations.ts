import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { authUsers } from "./auth-users";
import { invitationStatusEnum } from "./enums";
import { organizations } from "./organizations";
import { roles } from "./roles";

export const invitations = pgTable("invitations", {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "restrict" }),
    message: text("message"),
    token: text("token").notNull().unique(),
    status: invitationStatusEnum("status").default("pending").notNull(),
    invitedBy: uuid("invited_by").references(() => authUsers.id, { onDelete: "set null" }),
    acceptedByUserId: uuid("accepted_by_user_id").references(() => authUsers.id, { onDelete: "set null" }),
    expiresAt: timestamp("expires_at").notNull(),
    acceptedAt: timestamp("accepted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}, (t) => ({
    idx: index("invitation_lookup_idx").on(t.organizationId, t.email, t.status),
}));
