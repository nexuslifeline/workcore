-- Profile photo for an employee, stored as a public shared-media URL.

ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS image_url text;
