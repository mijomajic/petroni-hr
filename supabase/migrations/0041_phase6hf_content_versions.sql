-- Phase 6H-F: drafts, publication history and safe restore for public pages
-- and news posts. Published data remains in the existing tables so public
-- reads keep their narrow, established RLS surface.

create table if not exists site_page_versions (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  version_number integer not null check (version_number > 0),
  status text not null check (status in ('draft', 'published', 'archived')),
  content jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  restored_from_id uuid references site_page_versions(id) on delete set null,
  unique (page_key, version_number)
);

create unique index if not exists idx_site_page_versions_one_draft
  on site_page_versions(page_key) where status = 'draft';
create unique index if not exists idx_site_page_versions_one_published
  on site_page_versions(page_key) where status = 'published';
create index if not exists idx_site_page_versions_history
  on site_page_versions(page_key, version_number desc);

insert into site_page_versions (page_key, version_number, status, content, created_at, published_at)
select key, 1, 'published', content, coalesce(updated_at, now()), coalesce(updated_at, now())
from site_pages
on conflict (page_key, version_number) do nothing;

alter table site_page_versions enable row level security;
revoke all on site_page_versions from anon, authenticated;

create table if not exists post_versions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  status text not null check (status in ('draft', 'published', 'archived')),
  content jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  restored_from_id uuid references post_versions(id) on delete set null,
  unique (post_id, version_number)
);

create index if not exists idx_post_versions_history
  on post_versions(post_id, version_number desc);

insert into post_versions (post_id, version_number, status, content, created_at)
select
  id,
  1,
  case when is_published then 'published' else 'draft' end,
  jsonb_build_object(
    'title_hr', title_hr, 'title_en', title_en, 'slug', slug,
    'excerpt_hr', excerpt_hr, 'content_hr', content_hr, 'content_en', content_en,
    'cover_image', cover_image, 'is_published', is_published, 'published_at', published_at
  ),
  created_at
from posts
on conflict (post_id, version_number) do nothing;

alter table post_versions enable row level security;
revoke all on post_versions from anon, authenticated;
