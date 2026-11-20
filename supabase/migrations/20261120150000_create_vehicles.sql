-- Vehicles and driver route logs scoped to an organization.
-- plate_number is unique together with organization_id.
--
-- Registers vehicles and driver_route_logs permissions.
-- No role_permissions backfill: assign explicitly in the Roles UI.
-- Organization owners already receive all permissions in-app (no roleId).

CREATE TYPE public.driver_route_log_status AS ENUM (
  'scheduled',
  'in_transit',
  'completed',
  'cancelled'
);

CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  plate_number text NOT NULL,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT vehicles_organization_plate_number_unique UNIQUE (organization_id, plate_number)
);

CREATE INDEX vehicles_organization_id_idx
  ON public.vehicles (organization_id);

CREATE TABLE public.driver_route_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles (id) ON DELETE RESTRICT,
  employee_id uuid NOT NULL REFERENCES public.employees (id) ON DELETE RESTRICT,
  origin text NOT NULL,
  destination text NOT NULL,
  start_datetime timestamptz NOT NULL,
  end_datetime timestamptz,
  starting_odometer numeric(12, 1),
  ending_odometer numeric(12, 1),
  status public.driver_route_log_status NOT NULL DEFAULT 'scheduled',
  notes text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT driver_route_logs_starting_odometer_non_negative
    CHECK (starting_odometer IS NULL OR starting_odometer >= 0),
  CONSTRAINT driver_route_logs_ending_odometer_non_negative
    CHECK (ending_odometer IS NULL OR ending_odometer >= 0),
  CONSTRAINT driver_route_logs_odometer_order
    CHECK (
      ending_odometer IS NULL
      OR starting_odometer IS NULL
      OR ending_odometer >= starting_odometer
    ),
  CONSTRAINT driver_route_logs_end_after_start
    CHECK (end_datetime IS NULL OR end_datetime >= start_datetime)
);

CREATE INDEX driver_route_logs_organization_id_idx
  ON public.driver_route_logs (organization_id);

CREATE INDEX driver_route_logs_vehicle_start_idx
  ON public.driver_route_logs (vehicle_id, start_datetime);

CREATE INDEX driver_route_logs_employee_start_idx
  ON public.driver_route_logs (employee_id, start_datetime);

INSERT INTO public.permissions (code, name, description, "group", parent_code)
VALUES
  ('vehicles', 'Vehicles', 'View and manage vehicles.', null, null),
  ('driver_route_logs', 'Driver route logs', 'View and manage driver route logs.', null, null)
ON CONFLICT (code) DO NOTHING;
