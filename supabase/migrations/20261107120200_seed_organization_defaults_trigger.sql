-- Seed organization defaults trigger and function.
-- Same trigger as the finance suite (trigger_seed_organization_defaults).
-- New organizations receive Admin and Member roles only.
-- Chart of accounts, units, tax types, and subscriptions are not seeded.
-- Permissions are assigned later in the Roles UI.

CREATE OR REPLACE FUNCTION public.seed_organization_defaults()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.roles (organization_id, name, description, is_active)
  VALUES
    (NEW.id, 'Admin', 'Administrator role', true),
    (NEW.id, 'Member', 'Member role', true);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to seed default roles for organization %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_seed_organization_defaults ON public.organizations;
CREATE TRIGGER trigger_seed_organization_defaults
  AFTER INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_organization_defaults();
