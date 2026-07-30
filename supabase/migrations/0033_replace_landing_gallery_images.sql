-- Replace the old mixed vehicle strip with the current Petroni gallery supplied
-- by the client. Duplicate source photos are intentionally excluded.
with updated_sections as (
  select jsonb_agg(
    case
      when section.value ->> 'id' = 'gallery' then jsonb_set(
        section.value,
        '{items}',
        jsonb_build_array(
          jsonb_build_object('id', 'gallery-1', 'image', '/images/home-gallery/01-krevet-u-kombiju.webp', 'alt', jsonb_build_object('hr', 'Krevet u Petroni kombi kamperu', 'en', 'Bed in a Petroni camper van')),
          jsonb_build_object('id', 'gallery-2', 'image', '/images/home-gallery/02-kuhinja-u-kombiju.webp', 'alt', jsonb_build_object('hr', 'Kuhinja u Petroni kombi kamperu', 'en', 'Kitchen in a Petroni camper van')),
          jsonb_build_object('id', 'gallery-3', 'image', '/images/home-gallery/03-prostrani-krevet.webp', 'alt', jsonb_build_object('hr', 'Prostrani krevet u kamperu', 'en', 'Spacious camper bed')),
          jsonb_build_object('id', 'gallery-4', 'image', '/images/home-gallery/04-detalj-interijera.webp', 'alt', jsonb_build_object('hr', 'Detalj interijera kampera', 'en', 'Camper interior detail')),
          jsonb_build_object('id', 'gallery-5', 'image', '/images/home-gallery/05-kupaonica.webp', 'alt', jsonb_build_object('hr', 'Kupaonica u kamperu', 'en', 'Camper bathroom')),
          jsonb_build_object('id', 'gallery-6', 'image', '/images/home-gallery/06-hladnjak.webp', 'alt', jsonb_build_object('hr', 'Hladnjak u kamperu', 'en', 'Camper refrigerator')),
          jsonb_build_object('id', 'gallery-7', 'image', '/images/home-gallery/07-kamper-interijer.webp', 'alt', jsonb_build_object('hr', 'Interijer Petroni kampera', 'en', 'Petroni camper interior')),
          jsonb_build_object('id', 'gallery-8', 'image', '/images/home-gallery/08-prostor-za-blagovanje.webp', 'alt', jsonb_build_object('hr', 'Prostor za blagovanje u kamperu', 'en', 'Camper dining area')),
          jsonb_build_object('id', 'gallery-9', 'image', '/images/home-gallery/09-kamper-dnevni-prostor.webp', 'alt', jsonb_build_object('hr', 'Dnevni prostor kampera', 'en', 'Camper lounge')),
          jsonb_build_object('id', 'gallery-10', 'image', '/images/home-gallery/10-kampiranje-uz-kamper.webp', 'alt', jsonb_build_object('hr', 'Kampiranje uz Petroni kamper', 'en', 'Camping beside a Petroni camper')),
          jsonb_build_object('id', 'gallery-11', 'image', '/images/home-gallery/11-tenda-kampera.webp', 'alt', jsonb_build_object('hr', 'Tenda Petroni kampera', 'en', 'Petroni camper awning')),
          jsonb_build_object('id', 'gallery-12', 'image', '/images/home-gallery/12-detalj-prednjeg-svjetla.webp', 'alt', jsonb_build_object('hr', 'Detalj Petroni kampera', 'en', 'Petroni camper detail')),
          jsonb_build_object('id', 'gallery-13', 'image', '/images/home-gallery/13-sjedeca-garnitura.webp', 'alt', jsonb_build_object('hr', 'Sjedeća garnitura u kamperu', 'en', 'Camper seating area')),
          jsonb_build_object('id', 'gallery-14', 'image', '/images/home-gallery/14-spavaca-soba.webp', 'alt', jsonb_build_object('hr', 'Spavaća soba u kamperu', 'en', 'Camper bedroom')),
          jsonb_build_object('id', 'gallery-15', 'image', '/images/home-gallery/15-druzenje-uz-kamper.webp', 'alt', jsonb_build_object('hr', 'Druženje uz Petroni kamper', 'en', 'Enjoying time beside a Petroni camper')),
          jsonb_build_object('id', 'gallery-16', 'image', '/images/home-gallery/16-radni-prostor-u-kombiju.webp', 'alt', jsonb_build_object('hr', 'Radni prostor u kombi kamperu', 'en', 'Workspace in a camper van')),
          jsonb_build_object('id', 'gallery-17', 'image', '/images/home-gallery/17-pranje-posuda.webp', 'alt', jsonb_build_object('hr', 'Kuhinja u upotrebi', 'en', 'Camper kitchen in use')),
          jsonb_build_object('id', 'gallery-18', 'image', '/images/home-gallery/18-kuhinjski-pretinac.webp', 'alt', jsonb_build_object('hr', 'Kuhinjski pretinac kampera', 'en', 'Camper kitchen drawer'))
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
