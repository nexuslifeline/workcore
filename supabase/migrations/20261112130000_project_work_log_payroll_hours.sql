-- Allocation date, unpaid break, and payroll rule snapshot for project work logs.
-- Overtime, regular hours, night differential, and total_amount are generated
-- from columns on this row so a later payroll settings change does not rewrite history.
-- Night windows use Asia/Manila, matching the 22:00–06:00 payroll clock.

ALTER TABLE public.project_work_logs
  ADD COLUMN work_date date,
  ADD COLUMN break_minutes integer,
  ADD COLUMN max_regular_shift_hours integer,
  ADD COLUMN nsd_start_time time,
  ADD COLUMN nsd_end_time time;

UPDATE public.project_work_logs AS wl
SET
  work_date = (wl.start_datetime AT TIME ZONE 'Asia/Manila')::date,
  break_minutes = LEAST(
    COALESCE(ps.default_break_minutes, 60),
    FLOOR(EXTRACT(EPOCH FROM (wl.end_datetime - wl.start_datetime)) / 60.0)::integer
  ),
  max_regular_shift_hours = COALESCE(ps.max_regular_shift_hours, 8),
  nsd_start_time = COALESCE(ps.night_shift_differential_start_time, TIME '22:00:00'),
  nsd_end_time = COALESCE(ps.night_shift_differential_end_time, TIME '06:00:00')
FROM public.projects AS p
LEFT JOIN public.payroll_setup AS ps ON ps.organization_id = p.organization_id
WHERE wl.project_id = p.id;

UPDATE public.project_work_logs
SET
  work_date = COALESCE(work_date, (start_datetime AT TIME ZONE 'Asia/Manila')::date),
  break_minutes = COALESCE(
    break_minutes,
    LEAST(
      60,
      FLOOR(EXTRACT(EPOCH FROM (end_datetime - start_datetime)) / 60.0)::integer
    )
  ),
  max_regular_shift_hours = COALESCE(max_regular_shift_hours, 8),
  nsd_start_time = COALESCE(nsd_start_time, TIME '22:00:00'),
  nsd_end_time = COALESCE(nsd_end_time, TIME '06:00:00')
WHERE
  work_date IS NULL
  OR break_minutes IS NULL
  OR max_regular_shift_hours IS NULL
  OR nsd_start_time IS NULL
  OR nsd_end_time IS NULL;

ALTER TABLE public.project_work_logs
  ALTER COLUMN work_date SET NOT NULL,
  ALTER COLUMN break_minutes SET NOT NULL,
  ALTER COLUMN max_regular_shift_hours SET NOT NULL,
  ALTER COLUMN nsd_start_time SET NOT NULL,
  ALTER COLUMN nsd_end_time SET NOT NULL;

ALTER TABLE public.project_work_logs
  ADD CONSTRAINT project_work_logs_work_date_within_shift CHECK (
    work_date >= (start_datetime AT TIME ZONE 'Asia/Manila')::date
    AND work_date <= (end_datetime AT TIME ZONE 'Asia/Manila')::date
  ),
  ADD CONSTRAINT project_work_logs_break_minutes_within_shift CHECK (
    break_minutes >= 0
    AND break_minutes * 60 <= EXTRACT(EPOCH FROM (end_datetime - start_datetime))
  ),
  ADD CONSTRAINT project_work_logs_max_regular_shift_hours_range CHECK (
    max_regular_shift_hours >= 1
    AND max_regular_shift_hours <= 24
  );

ALTER TABLE public.project_work_logs
  DROP COLUMN total_amount;

ALTER TABLE public.project_work_logs
  ADD COLUMN total_amount numeric(14, 2) GENERATED ALWAYS AS (
    ROUND(
      hourly_rate * GREATEST(
        0,
        (EXTRACT(EPOCH FROM (end_datetime - start_datetime)) / 3600.0) - (break_minutes / 60.0)
      )::numeric,
      2
    )
  ) STORED,
  ADD COLUMN total_overtime_hours numeric(14, 2) GENERATED ALWAYS AS (
    ROUND(
      GREATEST(
        0,
        (EXTRACT(EPOCH FROM (end_datetime - start_datetime)) / 3600.0)
          - (break_minutes / 60.0)
          - max_regular_shift_hours
      )::numeric,
      2
    )
  ) STORED,
  ADD COLUMN total_regular_hours numeric(14, 2) GENERATED ALWAYS AS (
    ROUND(
      LEAST(
        GREATEST(
          0,
          (EXTRACT(EPOCH FROM (end_datetime - start_datetime)) / 3600.0) - (break_minutes / 60.0)
        ),
        max_regular_shift_hours
      )::numeric,
      2
    )
  ) STORED,
  ADD COLUMN total_night_shift_differential_hours numeric(14, 2) GENERATED ALWAYS AS (
    ROUND(
      LEAST(
        GREATEST(
          0,
          (EXTRACT(EPOCH FROM (end_datetime - start_datetime)) / 3600.0) - (break_minutes / 60.0)
        ),
        GREATEST(
          0,
          EXTRACT(EPOCH FROM (
            LEAST(
              end_datetime,
              ((work_date + 1) + nsd_end_time) AT TIME ZONE 'Asia/Manila'
            )
            - GREATEST(
              start_datetime,
              (work_date + nsd_start_time) AT TIME ZONE 'Asia/Manila'
            )
          )) / 3600.0
        )
      )::numeric,
      2
    )
  ) STORED;

CREATE INDEX project_work_logs_employee_work_date_idx
  ON public.project_work_logs (employee_id, work_date);
