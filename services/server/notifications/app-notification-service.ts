import { and, count, desc, eq, isNull } from "drizzle-orm";
import {
  appNotificationReads,
  appNotifications,
  type AppNotificationType,
} from "@/db/schema/app-notifications";
import { organizationUsers } from "@/db/schema/organization-users";
import { organizations } from "@/db/schema/organizations";
import { db, type DbTransaction } from "@/lib/db";
import { logger } from "@/lib/logger";

export type CreateAppNotificationParams = {
  organizationId: string;
  type: AppNotificationType | string;
  title: string;
  body?: string | null;
  payload?: Record<string, unknown> | null;
  dedupeKey: string;
  tx?: DbTransaction;
};

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String((error as { code?: unknown }).code) : "";
  const message = "message" in error ? String((error as { message?: unknown }).message) : "";
  return code === "23505" || message.includes("app_notifications_org_dedupe_uidx");
}

/** True when the user is the organization owner or a member. */
export async function canViewAppNotifications(
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const [org] = await db
    .select({ ownerId: organizations.ownerId })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);

  if (!org) return false;
  if (org.ownerId === userId) return true;

  const [member] = await db
    .select({ userId: organizationUsers.userId })
    .from(organizationUsers)
    .where(
      and(
        eq(organizationUsers.organizationId, organizationId),
        eq(organizationUsers.userId, userId),
      ),
    )
    .limit(1);

  return Boolean(member);
}

/**
 * Insert an org-scoped in-app notification. Idempotent on organizationId + dedupeKey.
 * Deep links are derived in app UI from type + payload (not stored).
 */
export async function createAppNotification(
  params: CreateAppNotificationParams,
): Promise<{ created: boolean; id?: string }> {
  const {
    organizationId,
    type,
    title,
    body = null,
    payload = null,
    dedupeKey,
    tx,
  } = params;

  const executor = tx ?? db;

  try {
    const [row] = await executor
      .insert(appNotifications)
      .values({
        organizationId,
        type,
        title,
        body,
        payload,
        dedupeKey,
      })
      .returning({ id: appNotifications.id });

    return { created: Boolean(row), id: row?.id };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { created: false };
    }
    logger.error("Failed to create app notification", error, {
      scope: "app-notifications",
      type,
      dedupeKey,
      organizationId,
    });
    throw error;
  }
}

/**
 * List org notifications for a user (read state joined). Caller must enforce
 * canViewBillingAppNotifications (or equivalent) before calling.
 */
export async function listAppNotificationsForOrganization(params: {
  organizationId: string;
  userId: string;
  unreadOnly?: boolean;
  limit?: number;
}) {
  const { organizationId, userId, unreadOnly = false, limit = 50 } = params;
  const pageSize = Math.min(Math.max(limit, 1), 100);

  const conditions = [eq(appNotifications.organizationId, organizationId)];
  if (unreadOnly) {
    conditions.push(isNull(appNotificationReads.readAt));
  }

  return db
    .select({
      id: appNotifications.id,
      organizationId: appNotifications.organizationId,
      type: appNotifications.type,
      title: appNotifications.title,
      body: appNotifications.body,
      payload: appNotifications.payload,
      createdAt: appNotifications.createdAt,
      readAt: appNotificationReads.readAt,
    })
    .from(appNotifications)
    .leftJoin(
      appNotificationReads,
      and(
        eq(appNotificationReads.notificationId, appNotifications.id),
        eq(appNotificationReads.userId, userId),
      ),
    )
    .where(and(...conditions))
    .orderBy(desc(appNotifications.createdAt))
    .limit(pageSize);
}

export async function countUnreadAppNotificationsForOrganization(params: {
  organizationId: string;
  userId: string;
}): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(appNotifications)
    .leftJoin(
      appNotificationReads,
      and(
        eq(appNotificationReads.notificationId, appNotifications.id),
        eq(appNotificationReads.userId, params.userId),
      ),
    )
    .where(
      and(
        eq(appNotifications.organizationId, params.organizationId),
        isNull(appNotificationReads.readAt),
      ),
    );

  return Number(row?.value ?? 0);
}

/**
 * Mark a notification read for this user (insert read receipt). Idempotent.
 */
export async function markAppNotificationRead(params: {
  id: string;
  userId: string;
  organizationId: string;
  now?: Date;
}): Promise<boolean> {
  const now = params.now ?? new Date();

  const [notification] = await db
    .select({ id: appNotifications.id })
    .from(appNotifications)
    .where(
      and(
        eq(appNotifications.id, params.id),
        eq(appNotifications.organizationId, params.organizationId),
      ),
    )
    .limit(1);

  if (!notification) return false;

  try {
    await db
      .insert(appNotificationReads)
      .values({
        notificationId: params.id,
        userId: params.userId,
        readAt: now,
      })
      .onConflictDoNothing({
        target: [appNotificationReads.notificationId, appNotificationReads.userId],
      });
    return true;
  } catch (error) {
    logger.error("Failed to mark app notification read", error, {
      scope: "app-notifications",
      notificationId: params.id,
      userId: params.userId,
    });
    throw error;
  }
}
