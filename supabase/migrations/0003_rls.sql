-- Petroni backend — Phase 1: Row Level Security
--
-- Access model:
--   * Public catalog/config tables  -> readable by anyone (anon + authenticated).
--   * bookings / orders             -> a logged-in user can read & insert ONLY
--                                      their own rows. Guest checkout and all
--                                      admin actions go through server routes
--                                      using the SERVICE-ROLE key, which bypasses
--                                      RLS entirely (so guests can still book and
--                                      admin can manage everything).
--   * Admin-only / sensitive tables -> no anon or authenticated policy at all, so
--                                      only the service-role (server admin client)
--                                      can touch them. JWT-claim-based admin roles
--                                      are layered on in Phase 5.
--
-- Enable RLS on every table first. With RLS on and no matching policy, a table is
-- deny-by-default for anon/authenticated — exactly what we want for admin tables.

alter table vehicles                  enable row level security;
alter table seasons                   enable row level security;
alter table season_prices             enable row level security;
alter table fees                      enable row level security;
alter table rental_locations          enable row level security;
alter table booking_extras            enable row level security;
alter table bookings                  enable row level security;
alter table booking_extra_selections  enable row level security;
alter table vehicle_blocked_dates     enable row level security;
alter table product_categories        enable row level security;
alter table products                  enable row level security;
alter table orders                    enable row level security;
alter table posts                     enable row level security;
alter table rental_terms              enable row level security;
alter table settings                  enable row level security;

-- ---------------------------------------------------------------------------
-- PUBLIC READ (catalog + pricing config shown to customers)
-- ---------------------------------------------------------------------------
create policy "Public read vehicles"          on vehicles          for select using (true);
create policy "Public read seasons"           on seasons           for select using (true);
create policy "Public read season_prices"     on season_prices     for select using (true);
create policy "Public read fees"              on fees              for select using (true);
create policy "Public read rental_locations"  on rental_locations  for select using (true);
create policy "Public read booking_extras"    on booking_extras    for select using (true);
create policy "Public read product_categories" on product_categories for select using (true);
create policy "Public read products"          on products          for select using (true);

-- Only published posts are public; drafts stay server/admin-only.
create policy "Public read published posts"   on posts             for select using (is_published = true);

-- ---------------------------------------------------------------------------
-- BOOKINGS — logged-in users manage their own; guests go through service key
-- ---------------------------------------------------------------------------
create policy "Users read own bookings"   on bookings for select
  to authenticated using (user_id = auth.uid());

create policy "Users insert own bookings" on bookings for insert
  to authenticated with check (user_id = auth.uid());

create policy "Users read own booking extras" on booking_extra_selections for select
  to authenticated using (
    exists (
      select 1 from bookings b
      where b.id = booking_extra_selections.booking_id
        and b.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- ORDERS — logged-in users manage their own; guests go through service key
-- ---------------------------------------------------------------------------
create policy "Users read own orders"   on orders for select
  to authenticated using (user_id = auth.uid());

create policy "Users insert own orders" on orders for insert
  to authenticated with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- ADMIN-ONLY / SENSITIVE (no anon/authenticated policy => service-role only):
--   vehicle_blocked_dates, rental_terms, settings.
-- These are read/written exclusively through the server admin client. Customer-
-- facing reads that need them (IBANs at checkout, terms modal) are done in
-- server load functions with the service-role key.
-- ---------------------------------------------------------------------------
