import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { authUsers } from "./auth-users";

export const organizations = pgTable("organizations", {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id").notNull().references(() => authUsers.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    description: text("description"),
    logoUrl: text("logo_url"),
    address: text("address"),
    phone: text("phone"),
    email: text("email"),
    website: text("website"),
    contactPerson: text("contact_person"),
    industry: text("industry"),
    status: text("status").default("active"),
    currencyCode: text("currency_code").default("PHP").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});
