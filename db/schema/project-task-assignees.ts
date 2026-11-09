import { sql } from "drizzle-orm";
import { check, numeric, pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { authUsers } from "./auth-users";
import { employees } from "./employees";
import { projectTasks } from "./project-tasks";

export const projectTaskAssignees = pgTable(
    "project_task_assignees",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        projectTaskId: uuid("project_task_id")
            .notNull()
            .references(() => projectTasks.id, { onDelete: "cascade" }),
        employeeId: uuid("employee_id")
            .notNull()
            .references(() => employees.id, { onDelete: "restrict" }),
        hourlyRate: numeric("hourly_rate", { precision: 12, scale: 2 }).notNull(),
        createdBy: uuid("created_by").references(() => authUsers.id, { onDelete: "set null" }),
        updatedBy: uuid("updated_by").references(() => authUsers.id, { onDelete: "set null" }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
    },
    (t) => ({
        taskEmployeeUnique: unique("project_task_assignees_task_employee_unique").on(
            t.projectTaskId,
            t.employeeId
        ),
        rateNonNegative: check(
            "project_task_assignees_hourly_rate_non_negative",
            sql`${t.hourlyRate} >= 0`
        ),
    })
);
