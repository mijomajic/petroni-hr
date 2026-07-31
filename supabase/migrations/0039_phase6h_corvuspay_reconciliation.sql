-- Phase 6H-E: durable CorvusPay reconciliation runs and payment incidents.

create table payment_reconciliation_runs (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('corvuspay')),
  trigger_source text not null check (trigger_source in ('scheduled', 'admin', 'callback')),
  status text not null default 'running' check (status in ('running', 'completed', 'failed')),
  scanned_count integer not null default 0,
  matched_count integer not null default 0,
  incident_count integer not null default 0,
  error_count integer not null default 0,
  details jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table payment_reconciliation_incidents (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('corvuspay')),
  provider_reference text not null,
  booking_id uuid references bookings(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  payment_part integer check (payment_part in (1, 2)),
  expected_amount numeric(10,2) not null,
  currency text not null default 'EUR',
  provider_status text not null,
  local_status text not null,
  severity text not null check (severity in ('warning', 'critical')),
  state text not null default 'open' check (state in ('open', 'resolved')),
  first_detected_at timestamptz not null default now(),
  last_checked_at timestamptz not null default now(),
  last_alerted_at timestamptz,
  resolved_at timestamptz,
  resolution_note text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (booking_id is not null and order_id is null and payment_part is not null)
    or (booking_id is null and order_id is not null and payment_part is null)
  ),
  unique (provider, provider_reference)
);

create index idx_payment_reconciliation_runs_started
  on payment_reconciliation_runs (provider, started_at desc);

create index idx_payment_reconciliation_incidents_open
  on payment_reconciliation_incidents (state, severity, last_checked_at desc);

create index idx_payment_reconciliation_incidents_booking
  on payment_reconciliation_incidents (booking_id, last_checked_at desc);

create index idx_payment_reconciliation_incidents_order
  on payment_reconciliation_incidents (order_id, last_checked_at desc);

alter table payment_reconciliation_runs enable row level security;
alter table payment_reconciliation_incidents enable row level security;

-- No browser policies: payment operations are service-role only.
