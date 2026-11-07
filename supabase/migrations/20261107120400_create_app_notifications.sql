-- Durable in-app notification feed (org-scoped events).
-- Deep links are derived in app code from type + payload (no href column).
-- Visibility is decided on GET (org owner or any member), not by fan-out rows.
-- Per-user read state lives in app_notification_reads.

CREATE TABLE public.app_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  payload jsonb,
  dedupe_key text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX app_notifications_org_created_idx
  ON public.app_notifications (organization_id, created_at);

CREATE INDEX app_notifications_type_idx
  ON public.app_notifications (type);

-- One row per org + logical event (idempotent inserts).
CREATE UNIQUE INDEX app_notifications_org_dedupe_uidx
  ON public.app_notifications (organization_id, dedupe_key);

COMMENT ON TABLE public.app_notifications IS
  'Org-scoped in-app notification events. Who can see them is enforced on read (org owner or any member).';

CREATE TABLE public.app_notification_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES public.app_notifications (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  read_at timestamp NOT NULL DEFAULT now(),
  created_at timestamp NOT NULL DEFAULT now(),
  UNIQUE (notification_id, user_id)
);

CREATE INDEX app_notification_reads_user_read_idx
  ON public.app_notification_reads (user_id, read_at);

COMMENT ON TABLE public.app_notification_reads IS
  'Per-user read receipts for org-scoped app_notifications.';
