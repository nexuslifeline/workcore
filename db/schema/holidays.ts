import { boolean, date, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { authUsers } from "./auth-users";
import { holidayTypeEnum } from "./enums";
import { organizations } from "./organizations";

export const holidays = pgTable(
    "holidays",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        organizationId: uuid("organization_id")
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        date: date("date").notNull(),
        name: text("name").notNull(),
        description: text("description"),
        type: holidayTypeEnum("type").notNull(),
        isRecurring: boolean("is_recurring").default(false).notNull(),
        createdBy: uuid("created_by").references(() => authUsers.id, { onDelete: "set null" }),
        updatedBy: uuid("updated_by").references(() => authUsers.id, { onDelete: "set null" }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
    },
    (t) => ({
        orgDateIdx: index("holidays_organization_id_date_idx").on(t.organizationId, t.date),
    })
);
