import { sql } from "drizzle-orm";
import {
    check,
    foreignKey,
    index,
    numeric,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { authUsers } from "./auth-users";
import { employees } from "./employees";
import { projectTasks } from "./project-tasks";

const hoursExpression = sql`ROUND((EXTRACT(EPOCH FROM (end_datetime - start_datetime)) / 3600.0)::numeric, 2)`;

export const projectWorkLogs = pgTable(
    "project_work_logs",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        projectId: uuid("project_id").notNull(),
        projectTaskId: uuid("project_task_id").notNull(),
        employeeId: uuid("employee_id")
            .notNull()
            .references(() => employees.id, { onDelete: "restrict" }),
        createdBy: uuid("created_by").references(() => authUsers.id, { onDelete: "set null" }),
        updatedBy: uuid("updated_by").references(() => authUsers.id, { onDelete: "set null" }),
        startDatetime: timestamp("start_datetime", { withTimezone: true, mode: "date" }).notNull(),
        endDatetime: timestamp("end_datetime", { withTimezone: true, mode: "date" }).notNull(),
        hourlyRate: numeric("hourly_rate", { precision: 12, scale: 2 }).notNull(),
        totalHours: numeric("total_hours", { precision: 14, scale: 2 }).generatedAlwaysAs(hoursExpression),
        totalAmount: numeric("total_amount", { precision: 14, scale: 2 }).generatedAlwaysAs(
            sql`ROUND(hourly_rate * (EXTRACT(EPOCH FROM (end_datetime - start_datetime)) / 3600.0)::numeric, 2)`
        ),
        notes: text("notes"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
    },
    (t) => ({
        taskProjectFk: foreignKey({
            name: "project_work_logs_task_project_fk",
            columns: [t.projectTaskId, t.projectId],
            foreignColumns: [projectTasks.id, projectTasks.projectId],
        }).onDelete("cascade"),
        projectIdx: index("project_work_logs_project_id_idx").on(t.projectId),
        taskIdx: index("project_work_logs_project_task_id_idx").on(t.projectTaskId),
        employeeStartIdx: index("project_work_logs_employee_start_idx").on(
            t.employeeId,
            t.startDatetime
        ),
        endAfterStart: check(
            "project_work_logs_end_after_start",
            sql`${t.endDatetime} > ${t.startDatetime}`
        ),
        rateNonNegative: check(
            "project_work_logs_hourly_rate_non_negative",
            sql`${t.hourlyRate} >= 0`
        ),
    })
);
