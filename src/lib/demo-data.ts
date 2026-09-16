import type {
  BookingExtra,
  BookingExtraCategory,
  Fee,
  Post,
  Product,
  ProductCategory,
  RentalLocation,
  Season,
  SeasonPrice,
  Vehicle
} from '$lib/supabase';

const createdAt = '2026-09-01T09:00:00.000Z';

export const DEMO_VEHICLES: Vehicle[] = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    slug: 'alderway-grand-tour-7',
    name: 'Alderway Grand Tour 7',
    type: 'rental',
    category: 'SIGNATURE',
    seats: 7,
    bags: 7,
    sale_price: null,
    description_hr: 'Prostrani premium kamper sa sedam putnih mjesta, fleksibilnim ležajevima i velikom garažom za duže obiteljske ture.',
    description_en: 'A spacious premium motorhome with seven travel seats, flexible berths and a large garage for longer family tours.',
    images: [
      '/images/vehicles/roller-team-kronos-277m/01-izvana.webp',
      '/images/brand/alderway-interior.webp'
    ],
    specs: { chassis: 'Ford Transit 2.0 EcoBlue', power_hp: 155, model_year: 2026, transmission: 'automatic', dimensions_m: '6.99 × 2.35 × 3.20', seats_beds: '7 / 7', cab_ac: true, living_ac: true, deposit_eur: 3000 },
    is_available: true,
    created_at: createdAt,
    beds: 7,
    max_adults: 5,
    max_children: 2,
    base_price_per_day: 229,
    sort_order: 1
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    slug: 'alderway-northstar-6',
    name: 'Alderway Northstar 6',
    type: 'rental',
    category: 'SIGNATURE',
    seats: 6,
    bags: 6,
    sale_price: null,
    description_hr: 'Premium obiteljski kamper sa šest ležajeva, odvojenim zonama odmora i izdašnim prostorom za opremu.',
    description_en: 'A premium family motorhome with six berths, separate sleeping zones and generous equipment storage.',
    images: [
      '/images/vehicles/ci-horon-79m/03-horon-79-2.webp',
      '/images/vehicles/ci-horon-79m/08-horon79-0.webp'
    ],
    specs: { chassis: 'Ford Transit 2.0 EcoBlue', power_hp: 155, model_year: 2026, transmission: 'automatic', dimensions_m: '7.43 × 2.35 × 3.20', seats_beds: '6 / 6', cab_ac: true, living_ac: true, deposit_eur: 3000 },
    is_available: true,
    created_at: createdAt,
    beds: 6,
    max_adults: 4,
    max_children: 2,
    base_price_per_day: 219,
    sort_order: 2
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    slug: 'alderway-meridian-5',
    name: 'Alderway Meridian 5',
    type: 'rental',
    category: 'SIGNATURE',
    seats: 5,
    bags: 5,
    sale_price: null,
    description_hr: 'Elegantan poluintegrirani kamper s odvojenim stražnjim ležajevima, podiznim krevetom i prostranom kupaonicom.',
    description_en: 'An elegant low-profile motorhome with separate rear beds, a drop-down bed and a spacious bathroom.',
    images: [
      '/images/vehicles/mclouis-mc4-873/01-izvana.webp',
      '/images/brand/alderway-interior.webp'
    ],
    specs: { chassis: 'Ford Transit 2.0 EcoBlue', power_hp: 165, model_year: 2026, transmission: 'automatic', dimensions_m: '7.45 × 2.35 × 3.15', seats_beds: '5 / 5', cab_ac: true, living_ac: true, deposit_eur: 2800 },
    is_available: true,
    created_at: createdAt,
    beds: 5,
    max_adults: 4,
    max_children: 1,
    base_price_per_day: 209,
    sort_order: 3
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    slug: 'alderway-wayfarer-6',
    name: 'Alderway Wayfarer 6',
    type: 'rental',
    category: 'FAMILY',
    seats: 6,
    bags: 5,
    sale_price: null,
    description_hr: 'Svestran obiteljski kamper sa šest sjedala, praktičnim krevetima i obiljem spremišta.',
    description_en: 'A versatile family motorhome with six belted seats, practical sleeping zones and generous storage.',
    images: [
      '/images/vehicles/rimor-kilig-50/01-k50-3.webp',
      '/images/vehicles/rimor-kilig-50/06-kilig-50-002.webp',
      '/images/vehicles/rimor-kilig-50/10-kilig-50-008.webp'
    ],
    specs: { chassis: 'Ford Transit 2.0 EcoBlue', power_hp: 130, model_year: 2025, transmission: 'manual', dimensions_m: '7.29 × 2.34 × 3.04', seats_beds: '6 / 6', cab_ac: true, living_ac: true, deposit_eur: 2500 },
    is_available: true,
    created_at: createdAt,
    beds: 6,
    max_adults: 4,
    max_children: 2,
    base_price_per_day: 179,
    sort_order: 4
  },
  {
    id: '10000000-0000-4000-8000-000000000005',
    slug: 'alderway-horizon-6',
    name: 'Alderway Horizon 6',
    type: 'rental',
    category: 'FAMILY',
    seats: 6,
    bags: 5,
    sale_price: null,
    description_hr: 'Udoban obiteljski kamper s dobro organiziranim dnevnim prostorom i više odvojenih zona za spavanje.',
    description_en: 'A comfortable family motorhome with a well-organised lounge and several separate sleeping zones.',
    images: [
      '/images/vehicles/alderway-horizon-6/01-horizon-exterior.webp',
      '/images/vehicles/rimor-evo-sound/03-eso-7.webp',
      '/images/vehicles/rimor-evo-sound/04-eso-10.webp'
    ],
    specs: { chassis: 'Ford Transit 2.0 EcoBlue', power_hp: 145, model_year: 2025, transmission: 'manual', dimensions_m: '6.97 × 2.30 × 3.04', seats_beds: '6 / 6', cab_ac: true, living_ac: true, deposit_eur: 2500 },
    is_available: true,
    created_at: createdAt,
    beds: 6,
    max_adults: 4,
    max_children: 2,
    base_price_per_day: 169,
    sort_order: 5
  },
  {
    id: '10000000-0000-4000-8000-000000000006',
    slug: 'alderway-nomad-4',
    name: 'Alderway Nomad 4',
    type: 'rental',
    category: 'FAMILY',
    seats: 4,
    bags: 3,
    sale_price: null,
    description_hr: 'Kompaktan premium camper van za parove i male obitelji.',
    description_en: 'A compact premium camper van for couples and small families, with automatic transmission and a clever interior.',
    images: [
      '/images/vehicles/caratour-ford-600mq/01-1-caratour.webp',
      '/images/vehicles/caratour-ford-600mq/07-4-interior.webp',
      '/images/vehicles/caratour-ford-600mq/14-11-interiro.webp'
    ],
    specs: { chassis: 'Ford Transit 2.0 EcoBlue', power_hp: 170, model_year: 2026, transmission: 'automatic', dimensions_m: '5.99 × 2.06 × 2.84', seats_beds: '4 / 3', cab_ac: true, living_ac: true, deposit_eur: 2400 },
    is_available: true,
    created_at: createdAt,
    beds: 3,
    max_adults: 3,
    max_children: 1,
    base_price_per_day: 159,
    sort_order: 6
  },
  {
    id: '10000000-0000-4000-8000-000000000007',
    slug: 'alderway-atlas-4',
    name: 'Alderway Atlas 4',
    type: 'rental',
    category: 'ADVENTURE',
    seats: 4,
    bags: 4,
    sale_price: null,
    description_hr: 'Prostrani touring van s uzdužnim stražnjim ležajevima, snažnim motorom i izvrsnim prostorom za putnu opremu.',
    description_en: 'A spacious touring van with longitudinal rear beds, a powerful engine and excellent travel-equipment storage.',
    images: [
      '/images/brand/alderway-hero.webp',
      '/images/brand/alderway-interior.webp'
    ],
    specs: { chassis: 'MAN TGE 2.0 TDI', power_hp: 177, model_year: 2025, transmission: 'automatic', dimensions_m: '6.84 × 2.04 × 2.68', seats_beds: '4 / 3', cab_ac: true, living_ac: true, deposit_eur: 2400 },
    is_available: true,
    created_at: createdAt,
    beds: 3,
    max_adults: 3,
    max_children: 1,
    base_price_per_day: 189,
    sort_order: 7
  },
  {
    id: '10000000-0000-4000-8000-000000000008',
    slug: 'alderway-ridge-4x4',
    name: 'Alderway Ridge 4x4',
    type: 'rental',
    category: 'ADVENTURE',
    seats: 2,
    bags: 2,
    sale_price: null,
    description_hr: 'Kompaktan 4x4 camper van za dvoje i putovanja izvan uobičajenih ruta.',
    description_en: 'A compact 4x4 camper van for two, made for mountain roads and journeys beyond the usual routes.',
    images: [
      '/images/vehicles/alderway-ridge-4x4/01-vw-transporter-1.webp',
      '/images/vehicles/alderway-ridge-4x4/04-t4-3.webp',
      '/images/vehicles/alderway-ridge-4x4/10-vw-transporter-3.webp'
    ],
    specs: { chassis: 'Volkswagen Transporter 4Motion', power_hp: 150, model_year: 2025, transmission: 'automatic', dimensions_m: '5.31 × 1.91 × 2.60', seats_beds: '2 / 2', cab_ac: true, living_ac: false, deposit_eur: 2200 },
    is_available: true,
    created_at: createdAt,
    beds: 2,
    max_adults: 2,
    max_children: 0,
    base_price_per_day: 149,
    sort_order: 8
  },
  {
    id: '10000000-0000-4000-8000-000000000009',
    slug: 'alderway-trail-2',
    name: 'Alderway Trail 2',
    type: 'rental',
    category: 'ADVENTURE',
    seats: 2,
    bags: 2,
    sale_price: null,
    description_hr: 'Praktičan i cjenovno pristupačan camper van za dvoje, s jednostavnim rasporedom i dovoljno mjesta za vikend opremu.',
    description_en: 'A practical, accessible camper van for two, with a straightforward layout and useful weekend-gear storage.',
    images: [
      '/images/vehicles/alderway-ridge-4x4/01-vw-transporter-1.webp',
      '/images/brand/alderway-interior.webp'
    ],
    specs: { chassis: 'Renault Master 2.3 dCi', power_hp: 150, model_year: 2024, transmission: 'manual', dimensions_m: '5.55 × 2.07 × 2.65', seats_beds: '2 / 2', cab_ac: true, living_ac: false, deposit_eur: 1800 },
    is_available: true,
    created_at: createdAt,
    beds: 2,
    max_adults: 2,
    max_children: 0,
    base_price_per_day: 129,
    sort_order: 9
  }
];

export const DEMO_LOCATIONS: RentalLocation[] = [
  { id: '20000000-0000-4000-8000-000000000001', name: 'Northmere Basecamp', location_fee: 0, pickup_window: '13:00-15:00', return_window: '08:00-10:00', time_policy: 'zagreb_automatic', after_hours_start: '15:00', sort_order: 1 },
  { id: '20000000-0000-4000-8000-000000000002', name: 'Northmere Central Station', location_fee: 35, pickup_window: null, return_window: null, time_policy: 'agreement_hr', after_hours_start: null, sort_order: 2 },
  { id: '20000000-0000-4000-8000-000000000003', name: 'Northmere Airport', location_fee: 55, pickup_window: null, return_window: null, time_policy: 'agreement_hr', after_hours_start: null, sort_order: 3 }
];

export const DEMO_EXTRA_CATEGORIES: BookingExtraCategory[] = [
  { key: 'oprema', name_hr: 'Oprema', name_en: 'Travel equipment', sort_order: 1 },
  { key: 'ostalo', name_hr: 'Putovanje', name_en: 'Journey options', sort_order: 2 }
];

export const DEMO_EXTRAS: BookingExtra[] = [
  { id: '30000000-0000-4000-8000-000000000001', name_hr: 'Stol i dvije stolice', name_en: 'Outdoor table and two chairs', description_hr: 'Sklopivi set za boravak na otvorenom.', description_en: 'A folding set for relaxed outdoor living.', price: 35, price_type: 'per_rental', category: 'oprema', max_qty: 1, is_required: false, sort_order: 1 },
  { id: '30000000-0000-4000-8000-000000000002', name_hr: 'Set posteljine za dvoje', name_en: 'Bedding set for two', description_hr: 'Čista posteljina, jastuci i ručnici.', description_en: 'Fresh bedding, pillows and towels.', price: 45, price_type: 'per_rental', category: 'oprema', max_qty: 3, is_required: false, sort_order: 2 },
  { id: '30000000-0000-4000-8000-000000000003', name_hr: 'Međunarodno putovanje', name_en: 'International travel', description_hr: 'Administrativna priprema za prijavljeno međunarodno putovanje.', description_en: 'Administration for a declared international journey.', price: 40, price_type: 'per_rental', category: 'ostalo', max_qty: 1, is_required: false, auto_apply_rule: 'border_crossing', sort_order: 3 }
];

export const DEMO_SEASONS: Season[] = [
  { id: '40000000-0000-4000-8000-000000000001', name: 'Autumn & winter 2026', date_from: '2026-09-01', date_to: '2026-12-31', min_nights: 3, sort_order: 1 },
  { id: '40000000-0000-4000-8000-000000000002', name: 'Winter & spring 2027', date_from: '2027-01-01', date_to: '2027-04-30', min_nights: 3, sort_order: 2 },
  { id: '40000000-0000-4000-8000-000000000003', name: 'Early summer 2027', date_from: '2027-05-01', date_to: '2027-06-30', min_nights: 5, sort_order: 3 },
  { id: '40000000-0000-4000-8000-000000000004', name: 'Peak season 2027', date_from: '2027-07-01', date_to: '2027-08-31', min_nights: 7, sort_order: 4 }
];

export const DEMO_SEASON_PRICES: SeasonPrice[] = DEMO_SEASONS.flatMap((season, seasonIndex) =>
  DEMO_VEHICLES.map((vehicle, vehicleIndex) => ({
    id: `50000000-0000-4000-8${seasonIndex}00-00000000000${vehicleIndex + 1}`,
    season_id: season.id,
    vehicle_id: vehicle.id,
    price_per_day: Number(vehicle.base_price_per_day ?? 0) + seasonIndex * 18
  }))
);

export const DEMO_FEES: Fee[] = [
  { id: '60000000-0000-4000-8000-000000000001', key: 'sunday_holiday', name_hr: 'Nedjelja ili praznik', description_hr: 'Doplata za primopredaju nedjeljom ili praznikom.', amount: 45, fee_type: 'per_event', is_active: true },
  { id: '60000000-0000-4000-8000-000000000002', key: 'early_pickup_hour', name_hr: 'Ranije preuzimanje', description_hr: 'Doplata po satu prije uključenog termina.', amount: 25, fee_type: 'per_event', is_active: true },
  { id: '60000000-0000-4000-8000-000000000003', key: 'late_return_hour', name_hr: 'Kasniji povrat', description_hr: 'Doplata po satu nakon uključenog termina.', amount: 25, fee_type: 'per_event', is_active: true },
  { id: '60000000-0000-4000-8000-000000000004', key: 'extra_km', name_hr: 'Dodatni kilometar', description_hr: 'Procijenjena cijena iznad uključene kilometraže.', amount: 0.35, fee_type: 'per_km', is_active: true }
];

export const DEMO_TERMS = {
  version: 'alderway-demo-2026-09',
  content_hr: '## Opći uvjeti najma\n\nRezervacija postaje konačna nakon potvrde dostupnosti i evidentiranja dogovorenog plaćanja.\n\n## Preuzimanje i povrat\n\nVozilo se preuzima i vraća na dogovorenom mjestu i u dogovorenom terminu.',
  content_en: '## General rental terms\n\nA booking becomes final after availability is confirmed and the agreed payment is recorded.\n\n## Collection and return\n\nThe vehicle must be collected and returned at the agreed place and time.'
};

export const DEMO_PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: '70000000-0000-4000-8000-000000000001',
    slug: 'water-and-power',
    name_hr: 'Voda i struja',
    name_en: 'Water & power',
    parent_id: null,
    sort_order: 1
  },
  {
    id: '70000000-0000-4000-8000-000000000002',
    slug: 'vehicle-hardware',
    name_hr: 'Oprema za vozilo',
    name_en: 'Vehicle hardware',
    parent_id: null,
    sort_order: 2
  },
  {
    id: '70000000-0000-4000-8000-000000000003',
    slug: 'touring-safety',
    name_hr: 'Sigurnost na putu',
    name_en: 'Touring safety',
    parent_id: null,
    sort_order: 3
  }
];

export const DEMO_PRODUCTS: Product[] = [
  {
    id: '71000000-0000-4000-8000-000000000001',
    slug: '12v-water-pressure-pump',
    name_hr: 'Tlačna pumpa za vodu 12 V',
    name_en: '12V water pressure pump',
    description_hr: 'Kompaktna pumpa protoka 7 litara u minuti s automatskim tlačnim prekidačem, tihim nosačima i priključcima za brzo spajanje.',
    description_en: 'A compact 7-litre-per-minute pump with an automatic pressure switch, vibration-damping mounts and quick-connect fittings.',
    price: 119,
    category_id: DEMO_PRODUCT_CATEGORIES[0].id,
    images: ['/images/products/rv-parts/12v-water-pump.webp'],
    stock: 14,
    sku: 'ALD-WTR-01',
    brand: 'Alderway Essentials',
    pickup_only: false,
    is_active: true,
    created_at: createdAt
  },
  {
    id: '71000000-0000-4000-8000-000000000002',
    slug: 'heavy-duty-levelling-ramps',
    name_hr: 'Nivelatori Heavy Duty',
    name_en: 'Heavy-duty levelling ramps',
    description_hr: 'Par ojačanih troslojnih nivelatora s protukliznim umetcima, prikladan za kampere mase do pet tona.',
    description_en: 'A pair of reinforced three-stage levelling ramps with high-grip inserts, suitable for motorhomes up to five tonnes.',
    price: 69,
    category_id: DEMO_PRODUCT_CATEGORIES[2].id,
    images: ['/images/products/rv-parts/levelling-ramps.webp'],
    stock: 18,
    sku: 'ALD-SAFE-01',
    brand: 'Alderway Essentials',
    pickup_only: false,
    is_active: true,
    created_at: createdAt
  },
  {
    id: '71000000-0000-4000-8000-000000000003',
    slug: '25m-shore-power-cable',
    name_hr: 'CEE kabel za priključak 25 m',
    name_en: '25m shore power cable',
    description_hr: 'Izdržljiv CEE kabel duljine 25 metara s vodootpornim plavim priključcima za kampove i servisna mjesta.',
    description_en: 'A durable 25-metre CEE cable with weather-resistant blue connectors for campsites and service points.',
    price: 109,
    category_id: DEMO_PRODUCT_CATEGORIES[0].id,
    images: ['/images/products/rv-parts/shore-power-cable.webp'],
    stock: 16,
    sku: 'ALD-PWR-01',
    brand: 'Alderway Essentials',
    pickup_only: false,
    is_active: true,
    created_at: createdAt
  },
  {
    id: '71000000-0000-4000-8000-000000000004',
    slug: 'dual-lpg-regulator',
    name_hr: 'Dvojni LPG regulator',
    name_en: 'Dual LPG regulator',
    description_hr: 'Horizontalni regulator s automatskim prebacivanjem boca, manometrom i sigurnosnim crijevima za stabilan plinski sustav kampera.',
    description_en: 'A horizontal regulator with automatic cylinder changeover, pressure gauge and safety hoses for a dependable camper gas system.',
    price: 189,
    category_id: DEMO_PRODUCT_CATEGORIES[1].id,
    images: ['/images/products/rv-parts/dual-lpg-regulator.webp'],
    stock: 10,
    sku: 'ALD-GAS-01',
    brand: 'Alderway Essentials',
    pickup_only: false,
    is_active: true,
    created_at: createdAt
  },
  {
    id: '71000000-0000-4000-8000-000000000005',
    slug: 'fresh-water-inlet-kit',
    name_hr: 'Priključak za svježu vodu',
    name_en: 'Fresh-water inlet kit',
    description_hr: 'Vanjski priključak s bravicom, čepom, crijevom prehrambene kvalitete, obujmicama i spojnicama za urednu ugradnju.',
    description_en: 'A lockable exterior inlet with cap, food-grade hose, clamps and fittings for a clean, secure installation.',
    price: 59,
    category_id: DEMO_PRODUCT_CATEGORIES[0].id,
    images: ['/images/products/rv-parts/fresh-water-inlet-kit.webp'],
    stock: 7,
    sku: 'ALD-WTR-02',
    brand: 'Alderway Essentials',
    pickup_only: false,
    is_active: true,
    created_at: createdAt
  },
  {
    id: '71000000-0000-4000-8000-000000000006',
    slug: '12v-roof-vent-fan',
    name_hr: 'Krovni ventilator 12 V',
    name_en: '12V roof vent fan',
    description_hr: 'Niskoprofilni krovni otvor s ventilatorom, zatamnjenim poklopcem i tihim 12 V motorom za učinkovit protok zraka.',
    description_en: 'A low-profile roof vent with a smoked lid and quiet 12V fan for reliable airflow through the living space.',
    price: 249,
    category_id: DEMO_PRODUCT_CATEGORIES[1].id,
    images: ['/images/products/rv-parts/roof-vent-fan.webp'],
    stock: 15,
    sku: 'ALD-HW-01',
    brand: 'Alderway Essentials',
    pickup_only: false,
    is_active: true,
    created_at: createdAt
  },
  {
    id: '71000000-0000-4000-8000-000000000007',
    slug: 'manual-rv-entry-step',
    name_hr: 'Ručna ulazna stepenica 550',
    name_en: 'Manual RV entry step 550',
    description_hr: 'Izvlačna stepenica širine 550 mm s ojačanim čeličnim okvirom, aluminijskim gazištem i protukliznom površinom.',
    description_en: 'A 550 mm slide-out step with a reinforced steel frame, aluminium tread and non-slip surface.',
    price: 229,
    category_id: DEMO_PRODUCT_CATEGORIES[1].id,
    images: ['/images/products/rv-parts/manual-entry-step.webp'],
    stock: 12,
    sku: 'ALD-HW-02',
    brand: 'Alderway Essentials',
    pickup_only: true,
    is_active: true,
    created_at: createdAt
  },
  {
    id: '71000000-0000-4000-8000-000000000008',
    slug: 'heavy-duty-wheel-chocks',
    name_hr: 'Klinovi za kotače Heavy Duty',
    name_en: 'Heavy-duty wheel chocks',
    description_hr: 'Par ojačanih klinova s dubokim rebrima i spojnim užetom za sigurno parkiranje kampera i kamp prikolica.',
    description_en: 'A reinforced pair with deep tyre-grip ribs and a connecting rope for secure motorhome and caravan parking.',
    price: 39,
    category_id: DEMO_PRODUCT_CATEGORIES[2].id,
    images: ['/images/products/rv-parts/wheel-chocks.webp'],
    stock: 11,
    sku: 'ALD-SAFE-02',
    brand: 'Alderway Essentials',
    pickup_only: false,
    is_active: true,
    created_at: createdAt
  },
  {
    id: '71000000-0000-4000-8000-000000000009',
    slug: 'universal-towing-mirrors',
    name_hr: 'Univerzalni dodatni retrovizori',
    name_en: 'Universal towing mirrors',
    description_hr: 'Aerodinamični par dodatnih retrovizora s podesivim krakovima i gumenim stezaljkama za stabilan pogled uz kamp prikolicu.',
    description_en: 'An aerodynamic pair with adjustable arms and rubber clamps for a stable rearward view when towing a caravan.',
    price: 99,
    category_id: DEMO_PRODUCT_CATEGORIES[2].id,
    images: ['/images/products/rv-parts/towing-mirrors.webp'],
    stock: 9,
    sku: 'ALD-SAFE-03',
    brand: 'Alderway Essentials',
    pickup_only: false,
    is_active: true,
    created_at: createdAt
  }
];

export const DEMO_POSTS: Post[] = [
  {
    id: '72000000-0000-4000-8000-000000000001',
    slug: 'first-motorhome-weekend-guide',
    title_hr: 'Prvi vikend kamperom: jednostavan vodič',
    title_en: 'Your first motorhome weekend: a simple guide',
    excerpt_hr: 'Od preuzimanja do prve noći: nekoliko mirnih koraka za samouvjeren početak.',
    content_hr: 'Za prvi izlet odaberite kratku rutu i kamp do kojeg možete stići prije mraka. Nakon osobnog upoznavanja s vozilom spremite dimenzije kampera, provjerite vodu i struju te ostavite dovoljno vremena za mirno postavljanje. Prva večer najbolja je bez prenatrpanog rasporeda: jednostavan obrok, kratka šetnja i malo vremena za upoznavanje prostora.',
    content_en: 'For a first trip, choose a short route and a campsite you can reach before dark. After the personal handover, save the vehicle dimensions, check the water and power systems, and leave enough time to settle in calmly. Keep the first evening simple: an easy meal, a short walk and time to get comfortable with the space.',
    cover_image: '/images/brand/alderway-lifestyle.webp',
    is_published: true,
    published_at: '2026-09-05T09:00:00.000Z',
    created_at: createdAt
  },
  {
    id: '72000000-0000-4000-8000-000000000002',
    slug: 'choose-the-right-camper',
    title_hr: 'Kako odabrati pravi kamper za svoje putovanje',
    title_en: 'How to choose the right camper for your trip',
    excerpt_hr: 'Kreveti, sjedala, spremište i stil vožnje — što zaista treba usporediti.',
    content_hr: 'Broj ležajeva nije jedina važna brojka. Usporedite homologirana sjedala, raspored kreveta, kupaonicu, veličinu garaže i ukupne dimenzije vozila. Parovima obično odgovara kompaktniji touring van, dok obitelji cijene odvojene zone za spavanje i više spremišta. Pravi izbor je vozilo koje odgovara Vašoj svakodnevnoj rutini na putu.',
    content_en: 'Berth count is only part of the decision. Compare belted travel seats, bed layout, bathroom space, garage storage and the vehicle’s overall dimensions. Couples often prefer a compact touring van, while families value separate sleeping zones and more storage. The right choice is the vehicle that fits your daily rhythm on the road.',
    cover_image: '/images/brand/alderway-hero.webp',
    is_published: true,
    published_at: '2026-08-19T09:00:00.000Z',
    created_at: createdAt
  },
  {
    id: '72000000-0000-4000-8000-000000000003',
    slug: 'slow-road-trip-packing-list',
    title_hr: 'Popis za sporije i lakše putovanje',
    title_en: 'A packing list for slower, easier road trips',
    excerpt_hr: 'Praktična oprema koja donosi više udobnosti bez nepotrebnog tereta.',
    content_hr: 'Dobra lista počinje slojevima odjeće, udobnom obućom i jednom manjom torbom po putniku. Dodajte punjače, svjetiljku, višekratne boce i osnovne namirnice za prvi dan. Većina kuhinjske i kamperske opreme već je u vozilu, pa prije polaska provjerite uključen inventar i ponesite samo ono što ćete doista koristiti.',
    content_en: 'A useful packing list starts with clothing layers, comfortable shoes and one small bag per traveller. Add chargers, a torch, refillable bottles and basic food for the first day. Most kitchen and camping equipment is already on board, so check the included inventory and bring only what you will genuinely use.',
    cover_image: '/images/brand/alderway-gear-collection.webp',
    is_published: true,
    published_at: '2026-08-02T09:00:00.000Z',
    created_at: createdAt
  }
];
