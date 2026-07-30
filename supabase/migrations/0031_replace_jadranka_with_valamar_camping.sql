-- Camping Adriatic has been rebranded as Valamar Camping. Replace the unrelated
-- Jadranka/Cres & Lošinj card with Valamar's current official wordmark and URL.
with updated_sections as (
  select jsonb_agg(
    case
      when section.value ->> 'id' = 'partners' then jsonb_set(
        section.value,
        '{items}',
        (
          select jsonb_agg(
            case item.value ->> 'id'
              when 'jadranka' then (item.value - 'filter') || jsonb_build_object(
                'id', 'valamar-camping',
                'title', jsonb_build_object('hr', 'Valamar Camping', 'en', 'Valamar Camping'),
                'image', '/partners/logos/valamar.svg',
                'href', 'https://www.valamarcamping.com/'
              )
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
