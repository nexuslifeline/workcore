import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { profileStatusEnum } from "./enums";

/**
 * Profile id should be set to auth.users.id (Supabase Auth user UUID) when creating
 * a profile. Actor/audit FKs across the app reference auth.users.id directly.
 */
export const profiles = pgTable("profiles", {
    id: uuid("id").primaryKey(), // Set to auth.uid() when inserting; enables FK from journal_entries, invoices, etc.
    userId: uuid("user_id").notNull().unique(),
    name: text("name"),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    phone: text("phone"),
    email: text("email"),
    website: text("website"),
    birthdate: timestamp("birthdate", { mode: "date" }),
    address: text("address"),
    locale: text("locale"),
    status: profileStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});
