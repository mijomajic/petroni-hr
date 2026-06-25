-- Petroni backend — Phase 1: schema
-- Full schema per the backend build plan. All business values (prices, fees,
-- season dates, working hours, min nights) are seeded as PLACEHOLDERS in
-- 0002_seed.sql and are meant to be edited by the client via the admin panel.
-- Nothing here hardcodes a final business number.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- VEHICLES
-- ---------------------------------------------------------------------------
create table vehicles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  type text not null default 'rental',         -- 'rental' | 'sale' | 'film'
  category text,                                 -- 'COMFORT' | 'ECO' | 'ELITE' | 'DUO 4x4'
  seats integer,
  beds integer,
  bags integer,
  max_adults integer,                            -- for adults+children filter
  max_children integer,
  base_price_per_day numeric,                    -- fallback if no season matches
  sale_price numeric,
  description_hr text,
  description_en text,
  images text[],
  specs jsonb,
  is_available boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- SEASONS (client configures dates + min nights via admin)
-- ---------------------------------------------------------------------------
create table seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,                            -- 'Predsezona', 'Glavna sezona', etc.
  date_from date not null,
  date_to date not null,
  min_nights integer default 1,
  sort_order integer default 0
);

-- SEASON PRICING (price per vehicle per season)
create table season_prices (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id) on delete cascade,
  vehicle_id uuid references vehicles(id) on delete cascade,
  price_per_day numeric not null,
  unique (season_id, vehicle_id)
);

-- ---------------------------------------------------------------------------
-- FEES (client configures amounts; pricing engine applies by type)
-- ---------------------------------------------------------------------------
create table fees (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,                      -- 'sunday_holiday' | 'after_hours' | 'extra_km'
  name_hr text not null,
  description_hr text,
  amount numeric not null,
  fee_type text not null,                        -- 'per_day' | 'per_event' | 'per_km' | 'percent'
  is_active boolean default true
);

-- LOCATIONS (each can carry its own fee + working-hour windows)
create table rental_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location_fee numeric default 0,
  pickup_window text,                            -- e.g. '13:00-15:00'
  return_window text,                            -- e.g. '08:00-10:00'
  sort_order integer default 0
);

-- BOOKING EXTRAS catalogue
create table booking_extras (
  id uuid primary key default gen_random_uuid(),
  name_hr text not null,
  name_en text,
  description_hr text,                           -- shown in info tooltip
  price numeric not null,
  price_type text default 'per_rental',          -- 'per_rental' | 'per_day' | 'refundable'
  category text,                                 -- 'oprema' | 'ciscenje' | 'depozit' | 'ostalo'
  max_qty integer default 1,
  is_required boolean default false,
  sort_order integer default 0
);

-- ---------------------------------------------------------------------------
-- BOOKINGS
-- ---------------------------------------------------------------------------
create table bookings (
  id uuid primary key default gen_random_uuid(),
  confirmation_number text unique,
  user_id uuid references auth.users(id),        -- null if guest
  vehicle_id uuid references vehicles(id),
  pickup_location text not null,
  dropoff_location text not null,
  pickup_date date not null,
  dropoff_date date not null,
  pickup_time text not null,
  dropoff_time text not null,
  num_adults integer,
  num_children integer,
  planned_km integer,                            -- client always asks this
  destination text,                              -- client always asks this
  driver_name text not null,
  driver_last_name text,
  driver_email text not null,
  driver_phone text not null,
  driver_dob date,                               -- must be 28+ (configurable in settings)
  driver_license text,
  driver_license_country text,
  billing jsonb,                                 -- company name, OIB, address (optional)
  notes text,
  price_breakdown jsonb,                         -- full itemized calc snapshot
  extras_total numeric default 0,
  fees_total numeric default 0,
  total_price numeric not null,
  deposit_amount numeric,                        -- if split payment
  payment_split boolean default false,           -- true = 50/50
  first_payment_status text default 'unpaid',    -- 'unpaid' | 'paid'
  second_payment_status text default 'unpaid',   -- 'unpaid' | 'paid' | 'not_applicable'
  second_payment_due_date date,
  payment_method text,                           -- 'bank_transfer' | 'corvuspay' | 'cash'
  corvuspay_order_id text,
  terms_accepted_at timestamptz,                 -- e-consent timestamp
  terms_accepted_ip text,
  terms_version text,
  status text default 'pending',                 -- 'pending' | 'confirmed' | 'cancelled' | 'completed'
  invoice_sent boolean default false,
  created_at timestamptz default now()
);

create table booking_extra_selections (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  extra_id uuid references booking_extras(id),
  qty integer default 1,
  unit_price numeric not null,
  total_price numeric not null
);

create table vehicle_blocked_dates (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id) on delete cascade,
  date_from date not null,
  date_to date not null,
  reason text
);

-- ---------------------------------------------------------------------------
-- SHOP
-- ---------------------------------------------------------------------------
create table product_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_hr text not null,
  name_en text,
  parent_id uuid references product_categories(id),
  sort_order integer default 0
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_hr text not null,
  name_en text,
  description_hr text,
  description_en text,
  price numeric not null,
  category_id uuid references product_categories(id),
  images text[],
  stock integer default 0,
  sku text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  confirmation_number text unique,
  user_id uuid references auth.users(id),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  shipping_address jsonb,
  billing_address jsonb,
  items jsonb not null,
  subtotal numeric not null,
  shipping_method text,
  shipping_cost numeric default 0,
  total numeric not null,
  payment_method text,
  payment_status text default 'unpaid',
  corvuspay_order_id text,
  status text default 'pending',
  invoice_sent boolean default false,
  notes text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- CONTENT
-- ---------------------------------------------------------------------------
create table posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_hr text not null,
  title_en text,
  content_hr text,
  content_en text,
  excerpt_hr text,
  cover_image text,
  is_published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now()
);

-- Rental terms (versioned, for e-consent audit trail)
create table rental_terms (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  content_hr text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Site settings (IBANs, thresholds, anything global)
create table settings (
  key text primary key,
  value jsonb
);

-- ---------------------------------------------------------------------------
-- INDEXES (query patterns already used by the app: availability + slug/lookup)
-- ---------------------------------------------------------------------------
create index idx_vehicles_type on vehicles (type);
create index idx_vehicles_slug on vehicles (slug);
create index idx_season_prices_vehicle on season_prices (vehicle_id);
create index idx_season_prices_season on season_prices (season_id);
create index idx_bookings_vehicle_dates on bookings (vehicle_id, pickup_date, dropoff_date);
create index idx_bookings_status on bookings (status);
create index idx_bookings_user on bookings (user_id);
create index idx_blocked_dates_vehicle on vehicle_blocked_dates (vehicle_id, date_from, date_to);
create index idx_booking_extra_selections_booking on booking_extra_selections (booking_id);
create index idx_products_category on products (category_id);
create index idx_products_active on products (is_active);
create index idx_orders_status on orders (status);
create index idx_orders_user on orders (user_id);
create index idx_posts_published on posts (is_published);
