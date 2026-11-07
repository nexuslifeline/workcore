-- High-privilege migration for shared-media storage policy.
-- This should be applied using the Supabase CLI (which runs as a privileged role),
-- not via Drizzle/app migrations.
--
-- Organization logos and profile images upload to this bucket.

insert into storage.buckets (id, name, public)
values ('shared-media', 'shared-media', true)
on conflict (id) do nothing;

-- Allow authenticated users to manage objects in the shared-media bucket.
drop policy if exists "authenticated can manage shared-media" on storage.objects;

create policy "authenticated can manage shared-media"
on storage.objects
for all
using (
  bucket_id = 'shared-media'
  and auth.role() = 'authenticated'
)
with check (
  bucket_id = 'shared-media'
  and auth.role() = 'authenticated'
);
