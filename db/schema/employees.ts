import { date, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { employeeGenderEnum, employeeStatusEnum } from "./enums";
import { organizations } from "./organizations";

export const employees = pgTable(
    "employees",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        organizationId: uuid("organization_id")
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        code: text("code").notNull(),
        name: text("name").notNull(),
        imageUrl: text("image_url"),
        birthdate: date("birthdate"),
        tin: text("tin"),
        gender: employeeGenderEnum("gender").notNull(),
        currentAddress: text("current_address"),
        homeAddress: text("home_address"),
        contactNumber: text("contact_number"),
        sssNumber: text("sss_number"),
        philhealthNumber: text("philhealth_number"),
        status: employeeStatusEnum("status").default("active").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
    },
    (t) => ({
        orgCodeUnique: unique("employees_organization_code_unique").on(t.organizationId, t.code),
    })
);
