-- One payroll setup row per organization.
-- Seeded by seed_organization_defaults when an organization is created.
-- Existing organizations are backfilled below.
--
-- Registers the settings_payroll permission.
-- No role_permissions backfill: assign explicitly in the Roles UI.
-- Organization owners already receive all permissions in-app (no roleId).

CREATE TABLE public.payroll_setup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  default_break_minutes integer NOT NULL DEFAULT 60,
  max_regular_shift_hours integer NOT NULL DEFAULT 8,
  night_shift_differential_start_time time NOT NULL DEFAULT '22:00:00',
  night_shift_differential_end_time time NOT NULL DEFAULT '06:00:00',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT payroll_setup_organization_id_unique UNIQUE (organization_id),
  CONSTRAINT payroll_setup_default_break_minutes_non_negative CHECK (default_break_minutes >= 0),
  CONSTRAINT payroll_setup_max_regular_shift_hours_range CHECK (
    max_regular_shift_hours >= 1 AND max_regular_shift_hours <= 24
  )
);

CREATE OR REPLACE FUNCTION public.seed_organization_defaults()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.roles (organization_id, name, description, is_active)
  VALUES
    (NEW.id, 'Admin', 'Administrator role', true),
    (NEW.id, 'Member', 'Member role', true);

  INSERT INTO public.payroll_setup (organization_id)
  VALUES (NEW.id);

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to seed defaults for organization %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

INSERT INTO public.payroll_setup (organization_id)
SELECT o.id
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.payroll_setup ps WHERE ps.organization_id = o.id
);

INSERT INTO public.permissions (code, name, description, "group", parent_code)
VALUES
  ('settings_payroll', 'Payroll Settings', 'Update default payroll settings for the organization.', 'Settings', null)
ON CONFLICT (code) DO NOTHING;
