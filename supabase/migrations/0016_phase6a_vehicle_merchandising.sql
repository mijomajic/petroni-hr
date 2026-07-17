-- Phase 6A: keep rental vehicles bookable while also merchandising them for
-- sale, and give the admin a structured place for individual bed dimensions.

begin;

alter table vehicles
  add column if not exists is_for_sale boolean not null default false,
  add column if not exists bed_dimensions_hr text[] not null default '{}'::text[],
  add column if not exists bed_dimensions_en text[] not null default '{}'::text[];

comment on column vehicles.is_for_sale is
  'Shows a vehicle in the sales catalogue without changing its rental/film type.';

comment on column vehicles.bed_dimensions_hr is
  'Croatian customer-facing list of individual bed labels and dimensions, one item per bed/group.';

comment on column vehicles.bed_dimensions_en is
  'English customer-facing list of individual bed labels and dimensions, one item per bed/group.';

-- Moni confirmed that the complete current rental fleet is also available for
-- sale. The vehicle type deliberately stays "rental" so booking availability,
-- seasonal pricing and reservation flows continue to work unchanged.
update vehicles
set is_for_sale = true
where type = 'rental';

-- Verified manufacturer/model measurements supplied for the current rental
-- fleet. Keep each physical bed or convertible bed group as a separate item so
-- Moni can edit/reorder the public list without touching vehicle specs JSON.
update vehicles
set
  bed_dimensions_hr = array[
    'Kreveti na kat — 215 × 80 cm (2×)',
    'Alkoven — 209 × 160 cm',
    'Centralni ležaj, veći stol — 186 × 125 cm',
    'Centralni ležaj, manji stol — 160 × 65 cm'
  ],
  bed_dimensions_en = array[
    'Bunk beds — 215 × 80 cm (2×)',
    'Overcab bed — 209 × 160 cm',
    'Dinette bed, larger table — 186 × 125 cm',
    'Dinette bed, smaller table — 160 × 65 cm'
  ]
where slug = 'roller-team-kronos-277m';

update vehicles
set
  bed_dimensions_hr = array[
    'Ležaj — 130 × 200 cm',
    'Ležaj — 125 × 200 cm',
    'Ležaj — 125 × 200 cm'
  ],
  bed_dimensions_en = array[
    'Bed — 130 × 200 cm',
    'Bed — 125 × 200 cm',
    'Bed — 125 × 200 cm'
  ]
where slug = 'ci-horon-79m';

update vehicles
set
  bed_dimensions_hr = array[
    'Stražnji ležajevi — 200 × 80 cm + 200 × 80 cm / 215 × 171 cm',
    'Pomoćni ležaj u blagovaonici — 216 × 50 cm',
    'Podizni ležaj — 203 × 135/114 cm'
  ],
  bed_dimensions_en = array[
    'Rear beds — 200 × 80 cm + 200 × 80 cm / 215 × 171 cm',
    'Auxiliary dinette bed — 216 × 50 cm',
    'Drop-down bed — 203 × 135/114 cm'
  ]
where slug = 'mclouis-mc4-873';

update vehicles
set
  bed_dimensions_hr = array[
    'Alkoven za dvije osobe — 220 × 143 cm',
    'Stražnji kreveti na kat — 200 × 78 cm (4×)'
  ],
  bed_dimensions_en = array[
    'Overcab bed for two — 220 × 143 cm',
    'Rear bunk beds — 200 × 78 cm (4×)'
  ]
where slug = 'rimor-kilig-50';

update vehicles
set
  bed_dimensions_hr = array[
    'Alkoven — 220 × 143 cm',
    'Centralni ležaj — 159,4 × 66 cm',
    'Centralni ležaj — 189 × 129 cm',
    'Kreveti na kat — 190 × 78,5 cm (2×)'
  ],
  bed_dimensions_en = array[
    'Overcab bed — 220 × 143 cm',
    'Dinette bed — 159.4 × 66 cm',
    'Dinette bed — 189 × 129 cm',
    'Bunk beds — 190 × 78.5 cm (2×)'
  ]
where slug = 'rimor-evo-sound';

update vehicles
set
  bed_dimensions_hr = array[
    'Pomoćni ležaj u sjedalima — 156 × 70 cm',
    'Opcionalni gostinjski ležaj — 164 × 100/62 cm',
    'Stražnji ležaj — 193 × 147/138 cm'
  ],
  bed_dimensions_en = array[
    'Auxiliary bed in the seating area — 156 × 70 cm',
    'Optional guest bed — 164 × 100/62 cm',
    'Rear bed — 193 × 147/138 cm'
  ]
where slug = 'caratour-ford-600mq';

update vehicles
set
  bed_dimensions_hr = array[
    'Uzdužni ležaj — 198 × 78 cm',
    'Uzdužni ležaj — 205 × 78 cm'
  ],
  bed_dimensions_en = array[
    'Longitudinal bed — 198 × 78 cm',
    'Longitudinal bed — 205 × 78 cm'
  ]
where slug = 'knaus-boxdrive-680me';

update vehicles
set
  bed_dimensions_hr = array['Ležaj — 190 × 130 cm'],
  bed_dimensions_en = array['Bed — 190 × 130 cm']
where slug = 'petrovan-53-4x4';

update vehicles
set
  bed_dimensions_hr = array['Ležaj — 189 × 125 cm'],
  bed_dimensions_en = array['Bed — 189 × 125 cm']
where slug = 'budget-van-55';

update vehicles
set
  bed_dimensions_hr = array[
    'Prednji ležaj — 215 × 141/135 cm',
    'Stražnji ležaj — 199 × 137 cm',
    'Stražnji ležaj — 189 × 70 cm',
    'Podizni ležaj — 180 × 66 cm'
  ],
  bed_dimensions_en = array[
    'Front bed — 215 × 141/135 cm',
    'Rear bed — 199 × 137 cm',
    'Rear bed — 189 × 70 cm',
    'Drop-down bed — 180 × 66 cm'
  ]
where slug = 'weinsberg-caraone-550uk';

update vehicles
set
  bed_dimensions_hr = array[
    'Prednji ležaj — 208 × 139 cm',
    'Središnji ležaj — 183 × 94/124 cm',
    'Stražnji ležaj — 187 × 76 cm',
    'Stražnji ležaj — 188 × 70 cm'
  ],
  bed_dimensions_en = array[
    'Front bed — 208 × 139 cm',
    'Dinette bed — 183 × 94/124 cm',
    'Rear bed — 187 × 76 cm',
    'Rear bed — 188 × 70 cm'
  ]
where slug = 'weinsberg-caraone-550qdk';

commit;
