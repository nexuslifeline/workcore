-- Seed default permissions.
-- `code` values are stable snake_case slugs (see lib/constants/permission-codes.ts).
-- Idempotent: ON CONFLICT (code) DO NOTHING.
--
-- No role_permissions backfill: assign explicitly in the Roles UI.
-- Organization owners already receive all permissions in-app (no roleId).

INSERT INTO public.permissions (code, name, description, "group", parent_code)
VALUES
  ('dashboard', 'Dashboard', 'Access the workspace home.', null, null),
  ('system_users', 'Users', 'View and manage users and invitations.', null, null),
  ('system_roles', 'Roles', 'View and manage roles and permissions.', null, null),
  ('system_organizations', 'Organizations', 'View and manage organizations.', null, null),
  ('settings_organization', 'Organization Settings', 'Update organization profile and contact details.', 'Settings', null)
ON CONFLICT (code) DO NOTHING;
