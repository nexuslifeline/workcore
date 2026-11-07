import { pgSchema, timestamp, uuid } from "drizzle-orm/pg-core";

const auth = pgSchema("auth");

/** Minimal auth.users table reference for foreign keys from public schema tables. */
export const authUsers = auth.table("users", {
    id: uuid("id").primaryKey(),
    lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true, mode: "date" }),
});

