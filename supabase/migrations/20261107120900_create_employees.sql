-- Employee records scoped to an organization.
-- code is unique together with organization_id.
--
-- Registers the employees permission.
-- No role_permissions backfill: assign explicitly in the Roles UI.
-- Organization owners already receive all permissions in-app (no roleId).

CREATE TYPE public.employee_gender AS ENUM ('male', 'female');
CREATE TYPE public.employee_status AS ENUM ('active', 'inactive');

CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  birthdate date,
  tin text,
  gender public.employee_gender NOT NULL,
  current_address text,
  home_address text,
  contact_number text,
  sss_number text,
  philhealth_number text,
  status public.employee_status NOT NULL DEFAULT 'active',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT employees_organization_code_unique UNIQUE (organization_id, code)
);

INSERT INTO public.permissions (code, name, description, "group", parent_code)
VALUES
  ('employees', 'Employees', 'View and manage employee records.', null, null)
ON CONFLICT (code) DO NOTHING;
