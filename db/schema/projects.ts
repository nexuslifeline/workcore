import { date, numeric, pgTable, text, timestamp, unique, uuid, index } from "drizzle-orm/pg-core";
import { authUsers } from "./auth-users";
import { employees } from "./employees";
import { projectStatusEnum } from "./enums";
import { organizations } from "./organizations";

export const projects = pgTable(
    "projects",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        organizationId: uuid("organization_id")
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        code: text("code").notNull(),
        name: text("name").notNull(),
        description: text("description"),
        startDate: date("start_date"),
        dueDate: date("due_date"),
        budget: numeric("budget", { precision: 14, scale: 2 }).default("0").notNull(),
        status: projectStatusEnum("status").default("draft").notNull(),
        supervisorEmployeeId: uuid("supervisor_employee_id")
            .notNull()
            .references(() => employees.id, { onDelete: "restrict" }),
        completedAt: timestamp("completed_at", { mode: "date" }),
        createdBy: uuid("created_by").references(() => authUsers.id, { onDelete: "set null" }),
        updatedBy: uuid("updated_by").references(() => authUsers.id, { onDelete: "set null" }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
    },
    (t) => ({
        orgCodeUnique: unique("projects_organization_code_unique").on(t.organizationId, t.code),
        orgStatusIdx: index("projects_organization_id_status_idx").on(t.organizationId, t.status),
    })
);
