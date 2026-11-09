import { date, numeric, pgTable, text, timestamp, unique, uuid, index } from "drizzle-orm/pg-core";
import { authUsers } from "./auth-users";
import { projectTaskStatusEnum } from "./enums";
import { projects } from "./projects";

export const projectTasks = pgTable(
    "project_tasks",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        projectId: uuid("project_id")
            .notNull()
            .references(() => projects.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        description: text("description"),
        budget: numeric("budget", { precision: 14, scale: 2 }).default("0").notNull(),
        estimatedHours: numeric("estimated_hours", { precision: 12, scale: 2 }).default("0").notNull(),
        plannedStartDate: date("planned_start_date"),
        plannedEndDate: date("planned_end_date"),
        actualStartedAt: timestamp("actual_started_at", { mode: "date" }),
        actualCompletedAt: timestamp("actual_completed_at", { mode: "date" }),
        status: projectTaskStatusEnum("status").default("pending").notNull(),
        createdBy: uuid("created_by").references(() => authUsers.id, { onDelete: "set null" }),
        updatedBy: uuid("updated_by").references(() => authUsers.id, { onDelete: "set null" }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
    },
    (t) => ({
        idProjectUnique: unique("project_tasks_id_project_id_unique").on(t.id, t.projectId),
        projectIdx: index("project_tasks_project_id_idx").on(t.projectId),
    })
);
