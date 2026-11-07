-- Replaces create_profile_and_organization_on_signup / on_auth_user_created.
-- Self-serve Auth insert always writes public.profiles.
-- account_kind=internal is not a second identity: it only skips a personal org
-- (same as a valid invite). Console grants are inserted by the orchestrator
-- in 20261107120700_create_internal_user_roles.sql.
--
-- Orchestrator routes; these workers write.
--
-- Decision order (auth_users_after_insert, defined in 20261107120700):
--   1. created_via_admin     → Users UI already wrote profiles + membership. Stop.
--   2. profiles_insert_for_auth_user
--   3. account_kind=internal → grant + no personal org. Stop. Any email.
--   4. invitations_accept_for_auth_user → join inviting org if token applies. Stop.
--   5. else organizations_insert_personal_for_auth_user

-- ---------------------------------------------------------------------------
-- Worker: profiles
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.profiles_insert_for_auth_user(p_user auth.users)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_name text;
  user_avatar_url text;
BEGIN
  user_name := COALESCE(
    p_user.raw_user_meta_data->>'full_name',
    p_user.raw_user_meta_data->>'name',
    p_user.raw_user_meta_data->>'display_name'
  );
  user_avatar_url := COALESCE(
    p_user.raw_user_meta_data->>'avatar_url',
    p_user.raw_user_meta_data->>'picture',
    p_user.raw_user_meta_data->>'photo_url',
    p_user.raw_user_meta_data->>'image'
  );

  INSERT INTO public.profiles (id, user_id, name, avatar_url, email, status, created_at, updated_at)
  VALUES (
    p_user.id,
    p_user.id,
    user_name,
    user_avatar_url,
    p_user.email,
    'active',
    NOW(),
    NOW()
  );
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to create profile for user %: %', p_user.id, SQLERRM;
  RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION public.profiles_insert_for_auth_user(auth.users) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.profiles_insert_for_auth_user(auth.users) TO postgres;

-- ---------------------------------------------------------------------------
-- Worker: invitations (+ organization_users membership)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.invitations_accept_for_auth_user(p_user auth.users)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_token text;
  invite_record record;
BEGIN
  invite_token := NULLIF(trim(p_user.raw_user_meta_data->>'invite_token'), '');
  IF invite_token IS NULL OR p_user.email IS NULL THEN
    RETURN false;
  END IF;

  SELECT id, organization_id, role_id, email, status, expires_at
  INTO invite_record
  FROM public.invitations
  WHERE token = invite_token
  LIMIT 1;

  IF invite_record.id IS NULL
     OR invite_record.status <> 'pending'
     OR invite_record.expires_at <= NOW()
     OR lower(invite_record.email) <> lower(p_user.email)
  THEN
    RETURN false;
  END IF;

  INSERT INTO public.organization_users (id, organization_id, user_id, role_id, created_at, updated_at)
  SELECT
    gen_random_uuid(),
    invite_record.organization_id,
    p_user.id,
    invite_record.role_id,
    NOW(),
    NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM public.organization_users
    WHERE organization_id = invite_record.organization_id
      AND user_id = p_user.id
  );

  UPDATE public.invitations
  SET
    status = 'accepted',
    accepted_by_user_id = p_user.id,
    accepted_at = NOW(),
    updated_at = NOW()
  WHERE id = invite_record.id
    AND status = 'pending';

  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to accept invitation for user %: %', p_user.id, SQLERRM;
  RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION public.invitations_accept_for_auth_user(auth.users) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.invitations_accept_for_auth_user(auth.users) TO postgres;

-- ---------------------------------------------------------------------------
-- Worker: organizations (personal org + owner membership)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.organizations_insert_personal_for_auth_user(p_user auth.users)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_name text;
  org_name text;
  org_id uuid;
BEGIN
  user_name := COALESCE(
    p_user.raw_user_meta_data->>'full_name',
    p_user.raw_user_meta_data->>'name',
    p_user.raw_user_meta_data->>'display_name'
  );

  org_name := CASE
    WHEN user_name IS NULL OR trim(user_name) = '' THEN 'My Organization'
    WHEN array_length(string_to_array(trim(user_name), ' '), 1) > 2
      THEN (string_to_array(trim(user_name), ' '))[1] || ' Org'
    ELSE trim(user_name) || ' Org'
  END;

  org_id := gen_random_uuid();

  INSERT INTO public.organizations (id, owner_id, name, status, created_at, updated_at)
  VALUES (org_id, p_user.id, org_name, 'active', NOW(), NOW());

  INSERT INTO public.organization_users (id, organization_id, user_id, role_id, created_at, updated_at)
  VALUES (gen_random_uuid(), org_id, p_user.id, NULL, NOW(), NOW());
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to create organization for user %: %', p_user.id, SQLERRM;
END;
$$;

REVOKE ALL ON FUNCTION public.organizations_insert_personal_for_auth_user(auth.users) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.organizations_insert_personal_for_auth_user(auth.users) TO postgres;
