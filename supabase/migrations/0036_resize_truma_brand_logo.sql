-- The supplied Truma artwork has a large white canvas around the mark.
-- Point the brand card to the cropped local version for a consistent visual size.
with updated_sections as (
  select jsonb_agg(
    case
      when section.value ->> 'id' = 'brands' then jsonb_set(
        section.value,
        '{items}',
        (
          select jsonb_agg(
            case
              when item.value ->> 'id' = 'truma' then (item.value - 'filter') || jsonb_build_object('image', '/partners/logos/truma-cropped.webp')
              else item.value
            end
            order by item.ordinality
          )
          from jsonb_array_elements(section.value -> 'items') with ordinality as item(value, ordinality)
        )
      )
      else section.value
    end
    order by section.ordinality
  ) as sections
  from site_pages,
    jsonb_array_elements(content -> 'sections') with ordinality as section(value, ordinality)
  where key = 'home'
)
update site_pages
set content = jsonb_set(content, '{sections}', coalesce(updated_sections.sections, '[]'::jsonb)),
    updated_at = now(),
    updated_by = null
from updated_sections
where key = 'home';
