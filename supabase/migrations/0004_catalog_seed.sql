-- Petroni backend — Phase 2: move the catalog previously embedded in Svelte
-- components into Supabase. Prices remain placeholders editable in admin.

insert into product_categories (slug, name_hr, name_en, sort_order) values
  ('elektrika', 'Elektrika', 'Electrical', 1),
  ('gume-i-oprema', 'Gume i oprema', 'Tires & Equipment', 2),
  ('hladenje-grijanje', 'Hlađenje / Grijanje', 'Cooling / Heating', 3),
  ('kamping-namjestaj', 'Kamping namještaj', 'Camping Furniture', 4),
  ('karavan-tehnologija', 'Karavan tehnologija', 'Caravan Tech', 5),
  ('kemikalije', 'Kemikalije i sredstva', 'Chemicals', 6),
  ('kucanstvo-kuhinja', 'Kućanstvo / kuhinja', 'Household / Kitchen', 7),
  ('motorhome-tehnologija', 'Motorhome tehnologija', 'Motorhome Tech', 8),
  ('multimedija', 'Multimedija', 'Multimedia', 9),
  ('oprema-za-van', 'Oprema za van', 'Outdoor Equipment', 10),
  ('plinska-tehnologija', 'Plinska tehnologija', 'Gas Technology', 11),
  ('prozori', 'Prozori', 'Windows', 12),
  ('sigurnost', 'Sigurnost', 'Security', 13),
  ('tende-i-dodaci', 'Tende i dodaci', 'Awnings', 14),
  ('voda-sanitarije', 'Voda / Sanitarije', 'Water / Sanitary', 15)
on conflict (slug) do update set
  name_hr = excluded.name_hr,
  name_en = excluded.name_en,
  sort_order = excluded.sort_order;

insert into vehicles (
  slug, name, type, category, seats, beds, bags, max_adults, max_children,
  base_price_per_day, sale_price, description_hr, description_en, images,
  specs, is_available, sort_order
) values
  (
    'weinsberg-caraone-550qdk', 'Weinsberg CaraOne 550QDK', 'rental', 'COMFORT',
    4, 4, 4, 4, 2, 120, null,
    'Udoban obiteljski karavan s prostranim rasporedom i potpunom opremom za ljetna putovanja.',
    'Comfortable family caravan with a spacious layout.',
    array['https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg'],
    '{"Godina":"2024","Vozilo":"Ford","Model":"Transit","Broj ležajeva":"4","Broj sjedala":"4","Tenda":"✓"}',
    true, 1
  ),
  (
    'weinsberg-caraone-550uk', 'Weinsberg CaraOne 550UK', 'rental', 'ECO',
    4, 2, 3, 2, 2, 95, null,
    'Kompaktan i ekonomičan karavan za par ili manju obitelj. Idealan za brze vikend izlete i dulja putovanja.',
    'Compact and economical caravan.',
    array['https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg'],
    '{"Godina":"2023","Vozilo":"Caravan","Model":"CaraOne","Broj ležajeva":"2-4","Broj sjedala":"4"}',
    true, 2
  ),
  (
    'caratour-ford-600mq', 'CaraTour Ford 600MQ', 'rental', 'ELITE',
    6, 6, 5, 4, 2, 180, null,
    'Vaš san o istraživanju svijeta sada postaje stvarnost. Dizajniran za avanturu bez odricanja od udobnosti.',
    'Your dream of exploring the world becomes reality.',
    array['https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp'],
    '{"Godina":"2024","Vozilo":"Ford","Model":"Transit","Motor":"2.0tdci 155ks","Broj ležajeva":"6","Broj sjedala":"6","Tenda":"✓","Tempomat":"✓","Klima kabina":"✓"}',
    true, 3
  ),
  (
    'caratour-ford-600mq-prodaja', 'CaraTour Ford 600MQ', 'sale', null,
    6, 6, 5, null, null, null, 61625,
    'Weinsberg CaraTour Ford 600 MQ – kompaktan kamper za udobna putovanja.',
    'Compact motorhome for comfortable travel.',
    array['https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp'],
    '{}', true, 10
  ),
  (
    'budgetvan-55', 'BudgetVan 55', 'sale', null, 4, 4, 3, null, null, null, null,
    'BudgetVan 55. Pristupačan kamper za sve.',
    'An affordable camper for everyone.',
    array['https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg'],
    '{}', true, 11
  ),
  (
    'mclouis-mc4-873', 'McLouis MC4 873', 'sale', null, 6, 6, 4, null, null, null, null,
    'McLouis MC4 873 – luksuz na četiri kotača.',
    'Luxury on four wheels.',
    array['https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg'],
    '{}', true, 12
  ),
  (
    'caravans-international-horon-79m', 'CARAVANS INTERNATIONAL Horon 79M', 'sale', null,
    6, 6, 4, null, null, null, 81625,
    'Caravans International Horon 79M pretvara san o putovanju u stvarnost.',
    'CI International HORON 79M.',
    array['https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp'],
    '{}', true, 13
  ),
  (
    'tegljac-lamboo-iveco-daily', 'Tegljač Lamboo Iveco Daily 35C18 8+E kat', 'sale', null,
    3, null, 2, null, null, null, null,
    '150 000 km, u dobrom stanju. Služio kao pokretna ordinacija.',
    'In good condition.',
    array['https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg'],
    '{}', true, 14
  ),
  (
    'weinsberg-caracompact-suite-640meq', 'WEINSBERG CaraCompact Suite 640MEQ EDITION (PEPPER)', 'sale', null,
    4, 4, 4, null, null, null, null,
    'Iznimno bogato opremljen kamper na bazi Mercedes Sprinter 315.',
    'Richly equipped camper on a Mercedes Sprinter 315.',
    array['https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg'],
    '{}', true, 15
  ),
  (
    'citroen-unitvan', 'Citroën UnitVan', 'film', null, 3, null, 2, null, null, null, null,
    'Specijalizirano vozilo za filmske i televizijske produkcije.',
    'Specialised vehicle for film and television productions.',
    array['https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg'],
    '{}', true, 20
  ),
  (
    'honeywagon-vacum-jet-1', 'Honeywagon – prikolica WC Vacum-Jet 1+1', 'film', null,
    0, null, 0, null, null, null, null,
    'Minimalna potrošnja vode i energije. Solarni paneli i baterije 12 V osiguravaju autonomiju.',
    'Minimal water and energy consumption. Solar panels and 12 V batteries.',
    array['https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg'],
    '{}', true, 21
  ),
  (
    'honeywagon-vacum-jet-2', 'Honeywagon – WC prikolica Vacum Jet 2+1+1', 'film', null,
    0, null, 0, null, null, null, null,
    'Dimenzije prikolice: 5,2 m × 2,5 m, odnosno s ručnim rudom 6,8 m × 2,5 m.',
    'Trailer dimensions 5.2 m × 2.5 m.',
    array['https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp'],
    '{}', true, 22
  ),
  (
    'kamion-eurocargo-75e15', 'Kamion EuroCargo 75E15 – taillift/grip/electric', 'film', null,
    3, null, 0, null, null, null, null,
    'Dimenzije sanduka 7,10 m D × 2,4 m Š × 2,8 m V.',
    'Box dimensions 7.10 m × 2.4 m × 2.8 m.',
    array['https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg'],
    '{}', true, 23
  ),
  (
    'make-up-truck-peugeot-boxer', 'Make up truck – 2+1 radna mjesta – Peugeot Boxer', 'film', null,
    3, null, 0, null, null, null, null,
    'Prenamijenjeni make-up kamion s opremljenim radnim mjestima za produkciju.',
    'A repurposed make-up truck with equipped workstations.',
    array['https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg'],
    '{}', true, 24
  ),
  (
    'costume-truck-renault-master', 'Costume truck RENAULT MASTER Box', 'film', null,
    3, null, 0, null, null, null, null,
    'Mobilno kostimografsko vozilo za filmske i televizijske produkcije.',
    'Mobile costume vehicle for film and television productions.',
    array['https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp'],
    '{}', true, 25
  )
on conflict (slug) do update set
  name = excluded.name,
  type = excluded.type,
  category = excluded.category,
  seats = excluded.seats,
  beds = excluded.beds,
  bags = excluded.bags,
  max_adults = excluded.max_adults,
  max_children = excluded.max_children,
  base_price_per_day = excluded.base_price_per_day,
  sale_price = excluded.sale_price,
  description_hr = excluded.description_hr,
  description_en = excluded.description_en,
  images = excluded.images,
  specs = excluded.specs,
  is_available = excluded.is_available,
  sort_order = excluded.sort_order;

insert into posts (
  slug, title_hr, title_en, content_hr, content_en, excerpt_hr,
  cover_image, is_published, published_at
) values
  (
    'camping-center-petroni-alde-servis',
    'Camping Center Petroni postao ovlašteni servis za Alde grijanje u Hrvatskoj',
    'Camping Center Petroni — authorised Alde service in Croatia',
    'Camping Center Petroni postao je ovlašteni servis za Alde sustave grijanja u Hrvatskoj. Za informacije o servisu, terminima i opremi obratite se našem timu.',
    'Camping Center Petroni is now an authorised Alde heating service in Croatia. Contact our team for service and equipment information.',
    'Novost iz Petroni servisnog centra.',
    'https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg',
    true, '2025-03-10'
  ),
  (
    'klima-uredaj-plein-aircon-12v', 'Klima uređaj PLEIN-Aircon 12V',
    'PLEIN-Aircon 12V air conditioner',
    'Predstavljamo PLEIN-Aircon 12V klima uređaj za ugodniji boravak u kamperu ili kamp-prikolici. Za tehničke detalje i dostupnost kontaktirajte nas.',
    'Introducing the PLEIN-Aircon 12V air conditioner. Contact us for technical details and availability.',
    'Klima uređaj za kamper i kamp-prikolicu.',
    'https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg',
    true, '2025-02-22'
  ),
  (
    'katalog-remo-2024', 'Katalog REMO 2024', 'REMO 2024 catalogue',
    'Pregledajte novosti i opremu iz kataloga REMO 2024. Za pomoć pri odabiru proizvoda javite se Petroni timu.',
    'Explore the REMO 2024 catalogue. Contact the Petroni team for help choosing products.',
    'Novosti i oprema iz kataloga REMO.',
    'https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp',
    true, '2024-12-01'
  ),
  (
    'camper-trolley', 'Camper Trolley za jednostavno manevriranje s prikolicama',
    'Camper Trolley for easy trailer manoeuvring',
    'Camper Trolley olakšava precizno i sigurno manevriranje kamp-prikolicom na ograničenom prostoru.',
    'Camper Trolley makes precise and safe caravan manoeuvring easier in tight spaces.',
    'Jednostavnije manevriranje kamp-prikolicom.',
    'https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg',
    true, '2024-10-15'
  ),
  (
    'priprema-kamp-prikolice-za-zimu', 'Priprema kamp-prikolice za "zimski san"',
    'Preparing your caravan for winter',
    'Pravilna priprema kamp-prikolice za zimu pomaže zaštititi instalacije, opremu i interijer tijekom hladnih mjeseci.',
    'Proper winter preparation helps protect your caravan systems, equipment, and interior.',
    'Praktični savjeti za zimsku pripremu.',
    'https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg',
    true, '2024-10-01'
  ),
  (
    'priprema-kampera-za-zimu', 'Priprema kampera za zimu',
    'Preparing your camper for winter',
    'Prije zimskog razdoblja provjerite vodeni sustav, baterije, gume i zaštitu interijera svojeg kampera.',
    'Before winter, check your camper water system, batteries, tyres, and interior protection.',
    'Kontrolna lista za sigurnu zimsku pohranu kampera.',
    'https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp',
    true, '2024-09-20'
  )
on conflict (slug) do update set
  title_hr = excluded.title_hr,
  title_en = excluded.title_en,
  content_hr = excluded.content_hr,
  content_en = excluded.content_en,
  excerpt_hr = excluded.excerpt_hr,
  cover_image = excluded.cover_image,
  is_published = excluded.is_published,
  published_at = excluded.published_at;
