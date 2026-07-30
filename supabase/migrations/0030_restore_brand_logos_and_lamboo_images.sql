-- Restore the original Weinsberg and Truma artwork without CSS filters,
-- and attach the supplied Lamboo Iveco Daily gallery to its sale listing.
with updated_sections as (
  select jsonb_agg(
    case
      when section.value ->> 'id' = 'brands' then jsonb_set(
        section.value,
        '{items}',
        (
          select jsonb_agg(
            case item.value ->> 'id'
              when 'truma' then (item.value - 'filter') || jsonb_build_object('image', '/partners/logos/truma.svg')
              when 'weinsberg' then (item.value - 'filter') || jsonb_build_object('image', '/partners/logos/weinsberg.png')
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

update vehicles
set images = array[
  '/images/vehicles/tegljac-lamboo-iveco-daily/01-img-20190719-093936.webp',
  '/images/vehicles/tegljac-lamboo-iveco-daily/02-img-20190719-095209.webp',
  '/images/vehicles/tegljac-lamboo-iveco-daily/03-img-20190719-100031.webp',
  '/images/vehicles/tegljac-lamboo-iveco-daily/04-img-20190719-100243.webp',
  '/images/vehicles/tegljac-lamboo-iveco-daily/05-img-20190719-100259-1.webp',
  '/images/vehicles/tegljac-lamboo-iveco-daily/06-img-20190719-100334.webp',
  '/images/vehicles/tegljac-lamboo-iveco-daily/07-img-20190719-100341.webp',
  '/images/vehicles/tegljac-lamboo-iveco-daily/08-img-20190719-100425-1.webp',
  '/images/vehicles/tegljac-lamboo-iveco-daily/09-img-20190719-100446.webp',
  '/images/vehicles/tegljac-lamboo-iveco-daily/10-img-20190719-100612.webp',
  '/images/vehicles/tegljac-lamboo-iveco-daily/11-img-20190719-101044-1.webp',
  '/images/vehicles/tegljac-lamboo-iveco-daily/12-img-20190719-101046.webp'
]
where slug = 'tegljac-lamboo-iveco-daily';
