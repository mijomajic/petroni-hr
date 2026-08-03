-- Phase 6H-F: Petroni-owned media inventory. Originals remain private while
-- optimised public derivatives are served from the public media bucket.

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'active' check (status in ('active', 'archived')),
  original_bucket text not null default 'petroni-media-originals',
  original_path text not null unique,
  public_bucket text not null default 'petroni-media',
  public_path text not null unique,
  public_url text not null,
  original_filename text not null,
  original_mime_type text not null,
  original_bytes bigint not null check (original_bytes > 0),
  width integer check (width > 0),
  height integer check (height > 0),
  alt_hr text not null default '',
  alt_en text not null default '',
  provenance text not null default '',
  license_note text not null default '',
  checksum_sha256 text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  archived_at timestamptz,
  archived_by uuid references auth.users(id) on delete set null
);

create index if not exists idx_media_assets_active_created
  on media_assets(status, created_at desc);

alter table media_assets enable row level security;
revoke all on media_assets from anon, authenticated;

-- Public derivatives only. The original bucket deliberately has no public
-- read policy: it is available only through an authorised server operation.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('petroni-media', 'petroni-media', true, 15728640, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('petroni-media-originals', 'petroni-media-originals', false, 15728640, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read Petroni media derivatives" on storage.objects;
create policy "Public read Petroni media derivatives"
  on storage.objects for select
  using (bucket_id = 'petroni-media');
