import { index, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { authUsers } from "./auth-users";
import { organizations } from "./organizations";

export const vehicles = pgTable(
    "vehicles",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        organizationId: uuid("organization_id")
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        description: text("description"),
        plateNumber: text("plate_number").notNull(),
        createdBy: uuid("created_by").references(() => authUsers.id, { onDelete: "set null" }),
        updatedBy: uuid("updated_by").references(() => authUsers.id, { onDelete: "set null" }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
    },
    (t) => ({
        orgPlateUnique: unique("vehicles_organization_plate_number_unique").on(
            t.organizationId,
            t.plateNumber
        ),
        orgIdx: index("vehicles_organization_id_idx").on(t.organizationId),
    })
);
