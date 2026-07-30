-- Restore the original Rimor and Caravans International artwork. The Knaus and
-- Mega Mobil marks use high-contrast local variants so their white lettering is
-- visible on the landing page's white logo cards.
with updated_sections as (
  select jsonb_agg(
    case
      when section.value ->> 'id' = 'brands' then jsonb_set(
        section.value,
        '{items}',
        (
          select jsonb_agg(
            case item.value ->> 'id'
              when 'rimor' then (item.value - 'filter') || jsonb_build_object('image', '/partners/logos/rimor.svg')
              when 'caravans-international' then (item.value - 'filter') || jsonb_build_object('image', '/partners/logos/caravans-international.svg')
              when 'knaus' then (item.value - 'filter') || jsonb_build_object('image', '/partners/logos/knaus-dark.png')
              when 'mega-mobil' then (item.value - 'filter') || jsonb_build_object('image', '/partners/logos/mega-mobil-dark.png')
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
