-- Baseline public schema: enums, tables, foreign keys, and indexes.
-- Ordering: this runs before signup triggers, seeds, and later feature migrations.

CREATE TYPE public.profile_status AS ENUM ('active', 'suspended', 'inactive', 'pending');
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'revoked', 'expired');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  name text,
  bio text,
  avatar_url text,
  phone text,
  email text,
  website text,
  birthdate timestamp,
  address text,
  locale text,
  status public.profile_status NOT NULL DEFAULT 'active',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  name text NOT NULL,
  description text,
  logo_url text,
  address text,
  phone text,
  email text,
  website text,
  contact_person text,
  industry text,
  status text DEFAULT 'active',
  currency_code text NOT NULL DEFAULT 'PHP',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE public.organization_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role_id uuid REFERENCES public.roles (id) ON DELETE RESTRICT,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE TABLE public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  "group" text,
  parent_code text
);

CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.roles (id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.permissions (id) ON DELETE CASCADE,
  is_allowed boolean NOT NULL DEFAULT false,
  UNIQUE (role_id, permission_id)
);

CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  email text NOT NULL,
  role_id uuid NOT NULL REFERENCES public.roles (id) ON DELETE RESTRICT,
  message text,
  token text NOT NULL UNIQUE,
  status public.invitation_status NOT NULL DEFAULT 'pending',
  invited_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  accepted_by_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  expires_at timestamp NOT NULL,
  accepted_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX invitation_lookup_idx
  ON public.invitations (organization_id, email, status);
