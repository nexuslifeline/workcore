-- Organization holidays used by payroll.
-- Recurring holidays store one date. The list expands them by month and day.
-- Uses the existing settings_payroll permission.

CREATE TYPE public.holiday_type AS ENUM ('regular_holiday', 'special_holiday');

CREATE TABLE public.holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  date date NOT NULL,
  name text NOT NULL,
  description text,
  type public.holiday_type NOT NULL,
  is_recurring boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX holidays_organization_id_date_idx ON public.holidays (organization_id, date);
