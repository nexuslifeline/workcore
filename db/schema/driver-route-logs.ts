import { sql } from "drizzle-orm";
import {
    check,
    index,
    numeric,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { driverRouteLogStatusEnum } from "./enums";
import { employees } from "./employees";
import { organizations } from "./organizations";
import { vehicles } from "./vehicles";

export const driverRouteLogs = pgTable(
    "driver_route_logs",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        organizationId: uuid("organization_id")
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        vehicleId: uuid("vehicle_id")
            .notNull()
            .references(() => vehicles.id, { onDelete: "restrict" }),
        employeeId: uuid("employee_id")
            .notNull()
            .references(() => employees.id, { onDelete: "restrict" }),
        origin: text("origin").notNull(),
        destination: text("destination").notNull(),
        startDatetime: timestamp("start_datetime", { withTimezone: true, mode: "date" }).notNull(),
        endDatetime: timestamp("end_datetime", { withTimezone: true, mode: "date" }),
        startingOdometer: numeric("starting_odometer", { precision: 12, scale: 1 }),
        endingOdometer: numeric("ending_odometer", { precision: 12, scale: 1 }),
        status: driverRouteLogStatusEnum("status").default("scheduled").notNull(),
        notes: text("notes"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
    },
    (t) => ({
        orgIdx: index("driver_route_logs_organization_id_idx").on(t.organizationId),
        vehicleStartIdx: index("driver_route_logs_vehicle_start_idx").on(
            t.vehicleId,
            t.startDatetime
        ),
        employeeStartIdx: index("driver_route_logs_employee_start_idx").on(
            t.employeeId,
            t.startDatetime
        ),
        startingOdometerNonNegative: check(
            "driver_route_logs_starting_odometer_non_negative",
            sql`${t.startingOdometer} IS NULL OR ${t.startingOdometer} >= 0`
        ),
        endingOdometerNonNegative: check(
            "driver_route_logs_ending_odometer_non_negative",
            sql`${t.endingOdometer} IS NULL OR ${t.endingOdometer} >= 0`
        ),
        odometerOrder: check(
            "driver_route_logs_odometer_order",
            sql`${t.endingOdometer} IS NULL OR ${t.startingOdometer} IS NULL OR ${t.endingOdometer} >= ${t.startingOdometer}`
        ),
        endAfterStart: check(
            "driver_route_logs_end_after_start",
            sql`${t.endDatetime} IS NULL OR ${t.endDatetime} >= ${t.startDatetime}`
        ),
    })
);
