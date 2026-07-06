-- Phase 5A: server-enforced administrators, operational audit trails and
-- token-protected second-payment links.

create table admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null default 'admin' check (role in ('admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- The approved first administrator must already have a Supabase Auth account.
insert into admin_users (user_id, email)
select id, lower(email)
from auth.users
where lower(email) = 'zoezedone@gmail.com'
on conflict (user_id) do update
set email = excluded.email, is_active = true;

create table admin_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_email text,
  entity_type text not null,
  entity_id text not null,
  action text not null,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table email_attempts (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  message_type text not null,
  recipient text not null,
  status text not null check (status in ('sent', 'failed', 'skipped')),
  provider_message_id text,
  error_message text,
  attempted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (booking_id is not null or order_id is not null)
);

create table payment_attempts (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  payment_part integer check (payment_part in (1, 2)),
  provider text not null,
  action text not null,
  status text not null,
  provider_reference text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (booking_id is not null or order_id is not null)
);

create table booking_payment_tokens (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  token_hash text unique not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_admin_events_entity on admin_events (entity_type, entity_id, created_at desc);
create index idx_email_attempts_booking on email_attempts (booking_id, created_at desc);
create index idx_payment_attempts_booking on payment_attempts (booking_id, created_at desc);
create index idx_booking_payment_tokens_booking on booking_payment_tokens (booking_id, created_at desc);

alter table admin_users enable row level security;
alter table admin_events enable row level security;
alter table email_attempts enable row level security;
alter table payment_attempts enable row level security;
alter table booking_payment_tokens enable row level security;

-- No browser policies: these tables are available only to authorized
-- server-side operations through the service-role client.

insert into settings (key, value)
values ('split_payment_due_days', '3')
on conflict (key) do update set value = excluded.value;
