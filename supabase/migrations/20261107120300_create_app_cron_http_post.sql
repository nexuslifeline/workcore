-- Shared helper for pg_cron jobs that HTTP-call the Next.js app.
-- Secrets live in Supabase Vault (not in this migration):
--   app_base_url    → e.g. https://app.example.com  (no trailing slash)
--   app_cron_secret → same value as app CRON_SECRET

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

CREATE OR REPLACE FUNCTION public.app_cron_http_post(
  p_path text,
  p_body jsonb DEFAULT '{}'::jsonb
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault, extensions, net
AS $$
DECLARE
  v_base_url text;
  v_cron_secret text;
  v_url text;
  v_request_id bigint;
BEGIN
  IF p_path IS NULL OR left(p_path, 1) <> '/' THEN
    RAISE EXCEPTION 'app_cron_http_post: p_path must start with /';
  END IF;

  SELECT ds.decrypted_secret INTO v_base_url
  FROM vault.decrypted_secrets AS ds
  WHERE ds.name = 'app_base_url'
  LIMIT 1;

  SELECT ds.decrypted_secret INTO v_cron_secret
  FROM vault.decrypted_secrets AS ds
  WHERE ds.name = 'app_cron_secret'
  LIMIT 1;

  IF v_base_url IS NULL OR btrim(v_base_url) = '' THEN
    RAISE EXCEPTION 'Vault secret app_base_url is missing or empty';
  END IF;
  IF v_cron_secret IS NULL OR btrim(v_cron_secret) = '' THEN
    RAISE EXCEPTION 'Vault secret app_cron_secret is missing or empty';
  END IF;

  v_base_url := regexp_replace(btrim(v_base_url), '/$', '');
  v_url := v_base_url || p_path;

  SELECT net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || btrim(v_cron_secret)
    ),
    body := COALESCE(p_body, '{}'::jsonb),
    timeout_milliseconds := 60000
  )
  INTO v_request_id;

  RETURN v_request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.app_cron_http_post(text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.app_cron_http_post(text, jsonb) TO postgres;
