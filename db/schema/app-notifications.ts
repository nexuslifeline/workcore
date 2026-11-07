import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers } from "./auth-users";
import { organizations } from "./organizations";

/**
 * Org-scoped in-app notification events (bell / alerts feed).
 * Visibility is enforced on read (org owner or any member), not by fan-out.
 * Per-user read state is in app_notification_reads.
 * Separate from notification_outbox (async email delivery queue).
 */
export const appNotifications = pgTable(
  "app_notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    /** Stable event name, e.g. billing.invoice_past_due */
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    payload: jsonb("payload"),
    /**
     * Idempotency key per organization.
     * Example: billing.invoice_past_due:{invoiceId}
     */
    dedupeKey: text("dedupe_key").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    orgCreatedIdx: index("app_notifications_org_created_idx").on(
      t.organizationId,
      t.createdAt,
    ),
    typeIdx: index("app_notifications_type_idx").on(t.type),
    orgDedupeUnique: uniqueIndex("app_notifications_org_dedupe_uidx").on(
      t.organizationId,
      t.dedupeKey,
    ),
  }),
);

/**
 * Per-user read receipts for org-scoped app_notifications.
 */
export const appNotificationReads = pgTable(
  "app_notification_reads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    notificationId: uuid("notification_id")
      .notNull()
      .references(() => appNotifications.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    notificationUserUnique: unique("app_notification_reads_notification_user_unique").on(
      t.notificationId,
      t.userId,
    ),
    userReadIdx: index("app_notification_reads_user_read_idx").on(t.userId, t.readAt),
  }),
);

export const APP_NOTIFICATION_TYPE = {
  BILLING_INVOICE_CREATED: "billing.invoice_created",
  BILLING_INVOICE_PAST_DUE: "billing.invoice_past_due",
  BILLING_INVOICE_PAID: "billing.invoice_paid",
  BILLING_PAYMENT_SUBMITTED: "billing.payment_submitted",
  BILLING_PAYMENT_REJECTED: "billing.payment_rejected",
  BILLING_PENDING_CHANGE_FAILED: "billing.pending_change_failed",
  BILLING_PAYMENT_SUCCEEDED: "billing.payment_succeeded",
} as const;

export type AppNotificationType =
  (typeof APP_NOTIFICATION_TYPE)[keyof typeof APP_NOTIFICATION_TYPE];
