-- Phase 4: payment accounting, e-consent and notification state.
alter table bookings
  add column if not exists first_payment_amount numeric,
  add column if not exists second_payment_amount numeric,
  add column if not exists payment_status text default 'unpaid',
  add column if not exists confirmation_email_sent boolean default false;

alter table orders
  add column if not exists shipped_at timestamptz;

create unique index if not exists idx_rental_terms_one_active
  on rental_terms (is_active) where is_active = true;

-- Placeholder only. Replace through the Phase 5 terms editor before production use.
insert into rental_terms (version, content_hr, is_active)
select
  '2026-draft-1',
  'PRIVREMENI TEKST UVJETA NAJMA. Ovaj tekst mora zamijeniti puni tekst uvjeta koji odobri Petroni d.o.o. prije produkcijske uporabe.',
  true
where not exists (select 1 from rental_terms where is_active = true);

insert into settings (key, value) values
  ('split_payment_due_days', '7'),
  ('email_from', '"Petroni <rezervacije@petroni.hr>"')
on conflict (key) do nothing;
