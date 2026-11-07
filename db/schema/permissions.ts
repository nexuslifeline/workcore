import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const permissions = pgTable("permissions", {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Stable snake_case slug (e.g. sales_estimates); unbounded text in Postgres. */
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    group: text("group"),
    parentCode: text("parent_code")
});
