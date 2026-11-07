-- Allow authenticated users to read their own grant (RLS still restricts to user_id = auth.uid()).
GRANT SELECT ON TABLE public.internal_user_roles TO authenticated, service_role;
