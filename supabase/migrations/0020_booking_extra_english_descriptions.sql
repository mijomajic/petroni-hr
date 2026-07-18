alter table booking_extras
  add column if not exists description_en text;

with translations(name_hr, description_en) as (
  values
  ('Trošak rezervacije / Booking fee', 'Mandatory one-time reservation processing fee.'),
  ('Posteljina / Bedding', 'Bedding per person for the entire rental.'),
  ('Ručnici 3kom / Towels', 'Set of three towels per person for the entire rental.'),
  ('Posude za jelo (1-4 osobe)', 'Set of dishes, cutlery and pots for 1–4 people.'),
  ('Posude za jelo (5-7 osoba)', 'Set of dishes, cutlery and pots for 5–7 people.'),
  ('Vanjski stol / Outdoor table', 'Outdoor table, charged per rental day.'),
  ('Vanjska stolica / Outdoor chair', 'Outdoor chair, charged per rental day.'),
  ('Bicikl / Bicycle', 'Bicycle, charged per rental day.'),
  ('Bicikl + sjedalo za dijete', 'Bicycle with a child seat, charged per rental day.'),
  ('Nosač za bicikl / Bicycle rack', 'Bicycle rack for the entire rental.'),
  ('GPS GARMIN Camper 770MLT', 'Camper GPS navigation, charged per rental day.'),
  ('GPS GARMIN', 'Standard GPS navigation, charged per rental day.'),
  ('Dodatna plinska boca / Gas cylinder', 'Additional gas bottle for the entire rental.'),
  ('Dodatni vozač / Additional driver', 'Additional driver named in the rental agreement.'),
  ('Pretvarač napona 12v-220v (150/300W)', 'Power inverter, charged per rental day.'),
  ('Dječje sjedalo / Child seat', 'Child seat for the entire rental.'),
  ('Dječje sjedalo - booster', 'Booster seat for the entire rental.'),
  ('Završno čišćenje / Final cleaning', 'Final cleaning excluding the WC, stove, fridge, cutlery, mattresses and upholstery.'),
  ('Čišćenje WC kasete i kućišta', 'Cleaning of the WC cassette and housing.'),
  ('Čišćenje štednjaka', 'Stove cleaning.'),
  ('Štednjak - čišćenje i servis', 'Stove cleaning and servicing.'),
  ('Čišćenje hladnjaka', 'Fridge cleaning.'),
  ('Pranje pribora za jelo', 'Cutlery washing.'),
  ('Čišćenje tapecirunga / Upholstery', 'Cleaning of upholstery, mattresses and seat covers.'),
  ('Prelazak granice / Border crossing fee', 'Border crossing fee.'),
  ('Naknada za otoke / Islands fee', 'Fee for Hvar, Brač, Mljet, Rab or Korčula.'),
  ('Naknada za festival / Festival fee', 'Fee for the OZORA (HU) and MODEM – Momento Demento (HR) festivals.'),
  ('Osiguranje za gume / Tire insurance', 'Additional tyre insurance, charged per rental day.'),
  ('Osiguranje CDW+ / TP', 'Additional CDW+ / TP insurance reduces liability for possible damage by 50%, subject to the rental agreement.')
)
update booking_extras as extra
set description_en = translations.description_en
from translations
where extra.name_hr = translations.name_hr
  and (extra.description_en is null or btrim(extra.description_en) = '');
