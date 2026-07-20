-- Phase 6F: structured bilingual CMS for content-heavy public pages.

create table if not exists site_pages (
  key text primary key,
  label text not null,
  route text not null unique,
  content jsonb not null default '{}'::jsonb,
  is_published boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  check (key in ('home', 'about', 'contact', 'faq')),
  check (jsonb_typeof(content) = 'object')
);

insert into site_pages (key, label, route, content, is_published) values
  ('home', 'Naslovnica', '/', '{}'::jsonb, true),
  ('about', 'O nama', '/o-nama', '{}'::jsonb, true),
  ('contact', 'Kontakt', '/kontakt', '{}'::jsonb, true),
  ('faq', 'FAQ', '/faq', '{}'::jsonb, true)
on conflict (key) do update set
  label = excluded.label,
  route = excluded.route;

alter table site_pages enable row level security;

drop policy if exists "Published site pages are public" on site_pages;
create policy "Published site pages are public"
  on site_pages for select
  using (is_published = true);

revoke all on site_pages from anon, authenticated;
grant select on site_pages to anon, authenticated;

-- Writes intentionally have no browser policy. The protected admin actions use
-- the server-only service-role client and validate every submitted section.

create index if not exists idx_site_pages_published
  on site_pages (is_published, key);
