-- Phase 6B: configurable shop delivery, pickup-only products and COD.
-- Carrier defaults mirror the currently published /placanje-dostava page:
-- Overseas 11 EUR, BoxNow 9 EUR and personal pickup 0 EUR.

begin;

alter table products
  add column if not exists pickup_only boolean not null default false;

alter table orders
  add column if not exists payment_surcharge numeric(10,2) not null default 0;

-- Views retain their original column list after ALTER TABLE. Recreate this one
-- so both the Phase 6B brand field and pickup_only are exposed to shop reads.
drop view if exists shop_products_available;
create view shop_products_available
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
  p.brand,
  p.pickup_only
from products p
left join (
  select product_id, sum(quantity)::integer as reserved_quantity
  from shop_stock_reservations
  where status = 'active'
  group by product_id
) r on r.product_id = p.id;

revoke all on shop_products_available from anon, authenticated;
grant select on shop_products_available to service_role;

comment on column products.pickup_only is
  'When true, checkout only accepts personal_pickup for an order containing this product.';

-- WooCommerce export 2026-07-07: 121 rows whose shipping class is exactly
-- "Potrebno osobno preuzimanje u trgovini.". SKU is the stable import key.
update products
set pickup_only = true
where sku = any (array[
  '90000AK100SG','90000AK80','90000AK95AGM','90000AKM115','90000AKM85',
  '91RBT12100LFPMG1DE','92B168487','92T3371420','96PL7206801','97C15935283',
  '97C15942711','97C15943048','97C702616','97EA0020085','97EA0020090',
  '97FP12AMBER223','97FP12GRANO223','97FP14AMBER223','97FP14GRANO223','97GCDZ727',
  '97GPNL111KB','97GPNL130X','97GPNL131KB','97GPNL150X','97GPNL200N',
  '97GPRF2002','97M120006039','97M120006044','97M120009064','97S22093',
  '97S6002920','97S90230FS','97VP31247PV31','97VP32351PV31','97VP4422670',
  '97VP4430070','9900303','9900304','9906910','9944237','9980073','9980074',
  '9981212','9981452','99921121','9992115001','999315002','999315006','99931590',
  '99931591','99931592','99931593','999316011','999316027','99931618','99931619',
  '999316190','99931620','999316200','99931625','99931626','99931627','99931628',
  '99931710','99931711','99931725','99931730','99931886','99931926','99942605',
  '99942606','99942628','99942653','999426700','999428305','999444232','99944739',
  '999495054','99950000','99950001','99950018','99950094','9995040426','99951044',
  '99951045','99951100','99951101','99952000','99952019','99952048','99952091',
  '99952092','99958820','99959101','99961054','99961058','99961075','999712008',
  '999713502','999713507','999713513','99971371','999753805','999814560','99981457',
  '999829992','99984034','999840341','999850530','999850531','999851063','999851106',
  '999901963','999912147','999912225','999912230','999920208','99F071071','99X223030T',
  '99X223033X','99X224982L'
]::text[]);

insert into settings (key, value) values
  ('shop_shipping_methods', '{
    "overseas":{"enabled":true,"price":11,"allows_cod":true,"label_hr":"Overseas dostava","label_en":"Overseas delivery"},
    "boxnow":{"enabled":true,"price":9,"allows_cod":false,"label_hr":"BoxNow paketomat","label_en":"BoxNow locker"},
    "personal_pickup":{"enabled":true,"price":0,"allows_cod":false,"label_hr":"Osobno preuzimanje","label_en":"Personal pickup"}
  }'::jsonb),
  ('cash_on_delivery_enabled', 'true'::jsonb),
  ('cash_on_delivery_surcharge', '1'::jsonb)
on conflict (key) do nothing;

commit;
