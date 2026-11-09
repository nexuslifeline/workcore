-- Project costing: labor work logs and non-labor expenses.
-- Spend and balance are not stored. Read them from work logs and expenses.
--
-- Registers projects and project_work_logs permissions.
-- No role_permissions backfill: assign explicitly in the Roles UI.
-- Organization owners already receive all permissions in-app (no roleId).

ALTER TABLE public.employees
  ADD COLUMN hourly_rate numeric(12, 2) NOT NULL DEFAULT 0;

ALTER TABLE public.employees
  ADD CONSTRAINT employees_hourly_rate_non_negative CHECK (hourly_rate >= 0);

CREATE TYPE public.project_status AS ENUM (
  'draft',
  'approved',
  'in_progress',
  'cancelled',
  'completed'
);

CREATE TYPE public.project_task_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'cancelled'
);

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  start_date date,
  due_date date,
  budget numeric(14, 2) NOT NULL DEFAULT 0,
  status public.project_status NOT NULL DEFAULT 'draft',
  completed_at timestamp,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT projects_organization_code_unique UNIQUE (organization_id, code),
  CONSTRAINT projects_budget_non_negative CHECK (budget >= 0)
);

CREATE INDEX projects_organization_id_status_idx
  ON public.projects (organization_id, status);

CREATE TABLE public.project_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  budget numeric(14, 2) NOT NULL DEFAULT 0,
  estimated_hours numeric(12, 2) NOT NULL DEFAULT 0,
  planned_start_date date,
  planned_end_date date,
  actual_started_at timestamp,
  actual_completed_at timestamp,
  status public.project_task_status NOT NULL DEFAULT 'pending',
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT project_tasks_id_project_id_unique UNIQUE (id, project_id),
  CONSTRAINT project_tasks_budget_non_negative CHECK (budget >= 0),
  CONSTRAINT project_tasks_estimated_hours_non_negative CHECK (estimated_hours >= 0)
);

CREATE INDEX project_tasks_project_id_idx ON public.project_tasks (project_id);

CREATE TABLE public.project_task_assignees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_task_id uuid NOT NULL REFERENCES public.project_tasks (id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees (id) ON DELETE RESTRICT,
  hourly_rate numeric(12, 2) NOT NULL,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT project_task_assignees_task_employee_unique UNIQUE (project_task_id, employee_id),
  CONSTRAINT project_task_assignees_hourly_rate_non_negative CHECK (hourly_rate >= 0)
);

CREATE TABLE public.project_work_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  project_task_id uuid NOT NULL,
  employee_id uuid NOT NULL REFERENCES public.employees (id) ON DELETE RESTRICT,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  start_datetime timestamptz NOT NULL,
  end_datetime timestamptz NOT NULL,
  hourly_rate numeric(12, 2) NOT NULL,
  total_hours numeric(14, 2) GENERATED ALWAYS AS (
    ROUND((EXTRACT(EPOCH FROM (end_datetime - start_datetime)) / 3600.0)::numeric, 2)
  ) STORED,
  total_amount numeric(14, 2) GENERATED ALWAYS AS (
    ROUND(hourly_rate * (EXTRACT(EPOCH FROM (end_datetime - start_datetime)) / 3600.0)::numeric, 2)
  ) STORED,
  notes text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT project_work_logs_task_project_fk
    FOREIGN KEY (project_task_id, project_id)
    REFERENCES public.project_tasks (id, project_id)
    ON DELETE CASCADE,
  CONSTRAINT project_work_logs_end_after_start CHECK (end_datetime > start_datetime),
  CONSTRAINT project_work_logs_hourly_rate_non_negative CHECK (hourly_rate >= 0)
);

CREATE INDEX project_work_logs_project_id_idx ON public.project_work_logs (project_id);
CREATE INDEX project_work_logs_project_task_id_idx ON public.project_work_logs (project_task_id);
CREATE INDEX project_work_logs_employee_start_idx
  ON public.project_work_logs (employee_id, start_datetime);

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.project_work_logs
  ADD CONSTRAINT project_work_logs_no_overlap
  EXCLUDE USING gist (
    employee_id WITH =,
    tstzrange(start_datetime, end_datetime, '[)') WITH &&
  );

CREATE TABLE public.project_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  reference_number text,
  expense_date date NOT NULL,
  quantity numeric(14, 3) NOT NULL DEFAULT 1,
  rate numeric(12, 2) NOT NULL,
  amount numeric(14, 2) GENERATED ALWAYS AS (ROUND(quantity * rate, 2)) STORED,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT project_expenses_quantity_positive CHECK (quantity > 0),
  CONSTRAINT project_expenses_rate_non_negative CHECK (rate >= 0)
);

CREATE INDEX project_expenses_project_id_idx ON public.project_expenses (project_id);

INSERT INTO public.permissions (code, name, description, "group", parent_code)
VALUES
  ('projects', 'Projects', 'View and manage projects, tasks, assignees, and expenses.', null, null),
  ('project_work_logs', 'Project work logs', 'Record and edit project work logs.', null, null)
ON CONFLICT (code) DO NOTHING;
