-- Petroni backend — Phase 3: editable placeholder pricing configuration.
--
-- These dates, minimum stays and copied prices are NOT final business values.
-- They exist so the pricing calculator can be tested end-to-end before the
-- client configures the real values in the Phase 5 admin panel.

insert into seasons (name, date_from, date_to, min_nights, sort_order)
select 'Zima / proljeće 2026', '2026-01-01', '2026-05-31', 1, 1
where not exists (select 1 from seasons where name = 'Zima / proljeće 2026');

insert into seasons (name, date_from, date_to, min_nights, sort_order)
select 'Predsezona 2026', '2026-06-01', '2026-06-30', 3, 2
where not exists (select 1 from seasons where name = 'Predsezona 2026');

insert into seasons (name, date_from, date_to, min_nights, sort_order)
select 'Glavna sezona 2026', '2026-07-01', '2026-08-31', 7, 3
where not exists (select 1 from seasons where name = 'Glavna sezona 2026');

insert into seasons (name, date_from, date_to, min_nights, sort_order)
select 'Posezona 2026', '2026-09-01', '2026-12-31', 3, 4
where not exists (select 1 from seasons where name = 'Posezona 2026');

-- Start each seasonal price at the vehicle's base price. The admin can then
-- tune each vehicle/season pair independently without a code change.
insert into season_prices (season_id, vehicle_id, price_per_day)
select s.id, v.id, v.base_price_per_day
from seasons s
cross join vehicles v
where s.name in (
  'Zima / proljeće 2026',
  'Predsezona 2026',
  'Glavna sezona 2026',
  'Posezona 2026'
)
  and v.type = 'rental'
  and v.base_price_per_day is not null
on conflict (season_id, vehicle_id) do nothing;

-- Ensure every tooltip has useful database-backed content until the client
-- replaces it with item-specific copy in admin.
update booking_extras
set description_hr = case price_type
  when 'per_day' then 'Dodatna oprema ili usluga obračunava se po danu najma i odabranoj količini.'
  when 'refundable' then 'Povratni polog prikazuje se odvojeno i ne ulazi u iznos koji se plaća pri rezervaciji.'
  else 'Jednokratna dodatna oprema ili usluga za cijelo razdoblje najma.'
end
where description_hr is null or btrim(description_hr) = '';

-- The required booking fee belongs with general charges, not refundable deposits.
update booking_extras set category = 'ostalo' where is_required = true;
