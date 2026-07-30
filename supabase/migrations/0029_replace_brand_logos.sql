-- Use the client-supplied raster logos even when the home-page CMS content was
-- previously saved rather than falling back to the source defaults.
update site_pages
set content = replace(
      replace(
        replace(
          replace(content::text,
            '/partners/logos/rimor.svg', '/partners/logos/rimor.jpg'),
          '/partners/logos/caravans-international.svg', '/partners/logos/caravans-international.jpg'),
        '/partners/logos/truma.svg', '/partners/logos/truma.jpg'),
      '/partners/logos/weinsberg.png', '/partners/logos/weinsberg.jpg'
    )::jsonb,
    updated_at = now(),
    updated_by = null
where key = 'home';
