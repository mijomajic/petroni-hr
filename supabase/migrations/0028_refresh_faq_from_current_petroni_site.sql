-- Refresh the CMS record so the FAQ uses the current source-matched default
-- content introduced with this release. Editors can continue maintaining it in
-- Admin > Javne stranice > FAQ after this migration.
update site_pages
set content = '{}'::jsonb,
    updated_at = now(),
    updated_by = null
where key = 'faq';
