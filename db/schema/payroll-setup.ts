import { sql } from "drizzle-orm";
import { check, integer, pgTable, time, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const payrollSetup = pgTable(
    "payroll_setup",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        organizationId: uuid("organization_id")
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        defaultBreakMinutes: integer("default_break_minutes").default(60).notNull(),
        maxRegularShiftHours: integer("max_regular_shift_hours").default(8).notNull(),
        nightShiftDifferentialStartTime: time("night_shift_differential_start_time")
            .default("22:00:00")
            .notNull(),
        nightShiftDifferentialEndTime: time("night_shift_differential_end_time")
            .default("06:00:00")
            .notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
    },
    (t) => ({
        orgUnique: unique("payroll_setup_organization_id_unique").on(t.organizationId),
        breakMinutesNonNegative: check(
            "payroll_setup_default_break_minutes_non_negative",
            sql`${t.defaultBreakMinutes} >= 0`
        ),
        regularShiftHoursRange: check(
            "payroll_setup_max_regular_shift_hours_range",
            sql`${t.maxRegularShiftHours} >= 1 AND ${t.maxRegularShiftHours} <= 24`
        ),
    })
);
