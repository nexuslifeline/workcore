-- Grant table: this Auth/profile user has an internal console role (admin | partner).
-- Not a second identity. Signup path 3 (account_kind=internal) inserts a row after profiles.
--
-- Depends on: 20261107120600_signup_always_create_profile.sql

CREATE TYPE public.internal_user_role AS ENUM ('admin', 'partner');
CREATE TYPE public.internal_user_role_status AS ENUM ('pending', 'active', 'suspended');

CREATE TABLE public.internal_user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  role public.internal_user_role NOT NULL DEFAULT 'admin',
  status public.internal_user_role_status NOT NULL DEFAULT 'pending',
  notes text,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.internal_user_roles IS
  'Grant of an internal console role to an existing Auth user. Identity is public.profiles.';

ALTER TABLE public.internal_user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY internal_user_roles_select_own
  ON public.internal_user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Worker: internal_user_roles
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.internal_user_roles_insert_for_auth_user(p_user auth.users)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  grant_role public.internal_user_role;
BEGIN
  IF lower(trim(COALESCE(p_user.raw_user_meta_data->>'internal_role', ''))) = 'partner' THEN
    grant_role := 'partner';
  ELSE
    grant_role := 'admin';
  END IF;

  INSERT INTO public.internal_user_roles (user_id, role, status, created_at, updated_at)
  VALUES (p_user.id, grant_role, 'pending', NOW(), NOW());
END;
$$;

REVOKE ALL ON FUNCTION public.internal_user_roles_insert_for_auth_user(auth.users) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.internal_user_roles_insert_for_auth_user(auth.users) TO postgres;

-- ---------------------------------------------------------------------------
-- Orchestrator: insert the grant on path 3, then skip personal org.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.auth_users_after_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  created_via_admin boolean;
  account_kind text;
BEGIN
  created_via_admin := (NEW.raw_user_meta_data->>'created_via_admin') = 'true';
  account_kind := lower(trim(COALESCE(NEW.raw_user_meta_data->>'account_kind', '')));

  IF created_via_admin THEN
    RETURN NEW;
  END IF;

  IF NOT public.profiles_insert_for_auth_user(NEW) THEN
    RETURN NEW;
  END IF;

  IF account_kind = 'internal' THEN
    PERFORM public.internal_user_roles_insert_for_auth_user(NEW);
    RETURN NEW;
  END IF;

  IF public.invitations_accept_for_auth_user(NEW) THEN
    RETURN NEW;
  END IF;

  PERFORM public.organizations_insert_personal_for_auth_user(NEW);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auth_users_after_insert_trg ON auth.users;
CREATE TRIGGER auth_users_after_insert_trg
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auth_users_after_insert();
