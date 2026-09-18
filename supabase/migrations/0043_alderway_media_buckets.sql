-- New Alderway deployments use neutral media bucket names. Existing legacy
-- objects stay readable in their original buckets; new uploads use these.

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('alderway-media', 'alderway-media', true, 15728640, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('alderway-media-originals', 'alderway-media-originals', false, 15728640, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

alter table media_assets
  alter column original_bucket set default 'alderway-media-originals',
  alter column public_bucket set default 'alderway-media';

drop policy if exists "Public read Alderway media" on storage.objects;
create policy "Public read Alderway media"
  on storage.objects for select
  using (bucket_id = 'alderway-media');

commit;
