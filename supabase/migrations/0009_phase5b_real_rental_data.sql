-- Petroni Phase 5B: real 2026 rental business data from client files.
-- Source files received from Moni on 2026-07-07:
-- - KAMPERI NAJAM - CJENIK 2026 HR DC 2-26.pdf
-- - B26 - Motor homes - OPTIONS 2026 - EN 8-25.pdf
-- - A - Kamperi-UVJETI NAJMA 2025HR EUR 9-25.pdf
-- - B - Motor homes Terms and conditions 2025EN EUR 9-25.pdf

alter table rental_terms add column if not exists content_en text;

drop function if exists replace_active_rental_terms(text, text);
drop function if exists replace_active_rental_terms(text, text, text);

create or replace function replace_active_rental_terms(
  p_version text,
  p_content_hr text,
  p_content_en text default null
)
returns rental_terms
language plpgsql
set search_path = public
as $$
declare
  new_terms rental_terms;
begin
  if length(trim(p_version)) < 3 then
    raise exception 'Verzija uvjeta mora imati najmanje 3 znaka.';
  end if;
  if length(trim(p_content_hr)) < 50 then
    raise exception 'Tekst uvjeta mora imati najmanje 50 znakova.';
  end if;

  update rental_terms set is_active = false where is_active = true;

  insert into rental_terms (version, content_hr, content_en, is_active)
  values (trim(p_version), trim(p_content_hr), nullif(trim(coalesce(p_content_en, '')), ''), true)
  returning * into new_terms;

  return new_terms;
end;
$$;

revoke all on function replace_active_rental_terms(text, text, text) from public, anon, authenticated;
grant execute on function replace_active_rental_terms(text, text, text) to service_role;

update vehicles set is_available = false where type = 'rental';

insert into vehicles (
  slug, name, type, category, seats, beds, bags, max_adults, max_children,
  base_price_per_day, sale_price, description_hr, description_en, images,
  specs, is_available, sort_order
) values
  ('family-air-plus-roller-team-kronos-277m', 'Family Air+ Roller Team Kronos 277M', 'rental', 'Family Air+', 7, 7, 7, 7, 7, 155, null, 'Family Air+ Roller Team Kronos 277M - najam kampera, sezona 2026. Cijena ovisi o terminu najma; polog iznosi 3500 EUR.', 'Family Air+ Roller Team Kronos 277M - najam kampera, sezona 2026. Cijena ovisi o terminu najma; polog iznosi 3500 EUR.', array['https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg'], '{"chassis": "Ford Transit 2.0tdci", "power_hp": 155, "model_year": 2024, "dimensions_m": "6,99x2,35x3,20", "seats_beds": "7/4+3", "transmission": "manual", "cab_ac": true, "living_ac": true, "living_ac_note": "2x airco", "deposit_eur": 3500}'::jsonb, true, 1),
  ('family-air-plus-ci-horon-79m', 'Family Air+ CI Horon 79M', 'rental', 'Family Air+', 6, 6, 6, 6, 6, 155, null, 'Family Air+ CI Horon 79M - najam kampera, sezona 2026. Cijena ovisi o terminu najma; polog iznosi 3500 EUR.', 'Family Air+ CI Horon 79M - najam kampera, sezona 2026. Cijena ovisi o terminu najma; polog iznosi 3500 EUR.', array['https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg'], '{"chassis": "Ford Transit 2.0tdci", "power_hp": 155, "model_year": 2024, "dimensions_m": "6,99x2,35x3,20", "seats_beds": "6/6", "transmission": "manual", "cab_ac": true, "living_ac": true, "living_ac_note": "2x airco", "deposit_eur": 3500}'::jsonb, true, 2),
  ('mclouis-mc4-873', 'Family P-Air+ McLouis MC4 873', 'rental', 'Family P-Air+', 5, 5, 5, 5, 5, 165, null, 'Family P-Air+ McLouis MC4 873 - najam kampera, sezona 2026. Cijena ovisi o terminu najma; polog iznosi 3500 EUR.', 'Family P-Air+ McLouis MC4 873 - najam kampera, sezona 2026. Cijena ovisi o terminu najma; polog iznosi 3500 EUR.', array['https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg'], '{"chassis": "Ford Transit 2.0tdci", "power_hp": 165, "model_year": 2026, "dimensions_m": "7,45x2,35x3,15", "seats_beds": "5/5", "transmission": "automatic", "cab_ac": true, "living_ac": true, "living_ac_note": "2x airco", "deposit_eur": 3500}'::jsonb, true, 3),
  ('family-air-rimor-kilig-50', 'Family Air Rimor Kilig 50', 'rental', 'Family Air', 6, 6, 6, 6, 6, 155, null, 'Family Air Rimor Kilig 50 - najam kampera, sezona 2026. Cijena ovisi o terminu najma; polog iznosi 3000 EUR.', 'Family Air Rimor Kilig 50 - najam kampera, sezona 2026. Cijena ovisi o terminu najma; polog iznosi 3000 EUR.', array['https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg'], '{"chassis": "Ford Transit 2.0tdci", "power_hp": 130, "model_year": 2024, "dimensions_m": "7,29x2,34x3,04", "seats_beds": "6/6", "transmission": "manual", "cab_ac": true, "living_ac": true, "living_ac_note": "2x airco", "deposit_eur": 3000}'::jsonb, true, 4),
  ('family-air-rimor-evo-sound', 'Family Air Rimor EVO Sound', 'rental', 'Family Air', 6, 6, 6, 6, 6, 145, null, 'Family Air Rimor EVO Sound - najam kampera, sezona 2026. Cijena ovisi o terminu najma; polog iznosi 3000 EUR.', 'Family Air Rimor EVO Sound - najam kampera, sezona 2026. Cijena ovisi o terminu najma; polog iznosi 3000 EUR.', array['https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg'], '{"chassis": "Ford Transit 2.0tdci", "power_hp": 130, "model_year": 2022, "dimensions_m": "6,97x2,30x3,04", "seats_beds": "6/4+2", "transmission": "manual", "cab_ac": true, "living_ac": true, "living_ac_note": "2x airco", "deposit_eur": 3000}'::jsonb, true, 5),
  ('caratour-ford-600mq', 'FUN CXL Air* Weinsberg Caratour 600MQ', 'rental', 'FUN CXL Air*', 4, 3, 4, 4, 4, 140, null, 'FUN CXL Air* Weinsberg Caratour 600MQ - najam kampera, sezona 2026. Cijena ovisi o terminu najma; polog iznosi 3000 EUR.', 'FUN CXL Air* Weinsberg Caratour 600MQ - najam kampera, sezona 2026. Cijena ovisi o terminu najma; polog iznosi 3000 EUR.', array['https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp'], '{"chassis": "Ford Transit 2.0tdci", "power_hp": 170, "model_year": 2025, "dimensions_m": "5,99x2,06x3,20", "seats_beds": "4/2+1", "transmission": "automatic", "cab_ac": true, "living_ac": true, "living_ac_note": "2x airco", "deposit_eur": 3000}'::jsonb, true, 6),
  ('fun-cxl-air-knaus-boxdrive-680me', 'FUN CXL Air* Knaus Boxdrive 680ME', 'rental', 'FUN CXL Air*', 4, 3, 4, 4, 4, 135, null, 'FUN CXL Air* Knaus Boxdrive 680ME - najam kampera, sezona 2026. Cijena ovisi o terminu najma; polog iznosi 3000 EUR.', 'FUN CXL Air* Knaus Boxdrive 680ME - najam kampera, sezona 2026. Cijena ovisi o terminu najma; polog iznosi 3000 EUR.', array['https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp'], '{"chassis": "MAN TGE 2,0 tdi", "power_hp": 177, "model_year": 2021, "dimensions_m": "6,84x2,04x2,68", "seats_beds": "4/2+1", "transmission": "manual", "cab_ac": true, "living_ac": true, "living_ac_note": "2x airco", "deposit_eur": 3000}'::jsonb, true, 7),
  ('v4wd-petrovan-53-4motion', 'V4WD PetroVan 53 4x4 - 4motion', 'rental', 'V4WD', 2, 2, 2, 2, 2, 95, null, 'V4WD PetroVan 53 4x4 - 4motion - najam kampera, sezona 2026. Cijena ovisi o terminu najma; polog iznosi 2500 EUR.', 'V4WD PetroVan 53 4x4 - 4motion - najam kampera, sezona 2026. Cijena ovisi o terminu najma; polog iznosi 2500 EUR.', array['https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg'], '{"chassis": "VW Transporter T6", "power_hp": 150, "model_year": 2019, "dimensions_m": "5,31x1,91x2,60", "seats_beds": "2/2", "transmission": "manual", "cab_ac": false, "living_ac": true, "living_ac_note": "1x airco", "deposit_eur": 2500}'::jsonb, true, 8),
  ('budgetvan-55', 'V2WD BudgetVan 55', 'rental', 'V2WD', 2, 2, 2, 2, 2, 85, null, 'V2WD BudgetVan 55 - najam kampera, sezona 2026. Cijena ovisi o terminu najma; polog iznosi 2000 EUR.', 'V2WD BudgetVan 55 - najam kampera, sezona 2026. Cijena ovisi o terminu najma; polog iznosi 2000 EUR.', array['https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg'], '{"chassis": "Renault Master", "power_hp": 170, "model_year": 2019, "dimensions_m": "5,55x2,07x2,65", "seats_beds": "2/2", "transmission": "manual", "cab_ac": false, "living_ac": true, "living_ac_note": "1x airco", "deposit_eur": 2000}'::jsonb, true, 9)
on conflict (slug) do update set
  name = excluded.name,
  type = excluded.type,
  category = excluded.category,
  seats = excluded.seats,
  beds = excluded.beds,
  bags = excluded.bags,
  max_adults = excluded.max_adults,
  max_children = excluded.max_children,
  base_price_per_day = excluded.base_price_per_day,
  sale_price = excluded.sale_price,
  description_hr = excluded.description_hr,
  description_en = excluded.description_en,
  images = excluded.images,
  specs = excluded.specs,
  is_available = excluded.is_available,
  sort_order = excluded.sort_order;

-- Replace placeholder 2026 seasons with the client's exact split date ranges.
delete from seasons where date_from >= date '2026-01-01' and date_to <= date '2026-12-31';

insert into seasons (name, date_from, date_to, min_nights, sort_order) values
  ('Niska sezona 2026 (1.1.-28.3.)', date '2026-01-01', date '2026-03-28', 5, 1),
  ('Srednja sezona 2026 (29.3.-16.7.)', date '2026-03-29', date '2026-07-16', 7, 2),
  ('Visoka sezona 2026 (17.7.-23.8.)', date '2026-07-17', date '2026-08-23', 10, 3),
  ('Srednja sezona 2026 (24.8.-1.11.)', date '2026-08-24', date '2026-11-01', 7, 4),
  ('Niska sezona 2026 (2.11.-31.12.)', date '2026-11-02', date '2026-12-31', 5, 5);

insert into season_prices (season_id, vehicle_id, price_per_day)
select s.id, v.id, p.price_per_day
from (values
  ('Niska sezona 2026 (1.1.-28.3.)', 'family-air-plus-roller-team-kronos-277m', 155),
  ('Srednja sezona 2026 (29.3.-16.7.)', 'family-air-plus-roller-team-kronos-277m', 180),
  ('Visoka sezona 2026 (17.7.-23.8.)', 'family-air-plus-roller-team-kronos-277m', 195),
  ('Srednja sezona 2026 (24.8.-1.11.)', 'family-air-plus-roller-team-kronos-277m', 180),
  ('Niska sezona 2026 (2.11.-31.12.)', 'family-air-plus-roller-team-kronos-277m', 155),
  ('Niska sezona 2026 (1.1.-28.3.)', 'family-air-plus-ci-horon-79m', 155),
  ('Srednja sezona 2026 (29.3.-16.7.)', 'family-air-plus-ci-horon-79m', 180),
  ('Visoka sezona 2026 (17.7.-23.8.)', 'family-air-plus-ci-horon-79m', 195),
  ('Srednja sezona 2026 (24.8.-1.11.)', 'family-air-plus-ci-horon-79m', 180),
  ('Niska sezona 2026 (2.11.-31.12.)', 'family-air-plus-ci-horon-79m', 155),
  ('Niska sezona 2026 (1.1.-28.3.)', 'mclouis-mc4-873', 165),
  ('Srednja sezona 2026 (29.3.-16.7.)', 'mclouis-mc4-873', 190),
  ('Visoka sezona 2026 (17.7.-23.8.)', 'mclouis-mc4-873', 205),
  ('Srednja sezona 2026 (24.8.-1.11.)', 'mclouis-mc4-873', 190),
  ('Niska sezona 2026 (2.11.-31.12.)', 'mclouis-mc4-873', 165),
  ('Niska sezona 2026 (1.1.-28.3.)', 'family-air-rimor-kilig-50', 155),
  ('Srednja sezona 2026 (29.3.-16.7.)', 'family-air-rimor-kilig-50', 180),
  ('Visoka sezona 2026 (17.7.-23.8.)', 'family-air-rimor-kilig-50', 195),
  ('Srednja sezona 2026 (24.8.-1.11.)', 'family-air-rimor-kilig-50', 180),
  ('Niska sezona 2026 (2.11.-31.12.)', 'family-air-rimor-kilig-50', 155),
  ('Niska sezona 2026 (1.1.-28.3.)', 'family-air-rimor-evo-sound', 145),
  ('Srednja sezona 2026 (29.3.-16.7.)', 'family-air-rimor-evo-sound', 170),
  ('Visoka sezona 2026 (17.7.-23.8.)', 'family-air-rimor-evo-sound', 185),
  ('Srednja sezona 2026 (24.8.-1.11.)', 'family-air-rimor-evo-sound', 170),
  ('Niska sezona 2026 (2.11.-31.12.)', 'family-air-rimor-evo-sound', 145),
  ('Niska sezona 2026 (1.1.-28.3.)', 'caratour-ford-600mq', 140),
  ('Srednja sezona 2026 (29.3.-16.7.)', 'caratour-ford-600mq', 165),
  ('Visoka sezona 2026 (17.7.-23.8.)', 'caratour-ford-600mq', 175),
  ('Srednja sezona 2026 (24.8.-1.11.)', 'caratour-ford-600mq', 165),
  ('Niska sezona 2026 (2.11.-31.12.)', 'caratour-ford-600mq', 140),
  ('Niska sezona 2026 (1.1.-28.3.)', 'fun-cxl-air-knaus-boxdrive-680me', 135),
  ('Srednja sezona 2026 (29.3.-16.7.)', 'fun-cxl-air-knaus-boxdrive-680me', 155),
  ('Visoka sezona 2026 (17.7.-23.8.)', 'fun-cxl-air-knaus-boxdrive-680me', 170),
  ('Srednja sezona 2026 (24.8.-1.11.)', 'fun-cxl-air-knaus-boxdrive-680me', 155),
  ('Niska sezona 2026 (2.11.-31.12.)', 'fun-cxl-air-knaus-boxdrive-680me', 135),
  ('Niska sezona 2026 (1.1.-28.3.)', 'v4wd-petrovan-53-4motion', 95),
  ('Srednja sezona 2026 (29.3.-16.7.)', 'v4wd-petrovan-53-4motion', 105),
  ('Visoka sezona 2026 (17.7.-23.8.)', 'v4wd-petrovan-53-4motion', 125),
  ('Srednja sezona 2026 (24.8.-1.11.)', 'v4wd-petrovan-53-4motion', 105),
  ('Niska sezona 2026 (2.11.-31.12.)', 'v4wd-petrovan-53-4motion', 95),
  ('Niska sezona 2026 (1.1.-28.3.)', 'budgetvan-55', 85),
  ('Srednja sezona 2026 (29.3.-16.7.)', 'budgetvan-55', 95),
  ('Visoka sezona 2026 (17.7.-23.8.)', 'budgetvan-55', 115),
  ('Srednja sezona 2026 (24.8.-1.11.)', 'budgetvan-55', 95),
  ('Niska sezona 2026 (2.11.-31.12.)', 'budgetvan-55', 85)
) as p(season_name, vehicle_slug, price_per_day)
join seasons s on s.name = p.season_name
join vehicles v on v.slug = p.vehicle_slug
on conflict (season_id, vehicle_id) do update set price_per_day = excluded.price_per_day;

update fees set
  name_hr = 'Naknada za nedjelju/praznik',
  description_hr = 'Doplata za preuzimanje ili povrat nedjeljom ili hrvatskim praznikom.',
  amount = 100,
  fee_type = 'per_event',
  is_active = true
where key = 'sunday_holiday';

update fees set
  name_hr = 'Naknada izvan radnog vremena',
  description_hr = 'Doplata za preuzimanje/povrat izvan radnog vremena u Hrvatskoj. Za inozemne lokacije vrijedi poseban iznos iz cjenika.',
  amount = 85,
  fee_type = 'per_event',
  is_active = true
where key = 'after_hours';

update fees set
  name_hr = 'Naknada za prekoračenje kilometara',
  description_hr = 'Cijena po prijeđenom kilometru iznad uključenih 300 km/dan.',
  amount = 0.30,
  fee_type = 'per_km',
  is_active = true
where key = 'extra_km';

update rental_locations set location_fee = case name
  when 'Zagreb Depot' then 0
  when 'Zagreb Airport' then 50
  when 'Zagreb City Centre' then 70
  when 'Dubrovnik Airport' then 800
  when 'Split Airport' then 520
  when 'Pula Airport' then 520
  when 'Budapest Airport' then 730
  when 'Vienna Airport' then 730
  when 'Krk (Rijeka) Airport' then 450
  when 'Zadar Airport' then 450
  when 'Ljubljana Airport' then 450
  else location_fee
end;

-- Vehicle deposits now come from vehicles.specs.deposit_eur, so hide the old selectable deposit placeholders.
update booking_extras
set category = 'admin_depozit', is_required = false, max_qty = 0
where price_type = 'refundable';

with incoming(name_hr, name_en, price, price_type, category, max_qty, is_required, sort_order, description_hr) as (
  values
  ('Trošak rezervacije / Booking fee', 'Booking fee', 30, 'per_rental', 'ostalo', 1, true, 1, 'Obavezna jednokratna naknada za obradu rezervacije.'),
  ('Posteljina / Bedding', 'Linen set / bedding', 35, 'per_rental', 'oprema', 7, false, 5, 'Posteljina po osobi za cijeli najam.'),
  ('Ručnici 3kom / Towels', 'Towels (3 pcs)', 15, 'per_rental', 'oprema', 7, false, 6, 'Set od tri ručnika po osobi za cijeli najam.'),
  ('Posude za jelo (1-4 osobe)', 'Cutlery, pots and dishes (1-4 persons)', 50, 'per_rental', 'oprema', 1, false, 4, 'Set posuđa, pribora i lonaca za 1-4 osobe.'),
  ('Posude za jelo (5-7 osoba)', 'Cutlery, pots and dishes (5-7 persons)', 60, 'per_rental', 'oprema', 1, false, 4, 'Set posuđa, pribora i lonaca za 5-7 osoba.'),
  ('Vanjski stol / Outdoor table', 'Outdoor table', 3, 'per_day', 'oprema', 2, false, 17, 'Vanjski stol, obračun po danu najma.'),
  ('Vanjska stolica / Outdoor chair', 'Outdoor chair', 2, 'per_day', 'oprema', 7, false, 16, 'Vanjska stolica, obračun po danu najma.'),
  ('Bicikl / Bicycle', 'Bike', 10, 'per_day', 'oprema', 4, false, 7, 'Bicikl, obračun po danu najma.'),
  ('Bicikl + sjedalo za dijete', 'Bike + child seat', 15, 'per_day', 'oprema', 2, false, 9, 'Bicikl sa sjedalom za dijete, obračun po danu najma.'),
  ('Nosač za bicikl / Bicycle rack', 'Bike carrier', 40, 'per_rental', 'oprema', 1, false, 8, 'Nosač za bicikl za cijeli najam.'),
  ('GPS GARMIN Camper 770MLT', 'GPS navigation system GARMIN Camper 770MLT', 10, 'per_day', 'oprema', 1, false, 15, 'Camper GPS navigacija, obračun po danu najma.'),
  ('GPS GARMIN', 'GPS navigation system GARMIN - standard version', 7, 'per_day', 'oprema', 1, false, 14, 'Standardna GPS navigacija, obračun po danu najma.'),
  ('Dodatna plinska boca / Gas cylinder', 'Additional gas bottle', 50, 'per_rental', 'oprema', 2, false, 19, 'Dodatna plinska boca za cijeli najam.'),
  ('Dodatni vozač / Additional driver', 'Additional driver', 55, 'per_rental', 'ostalo', 2, false, 18, 'Dodatni vozač upisan u ugovor o najmu.'),
  ('Pretvarač napona 12v-220v (150/300W)', 'Power inverter 12v>220V (150/300W)', 4, 'per_day', 'oprema', 1, false, 12, 'Pretvarač napona, obračun po danu najma.'),
  ('Dječje sjedalo / Child seat', 'Child seat', 40, 'per_rental', 'oprema', 2, false, 10, 'Dječje sjedalo za cijeli najam.'),
  ('Dječje sjedalo - booster', 'Child seat - booster', 15, 'per_rental', 'oprema', 2, false, 11, 'Booster sjedalo za cijeli najam.'),
  ('Završno čišćenje / Final cleaning', 'Final cleaning', 150, 'per_rental', 'ciscenje', 1, false, 27, 'Završno čišćenje bez WC-a, štednjaka, hladnjaka, pribora, madraca i presvlaka.'),
  ('Čišćenje WC kasete i kućišta', 'WC cassette + housing cleaning', 150, 'per_rental', 'ciscenje', 1, false, 21, 'Čišćenje WC kasete i kućišta.'),
  ('Čišćenje štednjaka', 'Stove cleaning', 80, 'per_rental', 'ciscenje', 1, false, 23, 'Čišćenje štednjaka.'),
  ('Štednjak - čišćenje i servis', 'Stove cleaning + service', 150, 'per_rental', 'ciscenje', 1, false, 24, 'Čišćenje i servis štednjaka.'),
  ('Čišćenje hladnjaka', 'Fridge cleaning', 60, 'per_rental', 'ciscenje', 1, false, 22, 'Čišćenje hladnjaka.'),
  ('Pranje pribora za jelo', 'Cutlery washing', 60, 'per_rental', 'ciscenje', 1, false, 25, 'Pranje pribora za jelo.'),
  ('Čišćenje tapecirunga / Upholstery', 'Upholstery cleaning - mattresses and seat covers', 200, 'per_rental', 'ciscenje', 1, false, 26, 'Čišćenje tapecirunga, madraca i presvlaka.'),
  ('Prelazak granice / Border crossing fee', 'Border crossing fee', 120, 'per_rental', 'ostalo', 1, false, 28, 'Naknada za prelazak granice.'),
  ('Naknada za otoke / Islands fee', 'Islands fee - Hvar, Brač, Mljet, Rab, Korčula', 70, 'per_rental', 'ostalo', 1, false, 29, 'Naknada za Hvar, Brač, Mljet, Rab ili Korčulu.'),
  ('Naknada za festival / Festival fee', 'Festival fee - OZORA and MODEM', 1500, 'per_rental', 'ostalo', 1, false, 30, 'Naknada za festivale OZORA (HU) i MODEM - Momento Demento (HR).'),
  ('Osiguranje za gume / Tire insurance', 'Insurance for tires', 10, 'per_day', 'ostalo', 1, false, 20, 'Dodatno osiguranje za gume, obračun po danu najma.'),
  ('Osiguranje CDW+ / TP', 'Insurance CDW PLUS, TP - excess reduction', 30, 'per_day', 'ostalo', 1, false, 31, 'Dodatno osiguranje CDW+ / TP umanjuje odgovornost za moguću štetu za 50%, uz uvjete iz ugovora.')
), updated as (
  update booking_extras b
  set name_en = i.name_en,
      price = i.price,
      price_type = i.price_type,
      category = i.category,
      max_qty = i.max_qty,
      is_required = i.is_required,
      sort_order = i.sort_order,
      description_hr = i.description_hr
  from incoming i
  where b.name_hr = i.name_hr
  returning b.name_hr
)
insert into booking_extras (name_hr, name_en, price, price_type, category, max_qty, is_required, sort_order, description_hr)
select i.name_hr, i.name_en, i.price, i.price_type, i.category, i.max_qty, i.is_required, i.sort_order, i.description_hr
from incoming i
where not exists (select 1 from updated u where u.name_hr = i.name_hr)
  and not exists (select 1 from booking_extras b where b.name_hr = i.name_hr);

-- The full HR/EN rental terms PDFs are intentionally not embedded here because
-- the Supabase dashboard can truncate very long SQL strings before execution.
-- After this migration is applied, load the approved HR/EN text through the
-- protected admin rental-terms editor, which uses replace_active_rental_terms.
delete from rental_terms where version = '2025-09-petroni-client-terms-pending-full-text';

select replace_active_rental_terms(
  '2025-09-petroni-client-terms-pending-full-text',
  'Privremeni zapis: puni odobreni uvjeti najma iz Moninih HR/EN PDF dokumenata moraju se unijeti kroz admin prije primanja stvarnih rezervacija. Ovaj zapis postoji samo kako bi migracija 0009 mogla sigurno proći kroz Supabase dashboard i zadržati aktivnu verziju uvjeta.',
  'Temporary record: the full approved rental terms from Moni''s HR/EN PDF documents must be entered through admin before accepting real bookings. This record only exists so migration 0009 can run safely through the Supabase dashboard and keep an active terms version.'
);
