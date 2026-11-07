import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const roles = pgTable("roles", {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    name: text("name").notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});