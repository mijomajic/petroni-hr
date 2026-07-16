-- Atomic shop inventory reservations.
-- Physical product stock is reduced only when payment is recorded. Active
-- reservations are subtracted from public availability so concurrent orders
-- cannot reserve the same final units.

create table shop_stock_reservations (
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  status text not null default 'active' check (status in ('active', 'committed', 'released')),
  created_at timestamptz not null default now(),
  committed_at timestamptz,
  released_at timestamptz,
  primary key (order_id, product_id)
);

create index idx_shop_stock_reservations_product_status
  on shop_stock_reservations(product_id, status);

alter table shop_stock_reservations enable row level security;

create or replace view shop_products_available
with (security_invoker = true)
as
select
  p.*,
  greatest(p.stock - coalesce(r.reserved_quantity, 0), 0)::integer as available_stock
from products p
left join (
  select product_id, sum(quantity)::integer as reserved_quantity
  from shop_stock_reservations
  where status = 'active'
  group by product_id
) r on r.product_id = p.id;

revoke all on shop_products_available from anon, authenticated;
grant select on shop_products_available to service_role;

create or replace function reserve_shop_order_stock(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order orders%rowtype;
  v_item record;
  v_product products%rowtype;
  v_reserved integer;
  v_available integer;
  v_item_count integer := 0;
begin
  select * into v_order from orders where id = p_order_id for update;
  if not found then
    raise exception 'Narudžba nije pronađena.';
  end if;

  if exists (
    select 1 from shop_stock_reservations
    where order_id = p_order_id and status in ('active', 'committed')
  ) then
    return to_jsonb(v_order);
  end if;

  for v_item in
    select
      (entry->>'id')::uuid as product_id,
      sum(greatest(1, least(99, coalesce((entry->>'qty')::integer, 1))))::integer as quantity
    from jsonb_array_elements(v_order.items) entry
    group by (entry->>'id')::uuid
    order by (entry->>'id')::uuid
  loop
    v_item_count := v_item_count + 1;
    select * into v_product from products where id = v_item.product_id for update;
    if not found or not coalesce(v_product.is_active, false) then
      raise exception 'Jedan od proizvoda više nije dostupan.';
    end if;

    select coalesce(sum(quantity), 0)::integer into v_reserved
    from shop_stock_reservations
    where product_id = v_item.product_id and status = 'active';

    v_available := greatest(coalesce(v_product.stock, 0) - v_reserved, 0);
    if v_item.quantity > v_available then
      raise exception 'Proizvod “%” nema dovoljnu količinu. Dostupno: %.',
        v_product.name_hr, v_available;
    end if;

    insert into shop_stock_reservations(order_id, product_id, quantity)
    values (p_order_id, v_item.product_id, v_item.quantity);
  end loop;

  if v_item_count = 0 then
    raise exception 'Narudžba nema valjane proizvode.';
  end if;

  return to_jsonb(v_order);
end;
$$;

create or replace function commit_shop_order_stock(
  p_order_id uuid,
  p_order_status text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order orders%rowtype;
  v_reservation shop_stock_reservations%rowtype;
  v_stock integer;
begin
  select * into v_order from orders where id = p_order_id for update;
  if not found then
    raise exception 'Narudžba nije pronađena.';
  end if;
  if v_order.status = 'cancelled' then
    raise exception 'Otkazana narudžba ne može biti označena kao plaćena.';
  end if;

  for v_reservation in
    select * from shop_stock_reservations
    where order_id = p_order_id and status = 'active'
    order by product_id
    for update
  loop
    select stock into v_stock from products
    where id = v_reservation.product_id for update;
    if v_stock is null or v_stock < v_reservation.quantity then
      raise exception 'Rezerviranu zalihu nije moguće evidentirati.';
    end if;
    update products
    set stock = stock - v_reservation.quantity
    where id = v_reservation.product_id;
    update shop_stock_reservations
    set status = 'committed', committed_at = now()
    where order_id = p_order_id and product_id = v_reservation.product_id;
  end loop;

  update orders
  set payment_status = 'paid',
      status = coalesce(nullif(p_order_status, ''), status)
  where id = p_order_id
  returning * into v_order;

  return to_jsonb(v_order);
end;
$$;

create or replace function cancel_shop_order_and_release_stock(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order orders%rowtype;
  v_reservation shop_stock_reservations%rowtype;
begin
  select * into v_order from orders where id = p_order_id for update;
  if not found then
    raise exception 'Narudžba nije pronađena.';
  end if;

  for v_reservation in
    select * from shop_stock_reservations
    where order_id = p_order_id and status in ('active', 'committed')
    order by product_id
    for update
  loop
    perform 1 from products where id = v_reservation.product_id for update;
    if v_reservation.status = 'committed' then
      update products
      set stock = stock + v_reservation.quantity
      where id = v_reservation.product_id;
    end if;
    update shop_stock_reservations
    set status = 'released', released_at = now()
    where order_id = p_order_id and product_id = v_reservation.product_id;
  end loop;

  update orders set status = 'cancelled'
  where id = p_order_id
  returning * into v_order;

  return to_jsonb(v_order);
end;
$$;

revoke all on function reserve_shop_order_stock(uuid) from public, anon, authenticated;
revoke all on function commit_shop_order_stock(uuid, text) from public, anon, authenticated;
revoke all on function cancel_shop_order_and_release_stock(uuid) from public, anon, authenticated;
grant execute on function reserve_shop_order_stock(uuid) to service_role;
grant execute on function commit_shop_order_stock(uuid, text) to service_role;
grant execute on function cancel_shop_order_and_release_stock(uuid) to service_role;
