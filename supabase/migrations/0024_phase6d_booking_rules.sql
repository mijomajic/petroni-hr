-- Phase 6D: booking time rules, split-payment timing and editable extra ordering.

-- Reconcile the earlier, not-yet-applied booking declaration migration so the
-- border/festival choices are priced from explicit customer declarations.
alter table booking_extras
  add column if not exists auto_apply_rule text;

alter table booking_extras
  drop constraint if exists booking_extras_auto_apply_rule_check;

alter table booking_extras
  add constraint booking_extras_auto_apply_rule_check
  check (auto_apply_rule is null or auto_apply_rule in ('border_crossing', 'festival'));

update booking_extras
set category = 'posebne_naknade', auto_apply_rule = 'border_crossing'
where name_hr = 'Prelazak granice / Border crossing fee';

update booking_extras
set category = 'posebne_naknade', auto_apply_rule = 'festival'
where name_hr = 'Naknada za festival / Festival fee';

update booking_extras
set category = 'posebne_naknade'
where name_hr = 'Naknada za otoke / Islands fee';

-- Category metadata controls the public group order without a deployment.
create table if not exists booking_extra_categories (
  key text primary key,
  name_hr text not null,
  name_en text not null,
  sort_order integer not null default 0
);

insert into booking_extra_categories (key, name_hr, name_en, sort_order) values
  ('ostalo', 'Ostalo', 'Other', 1),
  ('oprema', 'Dodatna oprema', 'Equipment', 2),
  ('posebne_naknade', 'Posebne naknade', 'Special fees', 3),
  ('ciscenje', 'Čišćenje', 'Cleaning', 4),
  ('depozit', 'Povratni depoziti', 'Refundable deposits', 5)
on conflict (key) do nothing;

alter table booking_extra_categories enable row level security;

create policy "Public read booking extra categories"
  on booking_extra_categories for select using (true);

-- Time-policy metadata keeps automatic Zagreb rules separate from locations
-- whose handover time is confirmed manually.
alter table rental_locations
  add column if not exists time_policy text not null default 'agreement_hr',
  add column if not exists after_hours_start text;

alter table rental_locations
  drop constraint if exists rental_locations_time_policy_check;

alter table rental_locations
  add constraint rental_locations_time_policy_check
  check (time_policy in ('zagreb_automatic', 'agreement_hr', 'agreement_overseas'));

update rental_locations
set
  time_policy = 'zagreb_automatic',
  pickup_window = '13:00-15:00',
  return_window = '08:00-10:00',
  after_hours_start = '15:00'
where name like 'Zagreb%';

update rental_locations
set
  time_policy = 'agreement_overseas',
  after_hours_start = '16:00'
where name in ('Ljubljana Airport', 'Budapest Airport', 'Vienna Airport');

update rental_locations
set
  time_policy = 'agreement_hr',
  after_hours_start = null
where name not like 'Zagreb%'
  and name not in ('Ljubljana Airport', 'Budapest Airport', 'Vienna Airport');

-- The fixed after-hours amount remains the established Croatian amount.
update fees
set
  name_hr = 'Naknada izvan radnog vremena',
  description_hr = 'Fiksna doplata za preuzimanje ili povrat u Zagrebu nakon 15:00.',
  amount = 85,
  fee_type = 'per_event',
  is_active = true
where key = 'after_hours';

insert into fees (key, name_hr, description_hr, amount, fee_type, is_active) values
  ('early_pickup_hour', 'Ranije preuzimanje', 'Doplata po satu za preuzimanje u Zagrebu prije besplatnog termina.', 30, 'per_event', true),
  ('late_return_hour', 'Kasniji povrat', 'Doplata po satu za povrat u Zagrebu nakon besplatnog termina, do 15:00.', 30, 'per_event', true),
  ('overseas_after_hours', 'Moguća inozemna doplata nakon 16:00', 'Moguća doplata za termin izvan Hrvatske nakon 16:00. Primjenjuje se isključivo prema dogovoru i ne zbraja se automatski.', 200, 'per_event', true)
on conflict (key) do update set
  name_hr = excluded.name_hr,
  description_hr = excluded.description_hr,
  amount = excluded.amount,
  fee_type = excluded.fee_type,
  is_active = excluded.is_active;

-- Business timing stays editable in admin. Split payment is offered only when
-- pickup is more than 45 days away; the second half is due 45 days before pickup.
insert into settings (key, value) values
  ('booking_time_selection_start', '"09:00"'),
  ('booking_time_selection_end', '"18:00"'),
  ('split_payment_min_advance_days', '45'),
  ('split_payment_due_days', '45')
on conflict (key) do update set value = excluded.value;
