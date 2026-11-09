-- Each project has a supervisor, who is an employee in the same organization.
-- Existing projects are assigned the organization's first active employee.

ALTER TABLE public.projects
  ADD COLUMN supervisor_employee_id uuid REFERENCES public.employees (id) ON DELETE RESTRICT;

UPDATE public.projects AS project
SET supervisor_employee_id = employee.id
FROM (
  SELECT DISTINCT ON (organization_id) id, organization_id
  FROM public.employees
  WHERE status = 'active'
  ORDER BY organization_id, created_at
) AS employee
WHERE project.supervisor_employee_id IS NULL
  AND employee.organization_id = project.organization_id;

ALTER TABLE public.projects
  ALTER COLUMN supervisor_employee_id SET NOT NULL;

CREATE INDEX projects_supervisor_employee_id_idx
  ON public.projects (supervisor_employee_id);
