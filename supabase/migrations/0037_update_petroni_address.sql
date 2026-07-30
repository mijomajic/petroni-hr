-- Correct the public business address in the persisted contact-page CMS content.
-- The application fallback and structured data are updated alongside this migration.

-- Cover any older address instances in CMS text, including pages that an
-- administrator may have edited after the initial CMS seed.
update site_pages
set content = replace(
  replace(
    replace(
      replace(
        replace(
          content::text,
          'Slavka%20Tomerlina%209%2C%2010380%20Sesvete%2C%20Zagreb',
          'Ul.%20Slavka%20Tomerlina%208%2C%2010360%20Sesvete'
        ),
        'Slavka%20Tomerlina%209',
        'Ul.%20Slavka%20Tomerlina%208'
      ),
      'Slavka Tomerlina 9, 10380 Sesvete, Zagreb',
      'Ul. Slavka Tomerlina 8, 10360 Sesvete'
    ),
    'Slavka Tomerlina 9',
    'Ul. Slavka Tomerlina 8'
  ),
  '10380 Sesvete',
  '10360 Sesvete'
)::jsonb,
updated_at = now()
where content::text like '%Slavka Tomerlina 9%'
   or content::text like '%10380 Sesvete%';

with updated_contact_sections as (
  select
    page.key,
    jsonb_agg(
      case
        when section.value ->> 'id' = 'contact' then jsonb_set(
          section.value,
          '{items}',
          (
            select jsonb_agg(
              case item.value ->> 'id'
                when 'address' then jsonb_set(
                  item.value,
                  '{body}',
                  jsonb_build_object(
                    'hr', 'Ul. Slavka Tomerlina 8, 10360 Sesvete',
                    'en', 'Ul. Slavka Tomerlina 8, 10360 Sesvete'
                  )
                )
                when 'map' then jsonb_set(
                  jsonb_set(
                    item.value,
                    '{body}',
                    jsonb_build_object(
                      'hr', E'Petroni d.o.o.\nUl. Slavka Tomerlina 8, 10360 Sesvete',
                      'en', E'Petroni d.o.o.\nUl. Slavka Tomerlina 8, 10360 Sesvete'
                    )
                  ),
                  '{href}',
                  to_jsonb('https://www.google.com/maps/search/?api=1&query=Ul.%20Slavka%20Tomerlina%208%2C%2010360%20Sesvete'::text)
                )
                else item.value
              end
              order by item.ordinality
            )
            from jsonb_array_elements(coalesce(section.value -> 'items', '[]'::jsonb)) with ordinality as item(value, ordinality)
          )
        )
        else section.value
      end
      order by section.ordinality
    ) as sections
  from site_pages as page
  cross join lateral jsonb_array_elements(coalesce(page.content -> 'sections', '[]'::jsonb)) with ordinality as section(value, ordinality)
  where page.key = 'contact'
  group by page.key
)
update site_pages as page
set content = jsonb_set(page.content, '{sections}', updated_contact_sections.sections),
    updated_at = now()
from updated_contact_sections
where page.key = updated_contact_sections.key;
