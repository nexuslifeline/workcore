import { pgTable, uuid, unique, boolean } from "drizzle-orm/pg-core";
import { roles } from "./roles";
import { permissions } from "./permissions";

export const rolePermissions = pgTable(
    "role_permissions",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        roleId: uuid("role_id")
            .notNull()
            .references(() => roles.id, { onDelete: "cascade" }),
        permissionId: uuid("permission_id")
            .notNull()
            .references(() => permissions.id, { onDelete: "cascade" }),
        isAllowed: boolean("is_allowed").default(false).notNull(),
    },
    (t) => ({
        unq: unique().on(t.roleId, t.permissionId),
    })
);
