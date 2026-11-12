import { sql } from "drizzle-orm";
import {
    check,
    date,
    foreignKey,
    index,
    integer,
    numeric,
    pgTable,
    text,
    time,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { authUsers } from "./auth-users";
import { employees } from "./employees";
import { projectTasks } from "./project-tasks";

const hoursExpression = sql`ROUND((EXTRACT(EPOCH FROM (end_datetime - start_datetime)) / 3600.0)::numeric, 2)`;
const amountExpression = sql`ROUND(hourly_rate * GREATEST(0, (EXTRACT(EPOCH FROM (end_datetime - start_datetime)) / 3600.0) - (break_minutes / 60.0))::numeric, 2)`;
const overtimeExpression = sql`ROUND(GREATEST(0, (EXTRACT(EPOCH FROM (end_datetime - start_datetime)) / 3600.0) - (break_minutes / 60.0) - max_regular_shift_hours)::numeric, 2)`;
const regularExpression = sql`ROUND(LEAST(GREATEST(0, (EXTRACT(EPOCH FROM (end_datetime - start_datetime)) / 3600.0) - (break_minutes / 60.0)), max_regular_shift_hours)::numeric, 2)`;
const nightDifferentialExpression = sql`ROUND(LEAST(GREATEST(0, (EXTRACT(EPOCH FROM (end_datetime - start_datetime)) / 3600.0) - (break_minutes / 60.0)), GREATEST(0, EXTRACT(EPOCH FROM (LEAST(end_datetime, ((work_date + 1) + nsd_end_time) AT TIME ZONE 'Asia/Manila') - GREATEST(start_datetime, (work_date + nsd_start_time) AT TIME ZONE 'Asia/Manila'))) / 3600.0))::numeric, 2)`;

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
        workDate: date("work_date").notNull(),
        breakMinutes: integer("break_minutes").notNull(),
        maxRegularShiftHours: integer("max_regular_shift_hours").notNull(),
        nsdStartTime: time("nsd_start_time").notNull(),
        nsdEndTime: time("nsd_end_time").notNull(),
        hourlyRate: numeric("hourly_rate", { precision: 12, scale: 2 }).notNull(),
        totalHours: numeric("total_hours", { precision: 14, scale: 2 }).generatedAlwaysAs(hoursExpression),
        totalRegularHours: numeric("total_regular_hours", { precision: 14, scale: 2 }).generatedAlwaysAs(
            regularExpression
        ),
        totalOvertimeHours: numeric("total_overtime_hours", { precision: 14, scale: 2 }).generatedAlwaysAs(
            overtimeExpression
        ),
        totalNightShiftDifferentialHours: numeric("total_night_shift_differential_hours", {
            precision: 14,
            scale: 2,
        }).generatedAlwaysAs(nightDifferentialExpression),
        totalAmount: numeric("total_amount", { precision: 14, scale: 2 }).generatedAlwaysAs(amountExpression),
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
        employeeWorkDateIdx: index("project_work_logs_employee_work_date_idx").on(
            t.employeeId,
            t.workDate
        ),
        endAfterStart: check(
            "project_work_logs_end_after_start",
            sql`${t.endDatetime} > ${t.startDatetime}`
        ),
        workDateWithinShift: check(
            "project_work_logs_work_date_within_shift",
            sql`${t.workDate} >= (${t.startDatetime} AT TIME ZONE 'Asia/Manila')::date AND ${t.workDate} <= (${t.endDatetime} AT TIME ZONE 'Asia/Manila')::date`
        ),
        breakWithinShift: check(
            "project_work_logs_break_minutes_within_shift",
            sql`${t.breakMinutes} >= 0 AND ${t.breakMinutes} * 60 <= EXTRACT(EPOCH FROM (${t.endDatetime} - ${t.startDatetime}))`
        ),
        regularShiftHoursRange: check(
            "project_work_logs_max_regular_shift_hours_range",
            sql`${t.maxRegularShiftHours} >= 1 AND ${t.maxRegularShiftHours} <= 24`
        ),
        rateNonNegative: check(
            "project_work_logs_hourly_rate_non_negative",
            sql`${t.hourlyRate} >= 0`
        ),
    })
);
