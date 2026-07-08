-- Align rental vehicle customer-facing names/categories with the current
-- Petroni website taxonomy. The 2026 price-sheet labels remain useful for
-- internal pricing, but should not appear on the public site.

begin;

update vehicles
set
  slug = 'roller-team-kronos-277m',
  name = 'ROLLER TEAM Kronos 277M',
  category = 'ELITE',
  sort_order = 1,
  description_hr = 'Elite kamper za obitelji i veća društva, s prostranim rasporedom, modernim interijerom i dodatnom razinom udobnosti. Cijena ovisi o terminu najma; polog iznosi 3500 EUR.',
  description_en = 'Elite camper for families and larger groups, with a spacious layout, modern interior and extra comfort. The price depends on the rental period; the deposit is EUR 3500.'
where slug = 'family-air-plus-roller-team-kronos-277m';

update vehicles
set
  slug = 'ci-horon-79m',
  name = 'CARAVANS INTERNATIONAL Horon 79M',
  category = 'ELITE',
  sort_order = 2,
  description_hr = 'Elite kamper za putnike koji žele višu razinu udobnosti, kvalitetan interijer i poseban doživljaj putovanja. Cijena ovisi o terminu najma; polog iznosi 3500 EUR.',
  description_en = 'Elite camper for travellers who want a higher level of comfort, quality interior and a special travel experience. The price depends on the rental period; the deposit is EUR 3500.'
where slug in ('family-air-plus-ci-horon-79m', 'ci-horon-79m');

update vehicles
set
  name = 'McLouis MC4 873',
  category = 'ELITE',
  sort_order = 3,
  description_hr = 'Elite kamper s modernim rasporedom i dodatnim komforom, prikladan za udobna obiteljska i grupna putovanja. Cijena ovisi o terminu najma; polog iznosi 3500 EUR.',
  description_en = 'Elite camper with a modern layout and extra comfort, suitable for comfortable family and group travel. The price depends on the rental period; the deposit is EUR 3500.'
where slug = 'mclouis-mc4-873';

update vehicles
set
  slug = 'rimor-kilig-50',
  name = 'RIMOR Kilig 50',
  category = 'COMFORT',
  sort_order = 4,
  description_hr = 'Comfort kamper s odličnim omjerom udobnosti, praktičnosti i cijene najma. Cijena ovisi o terminu najma; polog iznosi 3000 EUR.',
  description_en = 'Comfort camper with a strong balance of comfort, practicality and rental price. The price depends on the rental period; the deposit is EUR 3000.'
where slug = 'family-air-rimor-kilig-50';

update vehicles
set
  slug = 'rimor-evo-sound',
  name = 'Rimor EVO Sound',
  category = 'COMFORT',
  sort_order = 5,
  description_hr = 'Comfort kamper za obitelji i grupe koje traže praktičan raspored i ugodno putovanje. Cijena ovisi o terminu najma; polog iznosi 3000 EUR.',
  description_en = 'Comfort camper for families and groups looking for a practical layout and comfortable travel. The price depends on the rental period; the deposit is EUR 3000.'
where slug = 'family-air-rimor-evo-sound';

update vehicles
set
  name = 'CaraTour Ford 600MQ',
  category = 'COMFORT',
  sort_order = 6,
  description_hr = 'Comfort camper van za fleksibilna putovanja, kraće odmore i parove koji žele kompaktno, ali udobno vozilo. Cijena ovisi o terminu najma; polog iznosi 3000 EUR.',
  description_en = 'Comfort camper van for flexible trips, shorter holidays and couples who want a compact but comfortable vehicle. The price depends on the rental period; the deposit is EUR 3000.'
where slug = 'caratour-ford-600mq';

update vehicles
set
  slug = 'knaus-boxdrive-680me',
  name = 'Knaus Boxdrive 680ME',
  category = 'COMFORT',
  sort_order = 7,
  description_hr = 'Comfort camper van poznatog proizvođača, namijenjen putnicima koji žele praktičnost i udobnost na dužim rutama. Cijena ovisi o terminu najma; polog iznosi 3000 EUR.',
  description_en = 'Comfort camper van from a well-known manufacturer, intended for travellers who want practicality and comfort on longer routes. The price depends on the rental period; the deposit is EUR 3000.'
where slug = 'fun-cxl-air-knaus-boxdrive-680me';

update vehicles
set
  slug = 'petrovan-53-4x4',
  name = 'PETROVAN 53 4x4',
  category = 'DUO 4x4',
  sort_order = 8,
  description_hr = 'Duo 4x4 kamper za dvije osobe i putnike koji žele jednostavno, fleksibilno i avanturističko iskustvo. Cijena ovisi o terminu najma; polog iznosi 2500 EUR.',
  description_en = 'Duo 4x4 camper for two people and travellers who want a simple, flexible and adventurous experience. The price depends on the rental period; the deposit is EUR 2500.'
where slug = 'v4wd-petrovan-53-4motion';

update vehicles
set
  slug = 'budget-van-55',
  name = 'Budget Van 55',
  category = 'ECO',
  sort_order = 9,
  description_hr = 'Eco kamper za putnike koji traže jednostavno, praktično i najpovoljnije putovanje. Cijena ovisi o terminu najma; polog iznosi 2000 EUR.',
  description_en = 'Eco camper for travellers looking for a simple, practical and most affordable trip. The price depends on the rental period; the deposit is EUR 2000.'
where slug = 'budgetvan-55';

update vehicles
set
  category = 'KAMP PRIKOLICE',
  sort_order = case
    when slug = 'weinsberg-caraone-550uk' then 10
    when slug = 'weinsberg-caraone-550qdk' then 11
    else sort_order
  end,
  description_hr = 'Kamp prikolica za najam. Za dodatne informacije o modelu, opremi i dostupnosti pošaljite upit.',
  description_en = 'Caravan for rent. For additional information about the model, equipment and availability, please send an inquiry.'
where slug in ('weinsberg-caraone-550uk', 'weinsberg-caraone-550qdk')
  and type = 'rental';

commit;
