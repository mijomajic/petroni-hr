-- Productize the live dataset as the reusable Alderway Campers demo.
--
-- This migration intentionally keeps every operational primary key and every
-- booking, pricing, stock, payment and audit record intact. Public catalogue
-- records are updated in place; obsolete catalogues are deactivated instead
-- of deleted. Provider identifiers and workflow enums remain unchanged.

begin;

-- ---------------------------------------------------------------------------
-- BUSINESS PROFILE AND SAFE DEMO PAYMENT DATA
-- ---------------------------------------------------------------------------

insert into settings (key, value) values
  ('admin_email', to_jsonb('hello@alderwaycampers.com'::text)),
  ('email_from', to_jsonb('Alderway Campers <hello@alderwaycampers.com>'::text)),
  ('company', '{
    "name":"Alderway Campers",
    "legal_name":"Alderway Campers",
    "address":"18 Alder Way, Northmere, N04 R2Y6",
    "email":"hello@alderwaycampers.com",
    "phone":"+353 1 687 2048",
    "website":"https://www.alderwaycampers.com"
  }'::jsonb),
  -- Never carry a real client's bank destination into a reusable demo.
  ('ibans', '[]'::jsonb),
  ('shop_featured_brands', '[]'::jsonb)
on conflict (key) do update set value = excluded.value;

update settings
set value = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(value, '{overseas,label_hr}', to_jsonb('Kurirska dostava'::text), true),
      '{overseas,label_en}', to_jsonb('Courier delivery'::text), true
    ),
    '{boxnow,label_hr}', to_jsonb('Paketomat'::text), true
  ),
  '{boxnow,label_en}', to_jsonb('Parcel locker'::text), true
)
where key = 'shop_shipping_methods';

-- ---------------------------------------------------------------------------
-- CANONICAL RENTAL FLEET
-- Keep vehicle UUIDs so season_prices, bookings and blocked dates remain valid.
-- ---------------------------------------------------------------------------

with fleet(
  current_slug, new_slug, new_name, new_category, description_hr, description_en,
  new_specs
) as (
  values
    (
      'roller-team-kronos-277m',
      'alderway-grand-tour-7',
      'Alderway Grand Tour 7',
      'SIGNATURE',
      'Prostrani premium kamper za obitelji i veća društva. Sedam putnih mjesta, fleksibilan raspored ležajeva, velika garaža i klimatiziran dnevni prostor čine ga idealnim za duža putovanja.',
      'A spacious premium motorhome for families and larger groups. Seven travel seats, a flexible sleeping layout, generous garage storage and an air-conditioned living area make it ideal for longer journeys.',
      '{"chassis":"Ford Transit 2.0 EcoBlue","power_hp":155,"model_year":2026,"dimensions_m":"6.99 × 2.35 × 3.20","seats_beds":"7 / 7","transmission":"automatic","cab_ac":true,"living_ac":true,"deposit_eur":3000}'::jsonb
    ),
    (
      'ci-horon-79m',
      'alderway-northstar-6',
      'Alderway Northstar 6',
      'SIGNATURE',
      'Premium obiteljski kamper sa šest homologiranih sjedala i šest ležajeva. Odvojene zone za odmor, potpuno opremljena kuhinja i izdašan prostor za pohranu pružaju udobnost na dugim rutama.',
      'A premium family motorhome with six belted seats and six berths. Separate relaxation zones, a fully equipped kitchen and generous storage provide comfort on long routes.',
      '{"chassis":"Ford Transit 2.0 EcoBlue","power_hp":155,"model_year":2026,"dimensions_m":"7.43 × 2.35 × 3.20","seats_beds":"6 / 6","transmission":"automatic","cab_ac":true,"living_ac":true,"deposit_eur":3000}'::jsonb
    ),
    (
      'mclouis-mc4-873',
      'alderway-meridian-5',
      'Alderway Meridian 5',
      'SIGNATURE',
      'Elegantan poluintegrirani kamper za do pet putnika, s odvojenim stražnjim ležajevima, podiznim krevetom i prostranom kupaonicom. Odličan izbor za parove i obitelji koje žele više privatnosti.',
      'An elegant low-profile motorhome for up to five travellers, with separate rear beds, a drop-down bed and a spacious bathroom. An excellent choice for couples and families who value privacy.',
      '{"chassis":"Ford Transit 2.0 EcoBlue","power_hp":165,"model_year":2026,"dimensions_m":"7.45 × 2.35 × 3.15","seats_beds":"5 / 5","transmission":"automatic","cab_ac":true,"living_ac":true,"deposit_eur":2800}'::jsonb
    ),
    (
      'rimor-kilig-50',
      'alderway-wayfarer-6',
      'Alderway Wayfarer 6',
      'FAMILY',
      'Svestran obiteljski kamper sa šest sjedala i praktičnim krevetima na kat. Izdržljiv raspored, obilje spremišta i jednostavno upravljanje odgovaraju aktivnim obiteljskim putovanjima.',
      'A versatile family motorhome with six seats and practical bunk beds. A durable layout, abundant storage and easy handling suit active family adventures.',
      '{"chassis":"Ford Transit 2.0 EcoBlue","power_hp":130,"model_year":2025,"dimensions_m":"7.29 × 2.34 × 3.04","seats_beds":"6 / 6","transmission":"manual","cab_ac":true,"living_ac":true,"deposit_eur":2500}'::jsonb
    ),
    (
      'rimor-evo-sound',
      'alderway-horizon-6',
      'Alderway Horizon 6',
      'FAMILY',
      'Udoban kamper za do šest putnika, s dobro organiziranim dnevnim prostorom i više zona za spavanje. Pouzdan izbor za obiteljski odmor, vikend bijeg ili dulju cestovnu avanturu.',
      'A comfortable motorhome for up to six travellers, with a well-organised lounge and several sleeping zones. A reliable choice for family holidays, weekend escapes or longer road trips.',
      '{"chassis":"Ford Transit 2.0 EcoBlue","power_hp":145,"model_year":2024,"dimensions_m":"6.97 × 2.30 × 3.04","seats_beds":"6 / 6","transmission":"manual","cab_ac":true,"living_ac":true,"deposit_eur":2500}'::jsonb
    ),
    (
      'caratour-ford-600mq',
      'alderway-nomad-4',
      'Alderway Nomad 4',
      'FAMILY',
      'Kompaktan premium camper van za parove i male obitelji. Automatski mjenjač, okretnost i pametno iskorišten interijer olakšavaju gradske dionice i otvorenu cestu.',
      'A compact premium camper van for couples and small families. Automatic transmission, agile handling and a cleverly designed interior make both city driving and open-road touring effortless.',
      '{"chassis":"Ford Transit 2.0 EcoBlue","power_hp":170,"model_year":2026,"dimensions_m":"5.99 × 2.06 × 2.84","seats_beds":"4 / 3","transmission":"automatic","cab_ac":true,"living_ac":true,"deposit_eur":2400}'::jsonb
    ),
    (
      'knaus-boxdrive-680me',
      'alderway-atlas-4',
      'Alderway Atlas 4',
      'ADVENTURE',
      'Prostrani camper van za duga putovanja, s uzdužnim stražnjim ležajevima, snažnim motorom i izvrsnim prostorom za opremu. Spaja udobnost velikog kampera s praktičnošću kombija.',
      'A spacious camper van for long-distance touring, with longitudinal rear beds, a powerful engine and excellent equipment storage. It combines large-motorhome comfort with van practicality.',
      '{"chassis":"MAN TGE 2.0 TDI","power_hp":177,"model_year":2025,"dimensions_m":"6.84 × 2.04 × 2.68","seats_beds":"4 / 3","transmission":"automatic","cab_ac":true,"living_ac":true,"deposit_eur":2400}'::jsonb
    ),
    (
      'petrovan-53-4x4',
      'alderway-ridge-4x4',
      'Alderway Ridge 4x4',
      'ADVENTURE',
      'Kompaktan 4x4 camper van za dvoje, stvoren za planinske ceste, udaljena odredišta i putovanja izvan uobičajenih ruta. Jednostavan je za vožnju i potpuno opremljen za samostalne avanture.',
      'A compact 4x4 camper van for two, made for mountain roads, remote destinations and journeys beyond the usual routes. It is easy to drive and fully equipped for self-contained adventures.',
      '{"chassis":"Volkswagen Transporter 4Motion","power_hp":150,"model_year":2024,"dimensions_m":"5.31 × 1.91 × 2.60","seats_beds":"2 / 2","transmission":"automatic","cab_ac":true,"living_ac":false,"deposit_eur":2200}'::jsonb
    ),
    (
      'budget-van-55',
      'alderway-trail-2',
      'Alderway Trail 2',
      'ADVENTURE',
      'Praktičan i cjenovno pristupačan camper van za dvoje. Jednostavan raspored, dovoljno prostora za putnu opremu i kompaktne dimenzije idealni su za spontana putovanja.',
      'A practical and accessible camper van for two. A straightforward layout, useful gear storage and compact dimensions make it ideal for spontaneous road trips.',
      '{"chassis":"Renault Master 2.3 dCi","power_hp":150,"model_year":2023,"dimensions_m":"5.55 × 2.07 × 2.65","seats_beds":"2 / 2","transmission":"manual","cab_ac":true,"living_ac":false,"deposit_eur":1800}'::jsonb
    ),
    (
      'weinsberg-caraone-550uk',
      'alderway-haven-550',
      'Alderway Haven 550',
      'FAMILY',
      'Lagano vučna kamp prikolica s fleksibilnim obiteljskim rasporedom, potpuno opremljenom kuhinjom i udobnim prostorom za boravak. Dostupna je za duže boravke i putovanja s više postaja.',
      'An easy-towing caravan with a flexible family layout, a fully equipped kitchen and a comfortable lounge. It is well suited to longer stays and multi-stop journeys.',
      '{"chassis":"Single-axle touring caravan","model_year":2025,"dimensions_m":"7.61 × 2.32 × 2.57","seats_beds":"4 / 4","transmission":"towed","cab_ac":false,"living_ac":true,"deposit_eur":1800}'::jsonb
    ),
    (
      'weinsberg-caraone-550qdk',
      'alderway-cove-550',
      'Alderway Cove 550',
      'FAMILY',
      'Obiteljska kamp prikolica s odvojenim zonama za spavanje, krevetima na kat i velikim blagovaonskim prostorom. Praktična je za obitelji koje žele udoban bazni kamp.',
      'A family caravan with separate sleeping zones, bunk beds and a generous dining area. It is a practical choice for families seeking a comfortable basecamp.',
      '{"chassis":"Single-axle family caravan","model_year":2026,"dimensions_m":"7.61 × 2.32 × 2.57","seats_beds":"6 / 6","transmission":"towed","cab_ac":false,"living_ac":true,"deposit_eur":1800}'::jsonb
    )
)
update vehicles as vehicle
set
  slug = fleet.new_slug,
  name = fleet.new_name,
  category = fleet.new_category,
  description_hr = fleet.description_hr,
  description_en = fleet.description_en,
  specs = fleet.new_specs,
  sale_price = null,
  is_for_sale = false,
  is_available = true
from fleet
where vehicle.type = 'rental'
  and vehicle.slug in (fleet.current_slug, fleet.new_slug);

with fleet_images(slug, images) as (
  values
    ('alderway-grand-tour-7', array[
      '/images/vehicles/roller-team-kronos-277m/01-izvana.webp',
      '/images/brand/alderway-interior.webp'
    ]::text[]),
    ('alderway-northstar-6', array[
      '/images/vehicles/ci-horon-79m/03-horon-79-2.webp',
      '/images/vehicles/ci-horon-79m/08-horon79-0.webp'
    ]::text[]),
    ('alderway-meridian-5', array[
      '/images/vehicles/mclouis-mc4-873/01-izvana.webp',
      '/images/brand/alderway-interior.webp'
    ]::text[]),
    ('alderway-wayfarer-6', array[
      '/images/vehicles/rimor-kilig-50/01-k50-3.webp',
      '/images/vehicles/rimor-kilig-50/06-kilig-50-002.webp',
      '/images/vehicles/rimor-kilig-50/10-kilig-50-008.webp'
    ]::text[]),
    ('alderway-horizon-6', array[
      '/images/vehicles/alderway-horizon-6/01-horizon-exterior.webp',
      '/images/vehicles/rimor-evo-sound/03-eso-7.webp',
      '/images/vehicles/rimor-evo-sound/04-eso-10.webp'
    ]::text[]),
    ('alderway-nomad-4', array[
      '/images/vehicles/caratour-ford-600mq/01-1-caratour.webp',
      '/images/vehicles/caratour-ford-600mq/07-4-interior.webp',
      '/images/vehicles/caratour-ford-600mq/14-11-interiro.webp'
    ]::text[]),
    ('alderway-atlas-4', array[
      '/images/brand/alderway-hero.webp',
      '/images/brand/alderway-interior.webp'
    ]::text[]),
    ('alderway-ridge-4x4', array[
      '/images/vehicles/alderway-ridge-4x4/01-vw-transporter-1.webp',
      '/images/vehicles/alderway-ridge-4x4/04-t4-3.webp',
      '/images/vehicles/alderway-ridge-4x4/10-vw-transporter-3.webp'
    ]::text[]),
    ('alderway-trail-2', array[
      '/images/vehicles/alderway-ridge-4x4/01-vw-transporter-1.webp',
      '/images/brand/alderway-interior.webp'
    ]::text[]),
    ('alderway-haven-550', array[
      '/images/vehicles/weinsberg-caraone-550uk/01-co550uk-1.webp',
      '/images/brand/alderway-lifestyle.webp'
    ]::text[]),
    ('alderway-cove-550', array[
      '/images/vehicles/weinsberg-caraone-550qdk/01-co550qdk-2.webp',
      '/images/brand/alderway-lifestyle.webp'
    ]::text[])
)
update vehicles as vehicle
set images = fleet_images.images
from fleet_images
where vehicle.slug = fleet_images.slug;

-- Specialist production vehicles and historical standalone sales listings stay
-- available to administrators and audit history, but leave every public list.
update vehicles
set is_available = false,
    is_for_sale = false
where type in ('film', 'sale');

-- ---------------------------------------------------------------------------
-- SEASONS AND PRICES
-- Existing season/price IDs remain unchanged. Add a complete next-year demo
-- calendar so a fresh deployment does not fall back to a flat price in 2027.
-- ---------------------------------------------------------------------------

update seasons
set name = case
  when date_from = date '2026-01-01' then 'Winter & spring 2026'
  when date_from = date '2026-03-29' then 'Early summer 2026'
  when date_from = date '2026-07-17' then 'Peak season 2026'
  when date_from = date '2026-08-24' then 'Late summer 2026'
  when date_from = date '2026-11-02' then 'Winter 2026'
  else name
end
where date_from between date '2026-01-01' and date '2026-12-31';

insert into seasons (name, date_from, date_to, min_nights, sort_order)
select incoming.name, incoming.date_from, incoming.date_to, incoming.min_nights, incoming.sort_order
from (values
  ('Winter & spring 2027', date '2027-01-01', date '2027-04-30', 3, 11),
  ('Early summer 2027', date '2027-05-01', date '2027-06-30', 5, 12),
  ('Peak season 2027', date '2027-07-01', date '2027-08-31', 7, 13),
  ('Autumn & winter 2027', date '2027-09-01', date '2027-12-31', 3, 14)
) as incoming(name, date_from, date_to, min_nights, sort_order)
where not exists (
  select 1 from seasons where seasons.date_from = incoming.date_from and seasons.date_to = incoming.date_to
);

insert into season_prices (season_id, vehicle_id, price_per_day)
select
  season.id,
  vehicle.id,
  round(
    numeric '1.00' * coalesce(vehicle.base_price_per_day, 0)
    * case season.name
        when 'Early summer 2027' then numeric '1.15'
        when 'Peak season 2027' then numeric '1.30'
        when 'Autumn & winter 2027' then numeric '1.05'
        else numeric '1.00'
      end,
    2
  )
from seasons as season
cross join vehicles as vehicle
where season.date_from between date '2027-01-01' and date '2027-12-31'
  and vehicle.type = 'rental'
  and vehicle.base_price_per_day is not null
on conflict (season_id, vehicle_id) do update
set price_per_day = excluded.price_per_day;

-- ---------------------------------------------------------------------------
-- LOCATIONS, FEES AND EXTRAS
-- Location IDs and all pricing rule keys are deliberately preserved.
-- ---------------------------------------------------------------------------

with location_names(current_name, new_name) as (
  values
    ('Zagreb Depot', 'Northmere Basecamp'),
    ('Zagreb City Centre', 'Northmere Central Station'),
    ('Zagreb Airport', 'Northmere Airport'),
    ('Split Airport', 'South Coast Airport'),
    ('Dubrovnik Airport', 'Harbour Coast Airport'),
    ('Pula Airport', 'West Coast Airport'),
    ('Zadar Airport', 'Pine Coast Airport'),
    ('Krk (Rijeka) Airport', 'Island Gateway Airport'),
    ('Ljubljana Airport', 'Alpine Gateway Airport'),
    ('Budapest Airport', 'Danube Gateway Airport'),
    ('Vienna Airport', 'Central Europe Airport')
)
update rental_locations as location
set name = location_names.new_name
from location_names
where location.name in (location_names.current_name, location_names.new_name);

update rental_locations
set
  time_policy = case
    when name = 'Northmere Basecamp' then 'zagreb_automatic'
    when name in ('Alpine Gateway Airport', 'Danube Gateway Airport', 'Central Europe Airport') then 'agreement_overseas'
    else 'agreement_hr'
  end,
  pickup_window = case when name = 'Northmere Basecamp' then '13:00-15:00' else pickup_window end,
  return_window = case when name = 'Northmere Basecamp' then '08:00-10:00' else return_window end,
  after_hours_start = case
    when name = 'Northmere Basecamp' then '15:00'
    when name in ('Alpine Gateway Airport', 'Danube Gateway Airport', 'Central Europe Airport') then '16:00'
    else null
  end
where name in (
  'Northmere Basecamp', 'Northmere Central Station', 'Northmere Airport',
  'South Coast Airport', 'Harbour Coast Airport', 'West Coast Airport',
  'Pine Coast Airport', 'Island Gateway Airport', 'Alpine Gateway Airport',
  'Danube Gateway Airport', 'Central Europe Airport'
);

update fees
set
  name_hr = case key
    when 'sunday_holiday' then 'Naknada za nedjelju ili praznik'
    when 'after_hours' then 'Naknada izvan radnog vremena'
    when 'extra_km' then 'Dodatni kilometar'
    when 'early_pickup_hour' then 'Ranije preuzimanje'
    when 'late_return_hour' then 'Kasniji povrat'
    when 'overseas_after_hours' then 'Moguća doplata izvan radnog vremena'
    else name_hr
  end,
  description_hr = case key
    when 'sunday_holiday' then 'Doplata za preuzimanje ili povrat nedjeljom ili na službeni praznik.'
    when 'after_hours' then 'Fiksna doplata za preuzimanje ili povrat nakon redovnog termina baze.'
    when 'extra_km' then 'Cijena po prijeđenom kilometru iznad uključene kilometraže.'
    when 'early_pickup_hour' then 'Doplata po satu za preuzimanje prije uključenog termina.'
    when 'late_return_hour' then 'Doplata po satu za povrat nakon uključenog termina.'
    when 'overseas_after_hours' then 'Moguća doplata za termin nakon 16:00 potvrđuje se prije putovanja.'
    else description_hr
  end
where key in (
  'sunday_holiday', 'after_hours', 'extra_km', 'early_pickup_hour',
  'late_return_hour', 'overseas_after_hours'
);

update booking_extras
set
  name_hr = 'GPS navigacija za kampere',
  name_en = 'Camper GPS navigation',
  description_hr = 'Navigacija prilagođena dimenzijama kampera, obračunava se po danu najma.',
  description_en = 'Navigation configured for motorhome dimensions, charged per rental day.'
where name_hr ilike 'GPS%camper%';

update booking_extras
set
  name_hr = 'GPS navigacija',
  name_en = 'GPS navigation',
  description_hr = 'Standardna GPS navigacija, obračunava se po danu najma.',
  description_en = 'Standard GPS navigation, charged per rental day.'
where name_hr ilike 'GPS%'
  and name_hr not ilike '%camper%';

update booking_extras
set
  name_hr = 'Naknada za trajekt ili otok',
  name_en = 'Ferry or island travel fee',
  description_hr = 'Logistička naknada za putovanja koja uključuju trajekt ili udaljeni otok.',
  description_en = 'A logistics fee for journeys involving a ferry or remote island.'
where name_hr in ('Naknada za otoke / Islands fee', 'Naknada za trajekt ili otok');

update booking_extras
set
  name_hr = 'Naknada za festival ili događanje',
  name_en = 'Festival or event fee',
  description_hr = 'Posebna priprema i uvjeti za putovanje na festival ili veliko događanje.',
  description_en = 'Special preparation and terms for travel to a festival or major event.'
where auto_apply_rule = 'festival'
   or name_hr in ('Naknada za festival / Festival fee', 'Naknada za festival ili događanje');

update booking_extras
set
  name_hr = 'Naknada za međunarodno putovanje',
  name_en = 'International travel fee',
  description_hr = 'Administrativna naknada za unaprijed prijavljeno međunarodno putovanje.',
  description_en = 'Administration fee for a declared international journey.'
where auto_apply_rule = 'border_crossing'
   or name_hr in ('Prelazak granice / Border crossing fee', 'Naknada za međunarodno putovanje');

-- ---------------------------------------------------------------------------
-- RENTAL TERMS
-- Keep prior accepted versions for historical booking evidence, but make a
-- complete Alderway version the sole active version for new reservations.
-- ---------------------------------------------------------------------------

update rental_terms set is_active = false where is_active = true;

insert into rental_terms (version, content_hr, content_en, is_active)
values (
  'alderway-demo-2026-09',
  $terms_hr$## Opći uvjeti najma

Ovi uvjeti uređuju postupak rezervacije vozila marke Alderway Campers. Rezervacija postaje konačna nakon provjere dostupnosti, potvrde tima i evidentiranja ugovorenog plaćanja.

## Vozač i dokumenti

Glavni vozač mora zadovoljiti minimalnu dob prikazanu tijekom rezervacije te pri preuzimanju pokazati važeću vozačku dozvolu i identifikacijski dokument. Dodatni vozači moraju biti prijavljeni prije polaska.

## Cijena, polog i plaćanje

Cijena se izračunava prema vozilu, sezoni, trajanju, lokacijama, terminima i odabranim dodacima. Povratni polog ne ulazi u cijenu najma. Ako je omogućeno obročno plaćanje, rok druge uplate prikazuje se prije slanja rezervacije.

## Preuzimanje i povrat

Vozilo se preuzima i vraća u dogovorenoj lokaciji i terminu. Kašnjenje, povrat izvan termina, dodatna kilometraža, manjak goriva, posebno čišćenje, šteta i izgubljena oprema mogu se dodatno obračunati prema potvrdi rezervacije i zapisniku o vozilu.

## Putovanje i odgovornost

Planirano međunarodno putovanje, trajekt, otok, festival ili veliko događanje mora se prijaviti unaprijed. Najmoprimac je odgovoran za sigurno korištenje vozila, prometne i parkirne troškove te poštivanje ograničenja visine, širine i mase.

## Otkazivanje i pomoć

Uvjeti otkazivanja i promjene potvrđuju se uz svaku rezervaciju. U slučaju kvara ili nezgode najmoprimac mora zaustaviti vozilo kada je to sigurno, kontaktirati podršku i slijediti primljene upute.

Za pitanja o rezervaciji ili ovim uvjetima obratite se timu Alderway Campers na hello@alderwaycampers.com.$terms_hr$,
  $terms_en$## General rental terms

These terms govern the Alderway Campers booking flow. A reservation becomes final after availability has been checked, the team has confirmed it and the agreed payment has been recorded.

## Driver and documents

The main driver must meet the minimum age shown during booking and present a valid driving licence and identity document at collection. Additional drivers must be declared before departure.

## Price, security deposit and payment

The price is calculated from the vehicle, season, duration, locations, handover times and selected extras. The refundable security deposit is separate from the rental price. Where split payment is offered, the second-payment deadline is shown before submission.

## Collection and return

The vehicle must be collected and returned at the agreed place and time. Late return, out-of-hours handover, excess mileage, missing fuel, specialist cleaning, damage and lost equipment may be charged according to the booking confirmation and vehicle report.

## Travel and responsibility

International travel, ferries, islands, festivals and major events must be declared in advance. The renter is responsible for safe use, traffic and parking charges, and observing the vehicle's height, width and weight limits.

## Cancellation and assistance

Cancellation and amendment terms are confirmed with each booking. In the event of a breakdown or accident, the renter must stop when safe, contact support and follow the instructions provided.

For questions about a booking or these terms, contact the Alderway Campers team at hello@alderwaycampers.com.$terms_en$,
  true
)
on conflict (version) do update set
  content_hr = excluded.content_hr,
  content_en = excluded.content_en,
  is_active = true;

-- ---------------------------------------------------------------------------
-- STRUCTURED PUBLIC PAGE CMS
-- Every known section ID is included so source fallbacks cannot reintroduce
-- old customer content when the stored value is sanitized.
-- ---------------------------------------------------------------------------

insert into site_pages (key, label, route, content, is_published) values
(
  'home',
  'Naslovnica',
  '/',
  $json${
    "title":{"hr":"Alderway Campers — premium najam kampera","en":"Alderway Campers — premium motorhome hire"},
    "seoDescription":{"hr":"Premium kamperi, jasne cijene i podrška na svakom koraku putovanja.","en":"Premium motorhomes, clear pricing and thoughtful support for every mile of your journey."},
    "sections":[
      {"id":"hero","type":"hero","label":"Glavni banner","visible":true,"variant":"home","title":{"hr":"Putovanje počinje\nslobodom izbora.","en":"Your journey starts\nwith freedom."},"body":{"hr":"Pažljivo odabrani kamperi, transparentna rezervacija i podrška od preuzimanja do povratka.","en":"Carefully selected motorhomes, transparent booking and support from collection to return."},"image":"/images/brand/alderway-hero.webp","imageAlt":{"hr":"Premium Alderway kamper na putovanju","en":"Premium Alderway motorhome on the road"},"ctaLabel":{"hr":"Pronađite svoj kamper","en":"Find your motorhome"},"ctaHref":"/rezerviraj"},
      {"id":"rentals","type":"vehicle_grid","label":"Vozila za najam","visible":true,"variant":"rental","eyebrow":{"hr":"Od vikenda do velike ture","en":"From weekends to grand tours"},"title":{"hr":"Odaberite svoj način putovanja","en":"Choose your way to travel"},"body":{"hr":"Istražite cijelu flotu.","en":"Explore the complete fleet."},"ctaLabel":{"hr":"Pogledajte sva vozila","en":"View all vehicles"},"ctaHref":"/vozila/najam-kampera"},
      {"id":"partners","type":"logo_grid","label":"Partneri","visible":false,"items":[]},
      {"id":"sales","type":"vehicle_grid","label":"Vozila za prodaju","visible":false,"variant":"sale","eyebrow":{"hr":"Alderway izbor","en":"The Alderway selection"},"title":{"hr":"Vozila za prodaju","en":"Vehicles for sale"},"body":{"hr":"Ponuda se priprema.","en":"The collection is being prepared."},"ctaLabel":{"hr":"Saznajte više","en":"Learn more"},"ctaHref":"/kontakt"},
      {"id":"advantages","type":"feature_grid","label":"Glavne prednosti","visible":true,"eyebrow":{"hr":"Mirno krenite na put","en":"Set off with confidence"},"title":{"hr":"Premium usluga bez komplikacija","en":"Premium service, made simple"},"items":[
        {"id":"transparent","icon":"card","title":{"hr":"Jasna cijena","en":"Clear pricing"},"body":{"hr":"Cijena se izračunava iz odabranog termina, lokacije i dodataka prije slanja rezervacije.","en":"Your price is calculated from the selected dates, locations and extras before you submit."}},
        {"id":"locations","icon":"pin","title":{"hr":"Fleksibilno preuzimanje","en":"Flexible collection"},"body":{"hr":"Odaberite bazu ili jednu od dogovorenih lokacija za početak i završetak putovanja.","en":"Choose the basecamp or an agreed gateway location for the start and end of your trip."}},
        {"id":"support","icon":"star","title":{"hr":"Podrška koja putuje s Vama","en":"Support that travels with you"},"body":{"hr":"Detaljno upoznavanje s vozilom i podrška tijekom najma uključeni su u svako putovanje.","en":"A thorough vehicle handover and support throughout the rental are included with every journey."}}
      ]},
      {"id":"gallery","type":"image_strip","label":"Galerija","visible":true,"items":[
        {"id":"gallery-1","image":"/images/brand/alderway-lifestyle.webp","alt":{"hr":"Doručak uz kamper na mirnoj lokaciji","en":"Breakfast beside a camper in a quiet setting"}},
        {"id":"gallery-2","image":"/images/brand/alderway-interior.webp","alt":{"hr":"Topao i funkcionalan interijer kampera","en":"Warm and practical camper interior"}},
        {"id":"gallery-3","image":"/images/brand/alderway-hero.webp","alt":{"hr":"Kamper uz planinsko jezero","en":"Camper beside a mountain lake"}}
      ]},
      {"id":"stats","type":"stats","label":"Brojke","visible":true,"items":[
        {"id":"users","value":480,"suffix":"+","title":{"hr":"završenih putovanja","en":"completed journeys"}},
        {"id":"years","value":12,"suffix":"","title":{"hr":"godina iskustva","en":"years of experience"}},
        {"id":"vehicles","value":11,"suffix":"","title":{"hr":"pažljivo odabranih vozila","en":"carefully selected vehicles"}}
      ]},
      {"id":"brands","type":"logo_marquee","label":"Brendovi vozila i opreme","visible":false,"items":[]}
    ]
  }$json$::jsonb,
  true
),
(
  'about',
  'O nama',
  '/o-nama',
  $json${
    "title":{"hr":"O nama | Alderway Campers","en":"About us | Alderway Campers"},
    "seoDescription":{"hr":"Upoznajte Alderway pristup premium najmu kampera i bezbrižnom putovanju.","en":"Discover the Alderway approach to premium motorhome hire and effortless road travel."},
    "sections":[
      {"id":"hero","type":"hero","label":"Glavni banner","visible":true,"variant":"inner","eyebrow":{"hr":"Stvoreni za otvorenu cestu","en":"Made for the open road"},"title":{"hr":"O Alderwayu","en":"About Alderway"},"image":"/images/brand/alderway-lifestyle.webp","imageAlt":{"hr":"Alderway premium kamper","en":"Alderway premium motorhome"}},
      {"id":"story-1","type":"split_content","label":"Priča — naš pristup","visible":true,"variant":"image-right","eyebrow":{"hr":"Naš pristup","en":"Our approach"},"title":{"hr":"Sloboda bez neizvjesnosti","en":"Freedom without uncertainty"},"body":{"hr":"Alderway Campers je premium rental brand izgrađen oko jednostavne ideje: putovanje kamperom treba biti uzbudljivo, a rezervacija mirna i jasna.\n\nSvako vozilo prolazi detaljnu pripremu, a gost prije polaska dobiva praktično upoznavanje s opremom i podrškom.","en":"Alderway Campers is a premium rental brand built around a simple idea: motorhome travel should feel exciting, while booking should feel calm and clear.\n\nEvery vehicle receives a detailed preparation, and each guest gets a practical handover and clear support before departure."},"image":"/images/brand/alderway-interior.webp","imageAlt":{"hr":"Premium interijer Alderway kampera","en":"Premium Alderway motorhome interior"}},
      {"id":"story-2","type":"split_content","label":"Priča — iskustvo","visible":true,"variant":"image-left","eyebrow":{"hr":"Odabir flote","en":"Fleet selection"},"title":{"hr":"Vozilo za svaku vrstu putovanja","en":"A vehicle for every kind of journey"},"body":{"hr":"Od kompaktnih camper vanova za dvoje do prostranih obiteljskih kampera, flota je složena tako da gost može odabrati pravo vozilo bez nepotrebne složenosti.\n\nTransparentne sezonske cijene, fleksibilne lokacije i pažljivo odabrani dodaci čine cijeli proces predvidljivim.","en":"From compact camper vans for two to spacious family motorhomes, the fleet is designed to make choosing the right vehicle straightforward.\n\nTransparent seasonal rates, flexible locations and thoughtfully selected extras keep the whole journey predictable."},"image":"/images/brand/alderway-hero.webp","imageAlt":{"hr":"Alderway touring van","en":"Alderway touring van"}},
      {"id":"testimonials","type":"testimonials","label":"Mišljenja gostiju","visible":true,"eyebrow":{"hr":"Iskustva s puta","en":"Stories from the road"},"title":{"hr":"Zašto se gosti vraćaju","en":"Why guests return"},"items":[
        {"id":"quote-1","body":{"hr":"Rezervacija je bila jasna, vozilo besprijekorno pripremljeno, a tim dostupan kad nam je zatrebao.","en":"Booking was clear, the vehicle was immaculately prepared and the team was available when we needed them."}},
        {"id":"quote-2","body":{"hr":"Prvi put smo putovali kamperom i sve nam je objašnjeno mirno i praktično. Odličan početak avanture.","en":"It was our first motorhome trip and everything was explained calmly and practically. A brilliant start to the adventure."}},
        {"id":"quote-3","body":{"hr":"Transparentna cijena i udoban kamper učinili su cijelo putovanje jednostavnim od prvog dana.","en":"Transparent pricing and a comfortable motorhome made the entire trip easy from day one."}}
      ]},
      {"id":"cta","type":"split_cta","label":"Završni poziv na rezervaciju","visible":true,"title":{"hr":"Vaša ruta. Vaš ritam.","en":"Your route. Your rhythm."},"body":{"hr":"Odaberite datume, usporedite dostupna vozila i složite putovanje koje Vam odgovara.","en":"Choose your dates, compare available vehicles and shape a journey that suits you."},"image":"/images/brand/alderway-lifestyle.webp","imageAlt":{"hr":"Putovanje kamperom u prirodi","en":"Motorhome travel in nature"},"ctaLabel":{"hr":"Započnite rezervaciju","en":"Start your booking"},"ctaHref":"/rezerviraj"}
    ]
  }$json$::jsonb,
  true
),
(
  'contact',
  'Kontakt',
  '/kontakt',
  $json${
    "title":{"hr":"Kontakt | Alderway Campers","en":"Contact | Alderway Campers"},
    "seoDescription":{"hr":"Kontaktirajte Alderway Campers za rezervacije, odabir vozila i podršku prije putovanja.","en":"Contact Alderway Campers for bookings, vehicle selection and pre-trip support."},
    "sections":[
      {"id":"contact","type":"contact","label":"Kontakt i obrazac","visible":true,"title":{"hr":"Razgovarajmo o Vašem putovanju","en":"Let's talk about your journey"},"body":{"hr":"Pošaljite upit o vozilu, terminu ili ruti. Naš rental tim odgovara tijekom radnog vremena.","en":"Ask us about a vehicle, dates or your planned route. Our rental team replies during business hours."},"items":[
        {"id":"address","title":{"hr":"Adresa","en":"Address"},"body":{"hr":"18 Alder Way, Northmere, N04 R2Y6","en":"18 Alder Way, Northmere, N04 R2Y6"}},
        {"id":"phone","title":{"hr":"Telefon","en":"Phone"},"body":{"hr":"+353 1 687 2048","en":"+353 1 687 2048"},"href":"tel:+35316872048"},
        {"id":"email","title":{"hr":"Email","en":"Email"},"body":{"hr":"hello@alderwaycampers.com","en":"hello@alderwaycampers.com"},"href":"mailto:hello@alderwaycampers.com"},
        {"id":"note","title":{"hr":"Radno vrijeme","en":"Opening hours"},"body":{"hr":"Ponedjeljak–petak 09:00–18:00. Preuzimanja vikendom dogovaraju se unaprijed.","en":"Monday–Friday 09:00–18:00. Weekend handovers are arranged in advance."}},
        {"id":"map","title":{"hr":"Northmere Basecamp","en":"Northmere Basecamp"},"body":{"hr":"Alderway Campers\n18 Alder Way, Northmere","en":"Alderway Campers\n18 Alder Way, Northmere"},"href":"https://www.google.com/maps/search/?api=1&query=18%20Alder%20Way%2C%20Northmere"}
      ]}
    ]
  }$json$::jsonb,
  true
),
(
  'faq',
  'FAQ',
  '/faq',
  $json${
    "title":{"hr":"Česta pitanja | Alderway Campers","en":"Frequently asked questions | Alderway Campers"},
    "seoDescription":{"hr":"Odgovori o rezervaciji, vozačima, plaćanju, pologu, kilometraži i preuzimanju kampera.","en":"Answers about booking, drivers, payment, deposits, mileage and motorhome collection."},
    "sections":[
      {"id":"faq","type":"faq","label":"Česta pitanja","visible":true,"eyebrow":{"hr":"Dobro je znati","en":"Good to know"},"title":{"hr":"Česta pitanja","en":"Frequently asked questions"},"items":[
        {"id":"booking","title":{"hr":"Kako mogu rezervirati kamper?","en":"How can I book a motorhome?"},"body":{"hr":"Odaberite lokacije, datume, broj putnika i planiranu kilometražu. Nakon provjere dostupnosti odaberite vozilo, dodatke i način plaćanja te pošaljite zahtjev.","en":"Choose locations, dates, passenger numbers and planned mileage. After availability is checked, select a vehicle, extras and payment method, then submit your request."}},
        {"id":"documents","title":{"hr":"Koji su dokumenti potrebni pri preuzimanju?","en":"Which documents are required at collection?"},"body":{"hr":"Glavni i dodatni vozači trebaju važeću vozačku dozvolu i identifikacijski dokument. Minimalna dob vozača prikazana je tijekom rezervacije.","en":"The main and additional drivers need a valid driving licence and identity document. The minimum driver age is shown during booking."}},
        {"id":"cancellation","title":{"hr":"Mogu li promijeniti ili otkazati rezervaciju?","en":"Can I amend or cancel a booking?"},"body":{"hr":"Da. Uvjeti i mogući troškovi ovise o vremenu do preuzimanja. Kontaktirajte rental tim čim se plan promijeni.","en":"Yes. Terms and possible charges depend on the time remaining before collection. Contact the rental team as soon as your plans change."}},
        {"id":"border","title":{"hr":"Mogu li putovati u druge zemlje?","en":"Can I travel internationally?"},"body":{"hr":"Međunarodno putovanje obično je moguće uz prethodnu prijavu. Ograničenja, dokumenti i eventualna naknada potvrđuju se prije polaska.","en":"International travel is usually possible when declared in advance. Restrictions, documents and any fee are confirmed before departure."}},
        {"id":"included","title":{"hr":"Što uključuje cijena najma?","en":"What is included in the rental price?"},"body":{"hr":"Cijena uključuje vozilo za obračunato razdoblje, prikazanu dnevnu kilometražu, osnovnu opremu vozila, pripremu i podršku. Sve dodatne stavke vidljive su u sažetku.","en":"The price includes the vehicle for the charged period, the displayed daily mileage allowance, standard onboard equipment, preparation and support. Every extra item appears in the summary."}},
        {"id":"hidden-costs","title":{"hr":"Postoje li skriveni troškovi?","en":"Are there hidden charges?"},"body":{"hr":"Ne. Poznate naknade i odabrani dodaci prikazuju se prije slanja rezervacije. Troškovi nakon najma mogu nastati zbog štete, goriva, kašnjenja, posebnog čišćenja ili dodatne kilometraže.","en":"No. Known fees and selected extras are shown before submission. Post-rental charges may arise from damage, fuel, late return, specialist cleaning or excess mileage."}},
        {"id":"one-way","title":{"hr":"Mogu li vratiti vozilo na drugoj lokaciji?","en":"Can I return the vehicle to another location?"},"body":{"hr":"Da, kada je odabrana lokacija dostupna za taj termin. Naknada za različitu lokaciju automatski se prikazuje u izračunu.","en":"Yes, when the chosen location is available for those dates. Any different-location fee is shown automatically in the calculation."}},
        {"id":"deposit","title":{"hr":"Kako funkcionira povratni polog?","en":"How does the refundable security deposit work?"},"body":{"hr":"Polog ovisi o vozilu i prikazuje se odvojeno od cijene najma. Nakon urednog povrata oslobađa se u skladu s uvjetima najma i vremenom obrade banke.","en":"The deposit depends on the vehicle and is shown separately from the rental price. Following a satisfactory return, it is released in line with the rental terms and bank processing times."}}
      ]}
    ]
  }$json$::jsonb,
  true
)
on conflict (key) do update set
  label = excluded.label,
  route = excluded.route,
  content = excluded.content,
  is_published = true,
  updated_at = now();

-- Old unpublished page drafts must not unexpectedly replace the Alderway live
-- content during a demo. They remain archived for audit/reference.
update site_page_versions
set status = 'archived'
where status = 'draft';

-- ---------------------------------------------------------------------------
-- PUBLIC LEGAL PAGES
-- Insert archived first to avoid the one-published-version constraint, then
-- atomically promote the Alderway version for each document.
-- ---------------------------------------------------------------------------

update legal_documents
set label = case key
  when 'privacy' then 'Politika privatnosti'
  when 'cookies' then 'Kolačići i pohrana preglednika'
  when 'shop_terms' then 'Uvjeti poslovanja'
  when 'delivery_payment' then 'Plaćanje i preuzimanje'
  when 'returns_complaints' then 'Prigovori i povrati'
  else label
end
where key in ('privacy', 'cookies', 'shop_terms', 'delivery_payment', 'returns_complaints');

with incoming(
  document_key, version_label, effective_date, title_hr, title_en,
  summary_hr, summary_en, content_hr, content_en
) as (
  values
    (
      'privacy',
      'alderway-demo-2026-09',
      date '2026-09-16',
      'Politika privatnosti',
      'Privacy Policy',
      'Kako Alderway Campers obrađuje podatke u rezervacijskom iskustvu.',
      'How Alderway Campers handles data in the booking experience.',
      $privacy_hr$## Voditelj obrade i kontakt

Alderway Campers upravlja ovom rental uslugom. Upite o osobnim podacima možete poslati na hello@alderwaycampers.com.

## Podaci i svrhe

Sustav može obraditi podatke računa, vozača, rezervacije, kontaktnog obrasca, plaćanja i tehničke sigurnosti kako bi prikazao rezervacijski proces, zaštitio uslugu i odgovorio na zahtjev korisnika.

## Pružatelji usluga

Tehnički pružatelji mogu uključivati hosting, bazu podataka, slanje e-pošte i ugovoreni payment gateway. Puni podaci kartice ne pohranjuju se u aplikaciji.

## Čuvanje i prava

Podaci se čuvaju samo koliko je potrebno za navedenu svrhu, sigurnost i primjenjive obveze. Zahtjev za pristup, ispravak ili brisanje šalje se na navedeni kontakt.

Za sva pitanja o privatnosti ili ostvarivanju prava javite se na hello@alderwaycampers.com.$privacy_hr$,
      $privacy_en$## Controller and contact

Alderway Campers operates this rental service. Personal-data enquiries can be sent to hello@alderwaycampers.com.

## Data and purposes

The system may process account, driver, booking, contact, payment and technical-security data to provide the booking journey, protect the service and respond to user requests.

## Service providers

Technical providers may include hosting, database, email delivery and the configured payment gateway. Full card details are not stored by the application.

## Retention and rights

Data is kept only as long as needed for its purpose, security and applicable obligations. Requests for access, correction or deletion should be sent to the contact above.

For privacy questions or rights requests, contact hello@alderwaycampers.com.$privacy_en$
    ),
    (
      'cookies',
      'alderway-demo-2026-09',
      date '2026-09-16',
      'Kolačići i pohrana preglednika',
      'Cookies and Browser Storage',
      'Nužna pohrana koja podržava prijavu, jezik, košaricu i nacrt rezervacije.',
      'Necessary storage supporting sign-in, language, cart and booking drafts.',
      $cookies_hr$## Nužna pohrana

Sustav koristi nužne sesijske kolačiće za prijavu, lokalnu pohranu za jezik i košaricu te sesijsku pohranu za nedovršenu rezervaciju i kratkotrajni rezultat postupka.

## Vanjske usluge

Payment gateway i karta paketomata učitavaju se samo kada korisnik odabere odgovarajuću funkciju. Vanjske poveznice kontaktiraju odredišnu stranicu tek nakon klika.

## Upravljanje

Podatke preglednika možete ukloniti kroz sučelje ili postavke preglednika. Brisanje sesijskih kolačića odjavljuje korisnika.$cookies_hr$,
      $cookies_en$## Necessary storage

The system uses necessary session cookies for sign-in, local storage for language and cart state, and session storage for an unfinished booking and short-lived flow results.

## External services

The payment gateway and locker map load only when the user chooses the relevant function. External links contact their destination only after a click.

## Controls

Browser data can be removed through the interface or browser settings. Clearing session cookies signs the user out.$cookies_en$
    ),
    (
      'shop_terms',
      'alderway-demo-2026-09',
      date '2026-09-16',
      'Uvjeti poslovanja',
      'Terms of Business',
      'Osnovni uvjeti rental iskustva Alderway Campers.',
      'Core terms for the Alderway Campers rental experience.',
      $shop_hr$## Operator

Alderway Campers pruža premium najam kampera. Kontakt: hello@alderwaycampers.com.

## Cijene i zahtjevi

Prikazane cijene izražene su u eurima i ponovno se provjeravaju na serveru. Slanje rezervacije ili upita potvrđuje primitak zahtjeva, ali samo po sebi ne predstavlja konačno prihvaćanje.

## Plaćanje i povrat

Dostupne metode i iznosi prikazuju se prije slanja. Otkazivanje, povrat i reklamacije rješavaju se prema uvjetima potvrđenima uz rezervaciju.

Za informacije o konkretnom najmu mjerodavni su potvrda rezervacije i pripadajući uvjeti najma.$shop_hr$,
      $shop_en$## Operator

Alderway Campers provides premium motorhome rentals. Contact: hello@alderwaycampers.com.

## Prices and requests

Displayed prices are in euros and are checked again on the server. Submitting a booking or enquiry confirms receipt of the request but does not by itself constitute final acceptance.

## Payment and returns

Available methods and amounts are shown before submission. Cancellations, refunds and complaints are handled under the terms confirmed with the booking.

For a specific rental, the booking confirmation and corresponding rental terms govern the service.$shop_en$
    ),
    (
      'delivery_payment',
      'alderway-demo-2026-09',
      date '2026-09-16',
      'Plaćanje i preuzimanje',
      'Payment and Collection',
      'Dostupne metode plaćanja i preuzimanja.',
      'Available payment and collection methods.',
      $delivery_hr$## Plaćanje

Rezervacijski proces prikazuje samo omogućene metode. Bankovni podaci prikazuju se kada je bankovna uplata dostupna. Kartično plaćanje obrađuje se putem sigurnog payment gatewaya.

## Preuzimanje

Lokacija, termin i sve pripadajuće naknade prikazuju se u sažetku rezervacije. Preuzimanje na izdvojenoj lokaciji potvrđuje rental tim nakon provjere logistike.$delivery_hr$,
      $delivery_en$## Payment

The booking journey shows only enabled methods. Bank details are displayed when bank transfer is available. Card payments are handled through a secure payment gateway.

## Collection

The location, handover time and any related fees appear in the booking summary. Collection at a gateway location is confirmed by the rental team after a logistics check.$delivery_en$
    ),
    (
      'returns_complaints',
      'alderway-demo-2026-09',
      date '2026-09-16',
      'Prigovori i povrati',
      'Complaints and Refunds',
      'Postupak za pitanja, prigovore i povrate u Alderway iskustvu.',
      'Process for questions, complaints and refunds in the Alderway experience.',
      $returns_hr$## Kontakt

Za pitanje ili prigovor pošaljite broj rezervacije i opis zahtjeva na hello@alderwaycampers.com.

## Obrada

Rental tim pregledava potvrdu rezervacije, evidenciju plaćanja i dostavljene informacije te odgovara s potrebnim sljedećim koracima. Povrat novca nije potvrđen dok operator izričito ne potvrdi iznos i način povrata.

Prava i rokovi primjenjuju se u skladu s potvrdom rezervacije, ugovorenim uvjetima i mjerodavnim pravom.$returns_hr$,
      $returns_en$## Contact

For a question or complaint, send the booking number and a description of the request to hello@alderwaycampers.com.

## Handling

The rental team reviews the booking confirmation, payment record and supplied information, then responds with the required next steps. A refund is not confirmed until the operator expressly confirms its amount and method.

Rights and timelines apply according to the booking confirmation, agreed terms and applicable law.$returns_en$
    )
)
insert into legal_document_versions (
  document_key, version_number, version_label, status, effective_date,
  title_hr, title_en, summary_hr, summary_en, content_hr, content_en
)
select
  incoming.document_key,
  coalesce((
    select max(existing.version_number)
    from legal_document_versions as existing
    where existing.document_key = incoming.document_key
  ), 0) + 1,
  incoming.version_label,
  'archived',
  incoming.effective_date,
  incoming.title_hr,
  incoming.title_en,
  incoming.summary_hr,
  incoming.summary_en,
  incoming.content_hr,
  incoming.content_en
from incoming
where not exists (
  select 1
  from legal_document_versions as existing
  where existing.document_key = incoming.document_key
    and existing.version_label = incoming.version_label
);

update legal_document_versions
set status = 'archived'
where status = 'published';

update legal_document_versions
set
  status = 'published',
  published_at = coalesce(published_at, now())
where id in (
  select newest.id
  from (
    select distinct on (document_key) id
    from legal_document_versions
    where version_label = 'alderway-demo-2026-09'
    order by document_key, version_number desc
  ) as newest
);

-- ---------------------------------------------------------------------------
-- CONTENT CATALOGUES OUTSIDE THE RENTAL OFFER
-- Retain records and history for admin/audit purposes, but prevent imported
-- customer-specific catalogues from leaking into the reusable public demo.
-- ---------------------------------------------------------------------------

update posts set is_published = false where is_published = true;
update products set is_active = false where is_active = true;

-- Keep the optional journal and shop flows demonstrable without exposing the
-- imported customer catalogue. Existing IDs are reused so orders, stock
-- reservations and admin history keep their references.
with ranked_categories as (
  select id, row_number() over (order by sort_order, id) as position
  from product_categories
  order by sort_order, id
  limit 3
),
demo_categories(position, slug, name_hr, name_en, sort_order) as (
  values
    (1, 'water-and-power', 'Voda i struja', 'Water & power', 1),
    (2, 'vehicle-hardware', 'Oprema za vozilo', 'Vehicle hardware', 2),
    (3, 'touring-safety', 'Sigurnost na putu', 'Touring safety', 3)
)
update product_categories as category
set
  slug = demo.slug,
  name_hr = demo.name_hr,
  name_en = demo.name_en,
  parent_id = null,
  sort_order = demo.sort_order
from ranked_categories as ranked
join demo_categories as demo on demo.position = ranked.position
where category.id = ranked.id;

with ranked_products as (
  select id, row_number() over (order by id) as position
  from products
  order by id
  limit 9
),
demo_products(
  position, slug, name_hr, name_en, description_hr, description_en,
  price, category_slug, images, stock, sku, pickup_only
) as (
  values
    (
      1,
      '12v-water-pressure-pump',
      'Tlačna pumpa za vodu 12 V',
      '12V water pressure pump',
      'Kompaktna pumpa protoka 7 litara u minuti s automatskim tlačnim prekidačem, tihim nosačima i priključcima za brzo spajanje.',
      'A compact 7-litre-per-minute pump with an automatic pressure switch, vibration-damping mounts and quick-connect fittings.',
      119,
      'water-and-power',
      array['/images/products/rv-parts/12v-water-pump.webp']::text[],
      14,
      'ALD-WTR-01',
      false
    ),
    (
      2,
      'heavy-duty-levelling-ramps',
      'Nivelatori Heavy Duty',
      'Heavy-duty levelling ramps',
      'Par ojačanih troslojnih nivelatora s protukliznim umetcima, prikladan za kampere mase do pet tona.',
      'A pair of reinforced three-stage levelling ramps with high-grip inserts, suitable for motorhomes up to five tonnes.',
      69,
      'touring-safety',
      array['/images/products/rv-parts/levelling-ramps.webp']::text[],
      18,
      'ALD-SAFE-01',
      false
    ),
    (
      3,
      '25m-shore-power-cable',
      'CEE kabel za priključak 25 m',
      '25m shore power cable',
      'Izdržljiv CEE kabel duljine 25 metara s vodootpornim plavim priključcima za kampove i servisna mjesta.',
      'A durable 25-metre CEE cable with weather-resistant blue connectors for campsites and service points.',
      109,
      'water-and-power',
      array['/images/products/rv-parts/shore-power-cable.webp']::text[],
      16,
      'ALD-PWR-01',
      false
    ),
    (
      4,
      'dual-lpg-regulator',
      'Dvojni LPG regulator',
      'Dual LPG regulator',
      'Horizontalni regulator s automatskim prebacivanjem boca, manometrom i sigurnosnim crijevima za stabilan plinski sustav kampera.',
      'A horizontal regulator with automatic cylinder changeover, pressure gauge and safety hoses for a dependable camper gas system.',
      189,
      'vehicle-hardware',
      array['/images/products/rv-parts/dual-lpg-regulator.webp']::text[],
      10,
      'ALD-GAS-01',
      false
    ),
    (
      5,
      'fresh-water-inlet-kit',
      'Priključak za svježu vodu',
      'Fresh-water inlet kit',
      'Vanjski priključak s bravicom, čepom, crijevom prehrambene kvalitete, obujmicama i spojnicama za urednu ugradnju.',
      'A lockable exterior inlet with cap, food-grade hose, clamps and fittings for a clean, secure installation.',
      59,
      'water-and-power',
      array['/images/products/rv-parts/fresh-water-inlet-kit.webp']::text[],
      7,
      'ALD-WTR-02',
      false
    ),
    (
      6,
      '12v-roof-vent-fan',
      'Krovni ventilator 12 V',
      '12V roof vent fan',
      'Niskoprofilni krovni otvor s ventilatorom, zatamnjenim poklopcem i tihim 12 V motorom za učinkovit protok zraka.',
      'A low-profile roof vent with a smoked lid and quiet 12V fan for reliable airflow through the living space.',
      249,
      'vehicle-hardware',
      array['/images/products/rv-parts/roof-vent-fan.webp']::text[],
      15,
      'ALD-HW-01',
      false
    ),
    (
      7,
      'manual-rv-entry-step',
      'Ručna ulazna stepenica 550',
      'Manual RV entry step 550',
      'Izvlačna stepenica širine 550 mm s ojačanim čeličnim okvirom, aluminijskim gazištem i protukliznom površinom.',
      'A 550 mm slide-out step with a reinforced steel frame, aluminium tread and non-slip surface.',
      229,
      'vehicle-hardware',
      array['/images/products/rv-parts/manual-entry-step.webp']::text[],
      12,
      'ALD-HW-02',
      true
    ),
    (
      8,
      'heavy-duty-wheel-chocks',
      'Klinovi za kotače Heavy Duty',
      'Heavy-duty wheel chocks',
      'Par ojačanih klinova s dubokim rebrima i spojnim užetom za sigurno parkiranje kampera i kamp prikolica.',
      'A reinforced pair with deep tyre-grip ribs and a connecting rope for secure motorhome and caravan parking.',
      39,
      'touring-safety',
      array['/images/products/rv-parts/wheel-chocks.webp']::text[],
      11,
      'ALD-SAFE-02',
      false
    ),
    (
      9,
      'universal-towing-mirrors',
      'Univerzalni dodatni retrovizori',
      'Universal towing mirrors',
      'Aerodinamični par dodatnih retrovizora s podesivim krakovima i gumenim stezaljkama za stabilan pogled uz kamp prikolicu.',
      'An aerodynamic pair with adjustable arms and rubber clamps for a stable rearward view when towing a caravan.',
      99,
      'touring-safety',
      array['/images/products/rv-parts/towing-mirrors.webp']::text[],
      9,
      'ALD-SAFE-03',
      false
    )
)
update products as product
set
  slug = demo.slug,
  name_hr = demo.name_hr,
  name_en = demo.name_en,
  description_hr = demo.description_hr,
  description_en = demo.description_en,
  price = demo.price,
  category_id = category.id,
  images = demo.images,
  stock = demo.stock,
  sku = demo.sku,
  brand = 'Alderway Essentials',
  pickup_only = demo.pickup_only,
  is_active = true
from ranked_products as ranked
join demo_products as demo on demo.position = ranked.position
join product_categories as category on category.slug = demo.category_slug
where product.id = ranked.id;

with ranked_posts as (
  select id, row_number() over (order by id) as position
  from posts
  limit 3
)
update posts as post
set
  slug = case ranked.position
    when 1 then 'first-motorhome-weekend-guide'
    when 2 then 'choose-the-right-camper'
    else 'slow-road-trip-packing-list'
  end,
  title_hr = case ranked.position
    when 1 then 'Prvi vikend kamperom: jednostavan vodič'
    when 2 then 'Kako odabrati pravi kamper za svoje putovanje'
    else 'Popis za sporije i lakše putovanje'
  end,
  title_en = case ranked.position
    when 1 then 'Your first motorhome weekend: a simple guide'
    when 2 then 'How to choose the right camper for your trip'
    else 'A packing list for slower, easier road trips'
  end,
  excerpt_hr = case ranked.position
    when 1 then 'Od preuzimanja do prve noći: nekoliko mirnih koraka za samouvjeren početak.'
    when 2 then 'Kreveti, sjedala, spremište i stil vožnje — što zaista treba usporediti.'
    else 'Praktična oprema koja donosi više udobnosti bez nepotrebnog tereta.'
  end,
  content_hr = case ranked.position
    when 1 then 'Za prvi izlet odaberite kratku rutu i kamp do kojeg možete stići prije mraka. Nakon osobnog upoznavanja s vozilom spremite dimenzije kampera, provjerite vodu i struju te ostavite dovoljno vremena za mirno postavljanje. Prva večer najbolja je bez prenatrpanog rasporeda: jednostavan obrok, kratka šetnja i malo vremena za upoznavanje prostora.'
    when 2 then 'Broj ležajeva nije jedina važna brojka. Usporedite homologirana sjedala, raspored kreveta, kupaonicu, veličinu garaže i ukupne dimenzije vozila. Parovima obično odgovara kompaktniji touring van, dok obitelji cijene odvojene zone za spavanje i više spremišta. Pravi izbor je vozilo koje odgovara Vašoj svakodnevnoj rutini na putu.'
    else 'Dobra lista počinje slojevima odjeće, udobnom obućom i jednom manjom torbom po putniku. Dodajte punjače, svjetiljku, višekratne boce i osnovne namirnice za prvi dan. Većina kuhinjske i kamperske opreme već je u vozilu, pa prije polaska provjerite uključen inventar i ponesite samo ono što ćete doista koristiti.'
  end,
  content_en = case ranked.position
    when 1 then 'For a first trip, choose a short route and a campsite you can reach before dark. After the personal handover, save the vehicle dimensions, check the water and power systems, and leave enough time to settle in calmly. Keep the first evening simple: an easy meal, a short walk and time to get comfortable with the space.'
    when 2 then 'Berth count is only part of the decision. Compare belted travel seats, bed layout, bathroom space, garage storage and the vehicle’s overall dimensions. Couples often prefer a compact touring van, while families value separate sleeping zones and more storage. The right choice is the vehicle that fits your daily rhythm on the road.'
    else 'A useful packing list starts with clothing layers, comfortable shoes and one small bag per traveller. Add chargers, a torch, refillable bottles and basic food for the first day. Most kitchen and camping equipment is already on board, so check the included inventory and bring only what you will genuinely use.'
  end,
  cover_image = case ranked.position
    when 1 then '/images/brand/alderway-lifestyle.webp'
    when 2 then '/images/brand/alderway-hero.webp'
    else '/images/brand/alderway-gear-collection.webp'
  end,
  is_published = true,
  published_at = case ranked.position
    when 1 then timestamptz '2026-09-05 09:00:00+00'
    when 2 then timestamptz '2026-08-19 09:00:00+00'
    else timestamptz '2026-08-02 09:00:00+00'
  end
from ranked_posts as ranked
where post.id = ranked.id;

commit;
