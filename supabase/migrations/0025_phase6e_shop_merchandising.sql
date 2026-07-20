-- Phase 6E: featured shop brands and back-in-stock notifications.

create table if not exists product_stock_notifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  email text not null,
  locale text not null default 'hr' check (locale in ('hr', 'en')),
  status text not null default 'pending' check (status in ('pending', 'sent', 'cancelled')),
  requested_at timestamptz not null default now(),
  notified_at timestamptz,
  last_attempt_at timestamptz,
  attempt_count integer not null default 0,
  last_error text,
  unique (product_id, email)
);

create index if not exists idx_product_stock_notifications_pending
  on product_stock_notifications (product_id, requested_at)
  where status = 'pending';

alter table product_stock_notifications enable row level security;

-- No browser policy: public subscriptions and admin reads go through validated
-- server endpoints using the service-role client.

alter table email_attempts
  add column if not exists product_stock_notification_id uuid
    references product_stock_notifications(id) on delete set null;

alter table email_attempts
  drop constraint if exists email_attempts_check;

alter table email_attempts
  drop constraint if exists email_attempts_context_check;

alter table email_attempts
  add constraint email_attempts_context_check
  check (
    booking_id is not null
    or order_id is not null
    or product_stock_notification_id is not null
  );

create index if not exists idx_email_attempts_stock_notification
  on email_attempts (product_stock_notification_id, created_at desc);

insert into settings (key, value) values
  ('shop_featured_brands', '["Truma","Thule","Dometic","Thetford","Fiamma","Reich","Renogy","Teleco","SRM","Carbest"]')
on conflict (key) do update set value = excluded.value;

-- The source export has no brand column values. Assign a brand only when the
-- exact brand token is already present in the imported HR or EN product title.
update products
set brand = 'Truma'
where (brand is null or btrim(brand) = '')
  and (name_hr ~* '(^|[^[:alnum:]])Truma([^[:alnum:]]|$)'
    or coalesce(name_en, '') ~* '(^|[^[:alnum:]])Truma([^[:alnum:]]|$)');

update products
set brand = 'Thule'
where (brand is null or btrim(brand) = '')
  and (name_hr ~* '(^|[^[:alnum:]])Thule([^[:alnum:]]|$)'
    or coalesce(name_en, '') ~* '(^|[^[:alnum:]])Thule([^[:alnum:]]|$)');

update products
set brand = 'Dometic'
where (brand is null or btrim(brand) = '')
  and (name_hr ~* '(^|[^[:alnum:]])Dometic([^[:alnum:]]|$)'
    or coalesce(name_en, '') ~* '(^|[^[:alnum:]])Dometic([^[:alnum:]]|$)');

update products
set brand = 'Thetford'
where (brand is null or btrim(brand) = '')
  and (name_hr ~* '(^|[^[:alnum:]])Thetford([^[:alnum:]]|$)'
    or coalesce(name_en, '') ~* '(^|[^[:alnum:]])Thetford([^[:alnum:]]|$)');

update products
set brand = 'Fiamma'
where (brand is null or btrim(brand) = '')
  and (name_hr ~* '(^|[^[:alnum:]])Fiamma([^[:alnum:]]|$)'
    or coalesce(name_en, '') ~* '(^|[^[:alnum:]])Fiamma([^[:alnum:]]|$)');

update products
set brand = 'Reich'
where (brand is null or btrim(brand) = '')
  and (name_hr ~* '(^|[^[:alnum:]])Reich([^[:alnum:]]|$)'
    or coalesce(name_en, '') ~* '(^|[^[:alnum:]])Reich([^[:alnum:]]|$)');

update products
set brand = 'Renogy'
where (brand is null or btrim(brand) = '')
  and (name_hr ~* '(^|[^[:alnum:]])Renogy([^[:alnum:]]|$)'
    or coalesce(name_en, '') ~* '(^|[^[:alnum:]])Renogy([^[:alnum:]]|$)');

update products
set brand = 'Teleco'
where (brand is null or btrim(brand) = '')
  and (name_hr ~* '(^|[^[:alnum:]])Teleco([^[:alnum:]]|$)'
    or coalesce(name_en, '') ~* '(^|[^[:alnum:]])Teleco([^[:alnum:]]|$)');

update products
set brand = 'SRM'
where (brand is null or btrim(brand) = '')
  and (name_hr ~* '(^|[^[:alnum:]])SRM([^[:alnum:]]|$)'
    or coalesce(name_en, '') ~* '(^|[^[:alnum:]])SRM([^[:alnum:]]|$)');

update products
set brand = 'Carbest'
where (brand is null or btrim(brand) = '')
  and (name_hr ~* '(^|[^[:alnum:]])Carbest([^[:alnum:]]|$)'
    or coalesce(name_en, '') ~* '(^|[^[:alnum:]])Carbest([^[:alnum:]]|$)');

-- The WooCommerce export omitted English category labels. This finite mapping
-- covers every imported public category without changing slugs or hierarchy.
update product_categories
set name_en = case slug
  when 'karavan-tehnologija-oprema' then 'CARAVAN TECHNOLOGY & EQUIPMENT'
  when 'hladenje-grijanje' then 'COOLING & HEATING'
  when 'plinska-tehnologija-oprema' then 'GAS TECHNOLOGY & EQUIPMENT'
  when 'motorhome-tehnologija-oprema' then 'MOTORHOME TECHNOLOGY & EQUIPMENT'
  when 'voda-sanitarije' then 'WATER & SANITATION'
  when 'elektrika' then 'ELECTRICAL'
  when 'gume-oprema' then 'TYRES & EQUIPMENT'
  when 'prozori' then 'WINDOWS'
  when 'kemikalije-sredstva' then 'CHEMICALS & CLEANING PRODUCTS'
  when 'kucanstvo-kuhinja' then 'HOUSEHOLD & KITCHEN'
  when 'oprema-za-van' then 'OUTDOOR EQUIPMENT'
  when 'kamping-namjestaj-dijelovi' then 'CAMPING FURNITURE & PARTS'
  when 'akcija' then 'SALE'
  when 'tende-i-dodaci' then 'AWNINGS & ACCESSORIES'
  when 'sigurnost' then 'SECURITY'
  when 'multimedija' then 'MULTIMEDIA'
  when 'karavan-tehnologija-oprema-dodatni-retrovizori' then 'TOWING MIRRORS'
  when 'karavan-tehnologija-oprema-prekrivke-zastitne' then 'PROTECTIVE COVERS'
  when 'karavan-tehnologija-oprema-smart-mover' then 'CARAVAN MOVERS'
  when 'hladenje-grijanje-grijanje' then 'HEATING'
  when 'hladenje-grijanje-hladnjaci' then 'REFRIGERATORS'
  when 'hladenje-grijanje-klima-uredaji' then 'AIR CONDITIONERS'
  when 'hladenje-grijanje-truma' then 'TRUMA'
  when 'hladenje-grijanje-ventilacija' then 'VENTILATION'
  when 'plinska-tehnologija-oprema-boce-za-plin' then 'GAS CYLINDERS'
  when 'plinska-tehnologija-oprema-regulatori-za-plin' then 'GAS REGULATORS'
  when 'motorhome-tehnologija-oprema-nosaci-za-bicikle' then 'BICYCLE RACKS'
  when 'motorhome-tehnologija-oprema-okretne-konzole' then 'SWIVEL SEAT BASES'
  when 'motorhome-tehnologija-oprema-retrovizori' then 'MIRRORS'
  when 'motorhome-tehnologija-oprema-termozastite' then 'THERMAL COVERS'
  when 'voda-sanitarije-grijaci-vode' then 'WATER HEATERS'
  when 'voda-sanitarije-kemijski-wc-i-dodaci' then 'CHEMICAL TOILETS & ACCESSORIES'
  when 'voda-sanitarije-pipe-mjesalice' then 'TAPS & MIXERS'
  when 'voda-sanitarije-pumpe-za-vodu' then 'WATER PUMPS'
  when 'voda-sanitarije-spremnici-za-vodu' then 'WATER TANKS'
  when 'voda-sanitarije-umivaonik-sudoper-kada' then 'WASHBASINS, SINKS & SHOWER TRAYS'
  when 'elektrika-baterije-akumulatori' then 'BATTERIES & LEISURE BATTERIES'
  when 'elektrika-inverteri' then 'INVERTERS'
  when 'elektrika-kablovi' then 'CABLES'
  when 'elektrika-kupaona-kuhinja' then 'BATHROOM & KITCHEN'
  when 'elektrika-osiguraci' then 'FUSES'
  when 'elektrika-punjaci-baterija' then 'BATTERY CHARGERS'
  when 'elektrika-rasvjeta' then 'LIGHTING'
  when 'elektrika-solarni-sustavi' then 'SOLAR SYSTEMS'
  when 'elektrika-svjetlosna-signalizacija' then 'VEHICLE LIGHTS & SIGNALLING'
  when 'elektrika-uticnice-prekidaci' then 'SOCKETS & SWITCHES'
  when 'prozori-bocni-prozori' then 'SIDE WINDOWS'
  when 'prozori-krovni-prozori' then 'ROOFLIGHTS'
  when 'prozori-podizaci-drzaci' then 'WINDOW STAYS & HOLDERS'
  when 'prozori-rolo-zavjese-okviri' then 'BLINDS & FRAMES'
  when 'prozori-staklo-prozora' then 'WINDOW GLASS'
  when 'kucanstvo-kuhinja-posude' then 'COOKWARE'
  when 'kucanstvo-kuhinja-stednjaci' then 'COOKERS'
  when 'kamping-namjestaj-dijelovi-brave-rucke' then 'LOCKS & HANDLES'
  when 'kamping-namjestaj-dijelovi-brtvila-profili' then 'SEALS & PROFILES'
  when 'kamping-namjestaj-dijelovi-madraci-kreveti' then 'MATTRESSES & BEDS'
  when 'kamping-namjestaj-dijelovi-obloge-izolacije' then 'LININGS & INSULATION'
  when 'kamping-namjestaj-dijelovi-panti' then 'HINGES'
  when 'kamping-namjestaj-dijelovi-stepenice-ulazne' then 'ENTRY STEPS'
  when 'kamping-namjestaj-dijelovi-vrata' then 'DOORS'
  when 'kamping-namjestaj-dijelovi-sperploce-paneli' then 'PLYWOOD & PANELS'
  when 'tende-i-dodaci-dodaci' then 'ACCESSORIES'
  when 'tende-i-dodaci-predsator' then 'AWNING TENTS'
  when 'tende-i-dodaci-tende' then 'AWNINGS'
  when 'multimedija-kamere-za-voznju-unatrag' then 'REVERSING CAMERAS'
  when 'multimedija-televizori-i-oprema' then 'TELEVISIONS & EQUIPMENT'
  else name_en
end
where (name_en is null or btrim(name_en) = '')
  and slug in (
    'karavan-tehnologija-oprema','hladenje-grijanje','plinska-tehnologija-oprema','motorhome-tehnologija-oprema','voda-sanitarije','elektrika','gume-oprema','prozori','kemikalije-sredstva','kucanstvo-kuhinja','oprema-za-van','kamping-namjestaj-dijelovi','akcija','tende-i-dodaci','sigurnost','multimedija','karavan-tehnologija-oprema-dodatni-retrovizori','karavan-tehnologija-oprema-prekrivke-zastitne','karavan-tehnologija-oprema-smart-mover','hladenje-grijanje-grijanje','hladenje-grijanje-hladnjaci','hladenje-grijanje-klima-uredaji','hladenje-grijanje-truma','hladenje-grijanje-ventilacija','plinska-tehnologija-oprema-boce-za-plin','plinska-tehnologija-oprema-regulatori-za-plin','motorhome-tehnologija-oprema-nosaci-za-bicikle','motorhome-tehnologija-oprema-okretne-konzole','motorhome-tehnologija-oprema-retrovizori','motorhome-tehnologija-oprema-termozastite','voda-sanitarije-grijaci-vode','voda-sanitarije-kemijski-wc-i-dodaci','voda-sanitarije-pipe-mjesalice','voda-sanitarije-pumpe-za-vodu','voda-sanitarije-spremnici-za-vodu','voda-sanitarije-umivaonik-sudoper-kada','elektrika-baterije-akumulatori','elektrika-inverteri','elektrika-kablovi','elektrika-kupaona-kuhinja','elektrika-osiguraci','elektrika-punjaci-baterija','elektrika-rasvjeta','elektrika-solarni-sustavi','elektrika-svjetlosna-signalizacija','elektrika-uticnice-prekidaci','prozori-bocni-prozori','prozori-krovni-prozori','prozori-podizaci-drzaci','prozori-rolo-zavjese-okviri','prozori-staklo-prozora','kucanstvo-kuhinja-posude','kucanstvo-kuhinja-stednjaci','kamping-namjestaj-dijelovi-brave-rucke','kamping-namjestaj-dijelovi-brtvila-profili','kamping-namjestaj-dijelovi-madraci-kreveti','kamping-namjestaj-dijelovi-obloge-izolacije','kamping-namjestaj-dijelovi-panti','kamping-namjestaj-dijelovi-stepenice-ulazne','kamping-namjestaj-dijelovi-vrata','kamping-namjestaj-dijelovi-sperploce-paneli','tende-i-dodaci-dodaci','tende-i-dodaci-predsator','tende-i-dodaci-tende','multimedija-kamere-za-voznju-unatrag','multimedija-televizori-i-oprema'
  );
