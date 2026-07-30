-- Preserve the language selected at booking so the exact HR/EN terms accepted
-- by the customer can be attached to their booking-request email.
alter table bookings
  add column if not exists locale text not null default 'hr'
  check (locale in ('hr', 'en'));
