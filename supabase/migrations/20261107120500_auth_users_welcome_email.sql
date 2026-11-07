-- After auth.users is confirmed, enqueue a welcome email via the app jobs API.
-- Depends on: 20261107120300_create_app_cron_http_post.sql
-- Vault: app_base_url, app_cron_secret
--
-- Fires when:
--   INSERT and email_confirmed_at is already set (OAuth / pre-confirmed)
--   UPDATE of email_confirmed_at from null → set (email confirm click)
--
-- pg_net http_post only queues the request (returns request_id). The Auth
-- transaction does not wait for the Next.js / SMTP work.
-- HTTP failures must never roll back signup or confirm.
-- Internal accounts (account_kind=internal) are skipped.

CREATE OR REPLACE FUNCTION public.auth_users_after_email_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.email_confirmed_at IS NOT NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.email IS NULL OR btrim(NEW.email) = '' THEN
    RETURN NEW;
  END IF;
  IF NEW.raw_user_meta_data IS NOT NULL
     AND lower(trim(COALESCE(NEW.raw_user_meta_data->>'account_kind', ''))) = 'internal'
  THEN
    RETURN NEW;
  END IF;

  BEGIN
    PERFORM public.app_cron_http_post(
      '/api/auth/jobs/send-welcome-email',
      jsonb_build_object('userId', NEW.id)
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'auth_users_after_email_confirmed: enqueue failed for %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.auth_users_after_email_confirmed() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_users_after_email_confirmed() TO postgres;

DROP TRIGGER IF EXISTS auth_users_after_email_confirmed_trg ON auth.users;
CREATE TRIGGER auth_users_after_email_confirmed_trg
  AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auth_users_after_email_confirmed();
