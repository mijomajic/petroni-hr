-- Phase 6B: product brand assignment and filtering.
--
-- The WooCommerce export includes a "Robne marke" column, but all 2,178
-- imported rows have that field empty. Keep brand as editable catalogue data
-- instead of guessing it from product names.

begin;

alter table products
  add column if not exists brand text;

create index if not exists idx_products_active_brand
  on products (is_active, brand)
  where brand is not null;

comment on column products.brand is
  'Manufacturer/brand shown in shop filters; maintained through product admin.';

-- Migration 0004 seeded six broad categories whose later WooCommerce import
-- created equivalent canonical roots. Move any legacy assignments/children to
-- the imported roots, then remove the empty duplicates from admin/storefront.
with category_map(legacy_slug, canonical_slug) as (
  values
    ('gume-i-oprema', 'gume-oprema'),
    ('kamping-namjestaj', 'kamping-namjestaj-dijelovi'),
    ('karavan-tehnologija', 'karavan-tehnologija-oprema'),
    ('kemikalije', 'kemikalije-sredstva'),
    ('motorhome-tehnologija', 'motorhome-tehnologija-oprema'),
    ('plinska-tehnologija', 'plinska-tehnologija-oprema')
)
update products product
set category_id = canonical.id
from category_map mapping
join product_categories legacy on legacy.slug = mapping.legacy_slug
join product_categories canonical on canonical.slug = mapping.canonical_slug
where product.category_id = legacy.id;

with category_map(legacy_slug, canonical_slug) as (
  values
    ('gume-i-oprema', 'gume-oprema'),
    ('kamping-namjestaj', 'kamping-namjestaj-dijelovi'),
    ('karavan-tehnologija', 'karavan-tehnologija-oprema'),
    ('kemikalije', 'kemikalije-sredstva'),
    ('motorhome-tehnologija', 'motorhome-tehnologija-oprema'),
    ('plinska-tehnologija', 'plinska-tehnologija-oprema')
)
update product_categories child
set parent_id = canonical.id
from category_map mapping
join product_categories legacy on legacy.slug = mapping.legacy_slug
join product_categories canonical on canonical.slug = mapping.canonical_slug
where child.parent_id = legacy.id;

delete from product_categories
where slug in (
  'gume-i-oprema',
  'kamping-namjestaj',
  'karavan-tehnologija',
  'kemikalije',
  'motorhome-tehnologija',
  'plinska-tehnologija'
);

-- PostgreSQL expands p.* when a view is created, so recreate the stock view
-- explicitly to expose the new field while preserving existing column order.
create or replace view shop_products_available
with (security_invoker = true)
as
select
  p.id,
  p.slug,
  p.name_hr,
  p.name_en,
  p.description_hr,
  p.description_en,
  p.price,
  p.category_id,
  p.images,
  p.stock,
  p.sku,
  p.is_active,
  p.created_at,
  greatest(p.stock - coalesce(r.reserved_quantity, 0), 0)::integer as available_stock,
  p.brand
from products p
left join (
  select product_id, sum(quantity)::integer as reserved_quantity
  from shop_stock_reservations
  where status = 'active'
  group by product_id
) r on r.product_id = p.id;

revoke all on shop_products_available from anon, authenticated;
grant select on shop_products_available to service_role;

commit;
