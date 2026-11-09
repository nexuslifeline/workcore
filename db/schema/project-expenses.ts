import { sql } from "drizzle-orm";
import { check, date, index, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { authUsers } from "./auth-users";
import { projects } from "./projects";

export const projectExpenses = pgTable(
    "project_expenses",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        projectId: uuid("project_id")
            .notNull()
            .references(() => projects.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        description: text("description"),
        referenceNumber: text("reference_number"),
        expenseDate: date("expense_date").notNull(),
        quantity: numeric("quantity", { precision: 14, scale: 3 }).default("1").notNull(),
        rate: numeric("rate", { precision: 12, scale: 2 }).notNull(),
        amount: numeric("amount", { precision: 14, scale: 2 }).generatedAlwaysAs(
            sql`ROUND(quantity * rate, 2)`
        ),
        createdBy: uuid("created_by").references(() => authUsers.id, { onDelete: "set null" }),
        updatedBy: uuid("updated_by").references(() => authUsers.id, { onDelete: "set null" }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
    },
    (t) => ({
        projectIdx: index("project_expenses_project_id_idx").on(t.projectId),
        quantityPositive: check("project_expenses_quantity_positive", sql`${t.quantity} > 0`),
        rateNonNegative: check("project_expenses_rate_non_negative", sql`${t.rate} >= 0`),
    })
);
