import { BUSINESS } from '$lib/config/business';

export type SitePageKey = 'home' | 'about' | 'contact' | 'faq';

export type LocalizedText = {
  hr: string;
  en: string;
};

export type SitePageItem = {
  id: string;
  title?: LocalizedText;
  body?: LocalizedText;
  image?: string;
  alt?: LocalizedText;
  href?: string;
  value?: number;
  suffix?: string;
  icon?: 'card' | 'pin' | 'star';
  filter?: string;
};

export type SitePageSection = {
  id: string;
  type:
    | 'hero'
    | 'vehicle_grid'
    | 'logo_grid'
    | 'feature_grid'
    | 'image_strip'
    | 'stats'
    | 'logo_marquee'
    | 'split_content'
    | 'testimonials'
    | 'split_cta'
    | 'contact'
    | 'faq';
  label: string;
  visible: boolean;
  variant?: string;
  eyebrow?: LocalizedText;
  title?: LocalizedText;
  body?: LocalizedText;
  image?: string;
  imageAlt?: LocalizedText;
  ctaLabel?: LocalizedText;
  ctaHref?: string;
  items?: SitePageItem[];
};

export type SitePageContent = {
  title: LocalizedText;
  seoDescription: LocalizedText;
  sections: SitePageSection[];
};

export const SITE_PAGE_DEFINITIONS: Record<SitePageKey, { label: string; route: string }> = {
  home: { label: 'Naslovnica', route: '/' },
  about: { label: 'O nama', route: '/o-nama' },
  contact: { label: 'Kontakt', route: '/kontakt' },
  faq: { label: 'FAQ', route: '/faq' }
};

const t = (hr: string, en: string): LocalizedText => ({ hr, en });

export const DEFAULT_SITE_PAGES: Record<SitePageKey, SitePageContent> = {
  home: {
    title: t(`${BUSINESS.name} — premium najam kampera`, `${BUSINESS.name} — premium camper hire`),
    seoDescription: t(
      'Pažljivo pripremljeni kamperi, jasne cijene i praktična podrška za putovanja bez žurbe.',
      'Thoughtfully prepared campers, clear pricing and practical support for road trips without the rush.'
    ),
    sections: [
      {
        id: 'hero', type: 'hero', label: 'Glavni banner', visible: true, variant: 'home',
        title: t('Više ceste.\nManje žurbe.', 'More road.\nLess rush.'),
        body: t('Premium kamperi, jasna pravila i podrška stvarnih ljudi — od prve pretrage do povratka ključeva.', 'Premium campers, clear terms and support from real people — from your first search to the moment you return the keys.'),
        image: '/images/brand/alderway-hero.webp',
        imageAlt: t('Moderan kamper uz planinsko jezero u zoru', 'Modern camper beside a mountain lake at dawn'),
        ctaLabel: t('Rezerviraj', 'Book now'), ctaHref: '/rezerviraj'
      },
      {
        id: 'rentals', type: 'vehicle_grid', label: 'Vozila za najam', visible: true, variant: 'rental',
        eyebrow: t('Odaberite svoj način putovanja', 'Choose how you want to travel'),
        title: t('Kamperi spremni za cestu', 'Campers ready for the road'),
        body: t('Trebate više prostora za odluku?', 'Need more room to decide?'),
        ctaLabel: t('Usporedite cijelu flotu.', 'Compare the full fleet.'), ctaHref: '/vozila/najam-kampera'
      },
      { id: 'partners', type: 'logo_grid', label: 'Partneri', visible: false, items: [] },
      {
        id: 'sales', type: 'vehicle_grid', label: 'Vozila za prodaju', visible: false, variant: 'sale',
        eyebrow: t('Tražite vlastitog ljubimca na 4 kotača?', 'Looking for your own home on wheels?'),
        title: t('Vozila za prodaju', 'Vehicles for sale'),
        body: t('Zanima Vas više?', 'Want to see more?'),
        ctaLabel: t('Pogledajte sva vozila za prodaju.', 'See all vehicles for sale.'), ctaHref: '/vozila/vozila-za-prodaju'
      },
      {
        id: 'advantages', type: 'feature_grid', label: 'Glavne prednosti', visible: true,
        eyebrow: t('Dobro putovanje počinje prije polaska', 'A good trip starts before departure'), title: t('Sve bitno, bez sitnih slova', 'Everything that matters, clearly handled'),
        items: [
          { id: 'transparent', icon: 'card', title: t('Jasna cijena', 'Clear pricing'), body: t('Sezonske cijene, obvezne naknade i dodaci prikazani su prije potvrde rezervacije.', 'Seasonal rates, required fees and optional extras are shown before you confirm.') },
          { id: 'locations', icon: 'pin', title: t('Fleksibilno preuzimanje', 'Flexible collection'), body: t('Odaberite glavno preuzimno mjesto ili zatražite dogovoreni transfer na odabranu lokaciju.', 'Collect from our touring hub or request an agreed transfer to a selected location.') },
          { id: 'support', icon: 'star', title: t('Pripremljeno s pažnjom', 'Prepared with care'), body: t('Svako vozilo prolazi pregled, detaljno čišćenje i osobno upoznavanje prije polaska.', 'Every vehicle is inspected, thoroughly cleaned and handed over with a personal walkthrough.') }
        ]
      },
      {
        id: 'gallery', type: 'image_strip', label: 'Galerija', visible: true,
        items: [
          { id: 'gallery-1', image: '/images/brand/alderway-lifestyle.webp', alt: t('Doručak uz kamper na mirnoj lokaciji', 'Breakfast beside a camper in a quiet setting') },
          { id: 'gallery-2', image: '/images/brand/alderway-interior.webp', alt: t('Topao i funkcionalan interijer kampera', 'Warm and practical camper interior') },
          { id: 'gallery-3', image: '/images/brand/alderway-hero.webp', alt: t('Kamper uz planinsko jezero', 'Camper beside a mountain lake') }
        ]
      },
      {
        id: 'stats', type: 'stats', label: 'Brojke', visible: true,
        items: [
          { id: 'users', value: 1842, suffix: '', title: t('Završenih putovanja', 'Trips completed') },
          { id: 'years', value: 11, suffix: '', title: t('Godina na cesti', 'Years on the road') },
          { id: 'vehicles', value: 9, suffix: '', title: t('Pažljivo odabranih vozila', 'Carefully selected vehicles') }
        ]
      },
      {
        id: 'brands', type: 'logo_marquee', label: 'Brendovi vozila i opreme', visible: false,
        items: [
          { id: 'rimor', title: t('RIMOR', 'RIMOR'), image: '/partners/logos/rimor.svg', href: 'https://www.rimor.it/it/en' },
          { id: 'caravans-international', title: t('CARAVANS INT.', 'CARAVANS INT.'), image: '/partners/logos/caravans-international.svg', href: 'https://www.caravansinternational.it/fr/' },
          { id: 'mega-mobil', title: t('MEGA MOBIL', 'MEGA MOBIL'), image: '/partners/logos/mega-mobil-dark.png', href: 'https://megamobil.si/en/' },
          { id: 'thetford', title: t('THETFORD', 'THETFORD'), image: '/partners/logos/thetford.png', href: 'https://www.thetford.com/' },
          { id: 'knaus', title: t('KNAUS', 'KNAUS'), image: '/partners/logos/knaus-dark.png', href: 'https://www.knaus.com/en-int/' },
          { id: 'roller-team', title: t('ROLLER TEAM', 'ROLLER TEAM'), image: '/partners/logos/roller-team.svg', href: 'https://www.rollerteam.it/' },
          { id: 'truma', title: t('TRUMA', 'TRUMA'), image: '/partners/logos/truma-cropped.webp', href: 'https://www.truma.com/' },
          { id: 'weinsberg', title: t('WEINSBERG', 'WEINSBERG'), image: '/partners/logos/weinsberg.png', href: 'https://weinsberg.com/en-int/' }
        ]
      }
    ]
  },
  about: {
    title: t(`O nama | ${BUSINESS.name}`, `About us | ${BUSINESS.name}`),
    seoDescription: t('Upoznajte tim koji bira, priprema i podržava svako Alderway putovanje.', 'Meet the team that selects, prepares and supports every Alderway trip.'),
    sections: [
      { id: 'hero', type: 'hero', label: 'Glavni banner', visible: true, variant: 'inner', eyebrow: t('Alderway pristup', 'The Alderway approach'), title: t('Dobro putovanje počinje dobrim vozilom', 'A good journey starts with a good vehicle'), image: '/images/brand/alderway-lifestyle.webp', imageAlt: t('Par priprema doručak uz kamper', 'A couple prepares breakfast beside a camper') },
      { id: 'story-1', type: 'split_content', label: 'Priča — pristup', visible: true, variant: 'image-right', eyebrow: t('Zašto postojimo', 'Why we exist'), title: t('Manje logistike, više putovanja', 'Less logistics, more travelling'), body: t('Alderway je nastao iz jednostavne ideje: najam kampera trebao bi biti jednako ugodan kao i samo putovanje. Zato biramo praktične rasporede, održavamo malu i raznoliku flotu te sve važne troškove pokazujemo prije rezervacije.\n\nSvako vozilo pregledavamo, čistimo i osobno pripremamo. Prije polaska prolazimo sve sustave i odgovaramo na pitanja bez žurbe.', 'Alderway began with a simple idea: hiring a camper should feel as enjoyable as the trip itself. We choose practical layouts, keep a small and varied fleet, and show every important cost before booking.\n\nEvery vehicle is inspected, cleaned and prepared by hand. Before departure, we walk you through the systems and answer questions without rushing.'), image: '/images/brand/alderway-interior.webp', imageAlt: t('Pažljivo uređen interijer kampera', 'Thoughtfully prepared camper interior') },
      { id: 'story-2', type: 'split_content', label: 'Priča — podrška', visible: true, variant: 'image-left', eyebrow: t('Način rada', 'How we work'), title: t('Stvarna podrška, prije i tijekom puta', 'Real support, before and during your trip'), body: t('Naš mali tim poznaje svako vozilo i njegove detalje. Pomažemo odabrati odgovarajući raspored, planirati kilometražu i pripremiti dodatnu opremu, a tijekom putovanja ostajemo dostupni za praktična pitanja.\n\nRezultat je jednostavan proces rezervacije i kamper u kojem se možete osjećati kao kod kuće od prvog dana.', 'Our small team knows every vehicle and its details. We help you choose the right layout, plan realistic mileage and prepare useful extras, then remain available for practical questions while you travel.\n\nThe result is a straightforward booking process and a camper that feels familiar from day one.'), image: '/images/brand/alderway-lifestyle.webp', imageAlt: t('Opušteno jutro uz kamper', 'A relaxed morning beside a camper') },
      { id: 'testimonials', type: 'testimonials', label: 'Mišljenja korisnika', visible: true, eyebrow: t('Povjerenje', 'Trust'), title: t('Mišljenja naših korisnika', 'What our customers say'), items: [
        { id: 'quote-1', body: t('Od rezervacije do povratka sve je bilo jasno. Kamper je bio besprijekorno pripremljen.', 'Everything was clear from booking to return. The camper was impeccably prepared.') },
        { id: 'quote-2', body: t('Dobili smo iskren savjet o veličini vozila i odabrali točno ono što nam je trebalo.', 'We received honest advice on vehicle size and chose exactly what we needed.') },
        { id: 'quote-3', body: t('Brz odgovor kada nam je usput zatrebala pomoć i odličan vodič prije polaska.', 'A quick answer when we needed help on the road and a great walkthrough before departure.') }
      ] },
      { id: 'cta', type: 'split_cta', label: 'Završni poziv na rezervaciju', visible: true, title: t('Kamo biste prvo otišli?', 'Where would you go first?'), body: t('Od kompaktnih kombija za dvoje do prostranih obiteljskih kampera, pronađite raspored koji odgovara vašem putovanju.', 'From compact vans for two to roomy family motorhomes, find the layout that fits your trip.'), image: '/images/brand/alderway-hero.webp', imageAlt: t('Kamper spreman za put', 'Camper ready for the road'), ctaLabel: t('Provjeri dostupnost', 'Check availability'), ctaHref: '/rezerviraj' }
    ]
  },
  contact: {
    title: t(`Kontakt | ${BUSINESS.name}`, `Contact | ${BUSINESS.name}`),
    seoDescription: t('Kontaktirajte Alderway tim za rezervacije, odabir vozila i podršku prije puta.', 'Contact the Alderway team for bookings, vehicle advice and pre-trip support.'),
    sections: [
      { id: 'contact', type: 'contact', label: 'Kontakt i obrazac', visible: true, title: t('Kontaktirajte nas', 'Contact us'), body: t('Naš tim s veseljem stoji na raspolaganju za sva Vaša pitanja.', 'Our team is happy to answer any of your questions.'), items: [
        { id: 'address', title: t('Adresa', 'Address'), body: t(BUSINESS.address, BUSINESS.address) },
        { id: 'phone', title: t('Telefon', 'Phone'), body: t(BUSINESS.phone, BUSINESS.phone), href: BUSINESS.phoneHref },
        { id: 'email', title: t('Email', 'Email'), body: t(BUSINESS.email, BUSINESS.email), href: `mailto:${BUSINESS.email}` },
        { id: 'note', title: t('Radno vrijeme', 'Opening hours'), body: t('Pon–Pet 08:00–18:00 · Sub 09:00–13:00 · Preuzimanja po dogovoru', 'Mon–Fri 08:00–18:00 · Sat 09:00–13:00 · Collections by appointment') },
        { id: 'map', title: t('Preuzimno mjesto', 'Touring hub'), body: t(`${BUSINESS.name}\n${BUSINESS.address}`, `${BUSINESS.name}\n${BUSINESS.address}`), href: BUSINESS.mapUrl }
      ] }
    ]
  },
  faq: {
    title: t(`Česta pitanja o najmu kampera | ${BUSINESS.name}`, `Camper hire questions | ${BUSINESS.name}`),
    seoDescription: t('Odgovori o rezervacijama, vozačima, pologu, osiguranju, preuzimanju i opremi.', 'Answers about bookings, drivers, deposits, insurance, collection and equipment.'),
    sections: [
      { id: 'faq', type: 'faq', label: 'Česta pitanja', visible: true, eyebrow: t('Pomoć', 'Help'), title: t('FAQ', 'FAQ'), items: [
        { id: 'booking', title: t('Kako mogu rezervirati kamper?', 'How can I book a camper?'), body: t(`Najbrže je koristiti online rezervaciju. Za pomoć pri odabiru pišite na ${BUSINESS.email}.`, `The fastest option is our online booking flow. For help choosing a vehicle, email ${BUSINESS.email}.`) },
        { id: 'documents', title: t('Koja dokumentacija je potrebna prilikom preuzimanja rezerviranog vozila?', 'What documents are required when collecting a reserved vehicle?'), body: t('Potrebna je važeća vozačka dozvola B kategorije, osobni dokument (osobna iskaznica ili putovnica) i kreditna kartica za depozit. Vozač mora imati najmanje 25 godina.', 'You need a valid category B driving licence, an identity document (ID card or passport), and a credit card for the deposit. The driver must be at least 25 years old.') },
        { id: 'cancellation', title: t('Kakva je politika otkazivanja rezervacije?', 'What is the booking cancellation policy?'), body: t('Politika otkazivanja ovisi o vrsti rezervacije i vremenu obavijesti o otkazivanju. Detalji su navedeni u uvjetima najma vozila.', 'The cancellation policy depends on the type of booking and the notice period. Details are set out in the vehicle rental terms.') },
        { id: 'border', title: t('Mogu li putovati izvan zemlje s iznajmljenim kamperom?', 'Can I travel abroad with a rented camper?'), body: t('Da, putovanje izvan zemlje obično je moguće, ali prije puta provjerite s našim osobljem moguća ograničenja i dodatne troškove.', 'Yes, travel abroad is usually possible, but please check possible restrictions and additional costs with our team before departure.') },
        { id: 'included', title: t('Što je uključeno u cijenu najma?', 'What is included in the rental price?'), body: t('U cijenu su uključeni 24/7 telefonska asistencija, obvezno osiguranje, kasko uz ugovoreno sudjelovanje u šteti, osiguranje putnika, kemikalije za WC, jedna plinska boca, puna čista voda, prazna prljava voda i WC kazeta, radio, crijevo, električni kabel s adapterom i nivelatori. Kilometraža je ograničena na 300 km dnevno, odnosno 900 km za vikend.', 'The price includes 24/7 telephone assistance, compulsory insurance, agreed comprehensive cover, passenger insurance, toilet chemicals, one gas bottle, fresh water, an empty waste-water tank and toilet cassette, radio, hose, power cable and adapter, and levellers. Mileage is limited to 300 km per day or 900 km for a weekend.') },
        { id: 'hidden-costs', title: t('Postoje li skriveni troškovi?', 'Are there hidden costs?'), body: t('Ne. Svi troškovi u ponudi ili potvrdi su konačni. Dodatni troškovi mogu nastati samo ako promijenite rezervaciju ili u slučaju štete, nedostatka goriva, cestarina ili prekoračene kilometraže. Dodatni kilometar naplaćuje se 0,30 EUR/km.', 'No. All costs shown in your quote or confirmation are final. Additional costs may arise only if you change the booking or in the event of damage, missing fuel, tolls or excess mileage. Excess mileage is charged at EUR 0.30/km.') },
        { id: 'one-way', title: t('Mogu li preuzeti kamper na jednom mjestu i vratiti ga na drugo?', 'Can I collect the camper in one place and return it in another?'), body: t('Naravno. Najam možete završiti na drugom mjestu od mjesta preuzimanja. Za različita mjesta preuzimanja i vraćanja naplaćuje se naknada za transfer.', 'Of course. You can finish your rental at a different location from collection. A transfer fee applies when collection and return locations differ.') },
        { id: 'airport-transfer', title: t('Nudite li dostavu vozila?', 'Do you offer vehicle delivery?'), body: t('Da, za odabrane lokacije i uz prethodni dogovor. Dostupne opcije i naknade prikazuju se u rezervaciji.', 'Yes, to selected locations by prior arrangement. Available options and fees are shown in the booking flow.') },
        { id: 'preparation-fee', title: t('Što znači trošak pripreme pri rezervaciji kampera?', 'What does the preparation fee mean?'), body: t('Trošak pripreme pokriva kompletno čišćenje kampera, kemikalije za WC, pun tank čiste vode, jednu punu plinsku bocu, set za čišćenje i AdBlue. Pri preuzimanju naše osoblje detaljno objašnjava korištenje kampera.', 'The preparation fee covers a complete camper clean, toilet chemicals, a full fresh-water tank, one full gas bottle, a cleaning set and AdBlue. At collection, our staff will explain the camper’s use in detail.') },
        { id: 'short-rental', title: t('Mogu li iznajmiti kamper na 2 dana?', 'Can I rent a camper for 2 days?'), body: t('Nažalost, ne. U visokoj sezoni minimalni najam je 10 noćenja, u srednjoj 7 noći, a u niskoj 5 noći. Za više informacija slobodno nas kontaktirajte.', 'Unfortunately not. The minimum rental is 10 nights in high season, 7 nights in mid-season and 5 nights in low season. Contact us for more information.') },
        { id: 'deposit', title: t('Plaćam li depozit prilikom preuzimanja vozila?', 'Do I pay a deposit when collecting the vehicle?'), body: t('Da. Depozit se plaća prilikom preuzimanja isključivo karticom. Zadržava se tijekom putovanja i može se koristiti za dodatne troškove pri povratku. Ako je vozilo vraćeno neoštećeno i u skladu s uvjetima najma, depozit se vraća u roku od 15 dana, ovisno o banci.', 'Yes. The deposit is paid by card only when collecting the vehicle. It is held during the trip and may cover return-related charges. If the vehicle is returned undamaged and in line with the rental terms, the deposit is returned within 15 days, depending on the bank.') },
        { id: 'travel-area', title: t('Gdje mi je dopušteno putovati?', 'Where am I allowed to travel?'), body: t('Međunarodna putovanja obično su dopuštena uz prethodnu najavu. Ograničenja i eventualne naknade potvrđujemo prije polaska.', 'International travel is normally allowed with advance notice. We confirm any restrictions or charges before departure.') }
      ] }
    ]
  }
};

export function cloneSitePageContent(content: SitePageContent): SitePageContent {
  return structuredClone(content);
}

export function localizedText(value: LocalizedText | undefined, locale: string): string {
  if (!value) return '';
  return locale === 'en' ? (value.en || value.hr) : value.hr;
}

function cleanText(value: unknown, fallback: string, maxLength: number): string {
  if (typeof value !== 'string') return fallback;
  return value.trim().slice(0, maxLength);
}

function cleanLocalized(value: unknown, fallback: LocalizedText, maxLength: number): LocalizedText {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    hr: cleanText(input.hr, fallback.hr, maxLength),
    en: cleanText(input.en, fallback.en, maxLength)
  };
}

function cleanUrl(value: unknown, fallback = ''): string {
  const url = cleanText(value, fallback, 1000);
  if (!url) return '';
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  if (/^(https?:|mailto:|tel:)/i.test(url)) return url;
  return fallback;
}

function cleanItem(value: unknown, fallback: SitePageItem, index: number): SitePageItem {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const item: SitePageItem = {
    id: cleanText(input.id, `${fallback.id || 'item'}-${index + 1}`, 80).replace(/[^a-zA-Z0-9_-]/g, '-')
  };
  if (fallback.title) item.title = cleanLocalized(input.title, fallback.title, 240);
  if (fallback.body) item.body = cleanLocalized(input.body, fallback.body, 4000);
  if (fallback.alt) item.alt = cleanLocalized(input.alt, fallback.alt, 240);
  if ('image' in fallback) item.image = cleanUrl(input.image, fallback.image);
  if ('href' in fallback) item.href = cleanUrl(input.href, fallback.href);
  if ('value' in fallback) item.value = Math.max(0, Math.min(1_000_000, Number(input.value ?? fallback.value) || 0));
  if ('suffix' in fallback) item.suffix = cleanText(input.suffix, fallback.suffix ?? '', 12);
  if ('icon' in fallback) item.icon = ['card', 'pin', 'star'].includes(String(input.icon)) ? input.icon as SitePageItem['icon'] : fallback.icon;
  if ('filter' in fallback) item.filter = cleanText(input.filter, fallback.filter ?? '', 80);
  return item;
}

function cleanSection(value: unknown, fallback: SitePageSection): SitePageSection {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const section: SitePageSection = {
    id: fallback.id,
    type: fallback.type,
    label: fallback.label,
    visible: input.visible !== false,
    variant: fallback.variant
  };
  if (fallback.eyebrow) section.eyebrow = cleanLocalized(input.eyebrow, fallback.eyebrow, 240);
  if (fallback.title) section.title = cleanLocalized(input.title, fallback.title, 500);
  if (fallback.body) section.body = cleanLocalized(input.body, fallback.body, 8000);
  if (fallback.image !== undefined) section.image = cleanUrl(input.image, fallback.image);
  if (fallback.imageAlt) section.imageAlt = cleanLocalized(input.imageAlt, fallback.imageAlt, 240);
  if (fallback.ctaLabel) section.ctaLabel = cleanLocalized(input.ctaLabel, fallback.ctaLabel, 120);
  if (fallback.ctaHref !== undefined) section.ctaHref = cleanUrl(input.ctaHref, fallback.ctaHref);
  if (fallback.items) {
    const submitted = Array.isArray(input.items) ? input.items.slice(0, 50) : fallback.items;
    const template = fallback.items[0];
    const usedItemIds = new Set<string>();
    section.items = template
      ? submitted.map((item, index) => {
          const cleaned = cleanItem(item, fallback.items?.find((candidate) => candidate.id === (item as Record<string, unknown>)?.id) ?? template, index);
          const baseId = cleaned.id || `item-${index + 1}`;
          let uniqueId = baseId;
          let suffix = 2;
          while (usedItemIds.has(uniqueId)) uniqueId = `${baseId}-${suffix++}`;
          usedItemIds.add(uniqueId);
          return { ...cleaned, id: uniqueId };
        })
      : [];
  }
  return section;
}

export function sanitizeSitePageContent(pageKey: SitePageKey, value: unknown): SitePageContent {
  const fallback = DEFAULT_SITE_PAGES[pageKey];
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const submittedSections = Array.isArray(input.sections) ? input.sections : [];
  const allowedById = new Map(fallback.sections.map((section) => [section.id, section]));
  const sections: SitePageSection[] = [];
  const seen = new Set<string>();

  for (const rawSection of submittedSections) {
    const id = rawSection && typeof rawSection === 'object' ? String((rawSection as Record<string, unknown>).id ?? '') : '';
    const template = allowedById.get(id);
    if (!template || seen.has(id)) continue;
    sections.push(cleanSection(rawSection, template));
    seen.add(id);
  }
  for (const section of fallback.sections) {
    if (!seen.has(section.id)) sections.push(cloneSitePageContent({ title: t('', ''), seoDescription: t('', ''), sections: [section] }).sections[0]);
  }

  return {
    title: cleanLocalized(input.title, fallback.title, 240),
    seoDescription: cleanLocalized(input.seoDescription, fallback.seoDescription, 500),
    sections
  };
}

export function isSitePageKey(value: string): value is SitePageKey {
  return Object.prototype.hasOwnProperty.call(SITE_PAGE_DEFINITIONS, value);
}
