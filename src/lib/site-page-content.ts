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
    title: t('Petroni — Najam i prodaja kampera i karavana', 'Petroni — Camper and caravan rental and sales'),
    seoDescription: t(
      'Petroni – najam i prodaja vrhunskih kampera i karavana. 19 godina iskustva, 20+ vozila, lokacije diljem Hrvatske i Europe.',
      'Petroni camper and caravan rental and sales. 19 years of experience, 20+ vehicles and locations across Croatia and Europe.'
    ),
    sections: [
      {
        id: 'hero', type: 'hero', label: 'Glavni banner', visible: true, variant: 'home',
        title: t('Putujte bez granica,\nživite bez ograničenja.', 'Travel without borders,\nlive without limits.'),
        body: t('Otkrijte slobodu ceste s vrhunskim kamperima i karavanima. Vaša avantura počinje ovdje.', 'Discover the freedom of the road with premium campers and caravans. Your adventure starts here.'),
        image: 'https://www.petroni.hr/wp-content/uploads/2025/02/hero-image-petroni-camping-and-caravaning-rental10-1.jpg',
        imageAlt: t('Petroni kamper na putovanju', 'Petroni camper on the road'),
        ctaLabel: t('Rezerviraj', 'Book now'), ctaHref: '/rezerviraj'
      },
      {
        id: 'rentals', type: 'vehicle_grid', label: 'Vozila za najam', visible: true, variant: 'rental',
        eyebrow: t('Prihvatite izazov, doživite avanturu', 'Embrace the challenge, experience the adventure'),
        title: t('Naša vozila', 'Our vehicles'),
        body: t('Zanima Vas više?', 'Want to see more?'),
        ctaLabel: t('Pogledajte sva vozila u našoj ponudi.', 'Browse all vehicles in our offer.'), ctaHref: '/vozila/najam-kampera'
      },
      {
        id: 'partners', type: 'logo_grid', label: 'Partneri', visible: true,
        items: [
          { id: 'udruga-kampista', title: t('Udruga Kampista Hrvatske', 'Croatian Campers Association'), image: '/partners/logos/udruga-kampista.png', href: 'https://udrugakampista.hr/' },
          { id: 'polidor', title: t('Polidor Camping Resort', 'Polidor Camping Resort'), image: '/partners/logos/polidor.png', href: 'https://www.campingpolidor.com/' },
          { id: 'jadranka', title: t('Jadranka Camping — Cres & Lošinj', 'Jadranka Camping — Cres & Lošinj'), image: 'https://www.camps-cres-losinj.com/assets/images/interface/logo.svg', href: 'https://www.camps-cres-losinj.com/' },
          { id: 'plitvice', title: t('Camping Plitvice', 'Camping Plitvice'), image: 'https://campingplitvice.hr/wp-content/uploads/2019/08/campingplitvice_logo.png', href: 'https://campingplitvice.hr/' },
          { id: 'amadria', title: t('Amadria Park Camping Šibenik', 'Amadria Park Camping Šibenik'), image: 'https://www.amcham.hr/storage/upload/gen_blog/amadria_park_logo-500x400_9557.jpg', href: 'https://www.amadriapark.com/hr/sibenik/camping/' },
          { id: 'camping-hr', title: t('Kamping udruženje Hrvatske', 'Croatian Camping Union'), image: '/partners/logos/kamping-udruzenje.jpg', href: 'https://www.camping.hr/hr' }
        ]
      },
      {
        id: 'sales', type: 'vehicle_grid', label: 'Vozila za prodaju', visible: true, variant: 'sale',
        eyebrow: t('Tražite vlastitog ljubimca na 4 kotača?', 'Looking for your own home on wheels?'),
        title: t('Vozila za prodaju', 'Vehicles for sale'),
        body: t('Zanima Vas više?', 'Want to see more?'),
        ctaLabel: t('Pogledajte sva vozila za prodaju.', 'See all vehicles for sale.'), ctaHref: '/vozila/vozila-za-prodaju'
      },
      {
        id: 'advantages', type: 'feature_grid', label: 'Glavne prednosti', visible: true,
        eyebrow: t('Putujte s nama', 'Travel with us'), title: t('Glavne prednosti', 'Key advantages'),
        items: [
          { id: 'transparent', icon: 'card', title: t('Bez skrivenih troškova', 'No hidden costs'), body: t('Kod nas uvijek unaprijed znate konačnu cijenu usluge, bez neugodnih iznenađenja i dodatnih naknada.', 'You always know the final price upfront — no surprises or extra fees.') },
          { id: 'locations', icon: 'pin', title: t('Diljem Hrvatske i Europe', 'Across Croatia & Europe'), body: t('Vozilo možete preuzeti ili vratiti na više unaprijed dogovorenih lokacija diljem čitave Hrvatske i Europe.', 'Pick up or return your vehicle at agreed locations across Croatia and Europe.') },
          { id: 'support', icon: 'star', title: t('100% zadovoljstvo', '100% satisfaction'), body: t('Naš je cilj da svako Vaše putovanje protekne sigurno i ugodno, uz potpunu podršku našeg tima.', 'Our goal is for every trip to be safe and pleasant, with full support from our team.') }
        ]
      },
      {
        id: 'gallery', type: 'image_strip', label: 'Galerija', visible: true,
        items: [
          { id: 'gallery-1', image: 'https://www.petroni.hr/wp-content/uploads/2025/02/hero-image-petroni-camping-and-caravaning-rental10-1.jpg', alt: t('Petroni putovanje', 'Petroni journey') },
          { id: 'gallery-2', image: '/images/vehicles/ci-horon-79m/01-horon-79-1.webp', alt: t('CI Horon kamper', 'CI Horon camper') },
          { id: 'gallery-3', image: '/images/vehicles/roller-team-kronos-277m/01-izvana.webp', alt: t('Roller Team Kronos kamper', 'Roller Team Kronos camper') },
          { id: 'gallery-4', image: '/images/vehicles/rimor-evo-sound/01-rimor-evo-1.webp', alt: t('Rimor EVO Sound kamper', 'Rimor EVO Sound camper') },
          { id: 'gallery-5', image: 'https://www.petroni.hr/wp-content/uploads/2025/02/DSC_1792.jpg', alt: t('Kamping iskustvo', 'Camping experience') },
          { id: 'gallery-6', image: 'https://www.petroni.hr/wp-content/uploads/2025/02/DSC_1684.jpg', alt: t('Putovanje kamperom', 'Camper journey') }
        ]
      },
      {
        id: 'stats', type: 'stats', label: 'Brojke', visible: true,
        items: [
          { id: 'users', value: 546, suffix: '', title: t('Zadovoljnih korisnika', 'Satisfied customers') },
          { id: 'years', value: 19, suffix: '', title: t('Godina putovanja', 'Years of travel') },
          { id: 'vehicles', value: 20, suffix: '+', title: t('Raspoloživih vozila', 'Available vehicles') }
        ]
      },
      {
        id: 'brands', type: 'logo_marquee', label: 'Brendovi vozila i opreme', visible: true,
        items: [
          { id: 'rimor', title: t('RIMOR', 'RIMOR'), image: '/partners/logos/rimor.svg', href: 'https://www.rimor.it/it/en' },
          { id: 'caravans-international', title: t('CARAVANS INT.', 'CARAVANS INT.'), image: '/partners/logos/caravans-international.svg', href: 'https://www.caravansinternational.it/fr/' },
          { id: 'mega-mobil', title: t('MEGA MOBIL', 'MEGA MOBIL'), image: '/partners/logos/mega-mobil.png', href: 'https://megamobil.si/en/' },
          { id: 'thetford', title: t('THETFORD', 'THETFORD'), image: '/partners/logos/thetford.png', href: 'https://www.thetford.com/' },
          { id: 'knaus', title: t('KNAUS', 'KNAUS'), image: '/partners/logos/knaus.png', href: 'https://www.knaus.com/en-int/' },
          { id: 'roller-team', title: t('ROLLER TEAM', 'ROLLER TEAM'), image: '/partners/logos/roller-team.svg', href: 'https://www.rollerteam.it/' },
          { id: 'truma', title: t('TRUMA', 'TRUMA'), image: '/partners/logos/truma.svg', href: 'https://www.truma.com/', filter: 'invert(1)' },
          { id: 'weinsberg', title: t('WEINSBERG', 'WEINSBERG'), image: '/partners/logos/weinsberg.png', href: 'https://weinsberg.com/en-int/' }
        ]
      }
    ]
  },
  about: {
    title: t('O Petroniju – iskustvo za vaš put kamperom | Petroni', 'About Petroni – experience for your camper journey | Petroni'),
    seoDescription: t('Upoznajte Petroni, obiteljski tim s dugogodišnjim iskustvom u najmu i prodaji kampera, karavana i kamping opreme.', 'Meet Petroni, a family team with long-standing experience in camper and caravan rental, sales and camping equipment.'),
    sections: [
      { id: 'hero', type: 'hero', label: 'Glavni banner', visible: true, variant: 'inner', eyebrow: t('Upoznajte nas', 'Get to know us'), title: t('O nama', 'About us'), image: '/images/about/onama3.webp', imageAlt: t('Moni s gostima uz Petroni kamper', 'Moni with guests beside a Petroni camper') },
      { id: 'story-1', type: 'split_content', label: 'Priča — obiteljska tradicija', visible: true, variant: 'image-right', eyebrow: t('Tko smo', 'Who we are'), title: t('Obiteljska tradicija', 'A family tradition'), body: t('Petroni d.o.o. hrvatska je tvrtka specijalizirana za najam i prodaju kampera, karavana i opreme za kamping. S više od 19 godina iskustva, mi smo Vaš pouzdani partner za sva kamping putovanja.\n\nNaša misija je pružiti Vam slobodu ceste uz maksimalnu udobnost i sigurnost. Svako naše vozilo prolazi strog tehnički pregled prije iznajmljivanja.', 'Petroni d.o.o. is a Croatian company specialised in the rental and sale of campers, caravans and camping equipment. With over 19 years of experience, we are your reliable partner for every camping trip.\n\nOur mission is to give you the freedom of the road with maximum comfort and safety. Every vehicle undergoes a strict technical inspection before rental.'), image: '/images/about/onama1.webp', imageAlt: t('Moni i gošća uživaju uz Petroni kamper', 'Moni and a guest beside a Petroni camper') },
      { id: 'story-2', type: 'split_content', label: 'Priča — iskustvo', visible: true, variant: 'image-left', eyebrow: t('Naše iskustvo', 'Our experience'), title: t('19 godina putovanja', '19 years of travelling'), body: t('Kroz godine smo izgradili povjerenje stotina zadovoljnih korisnika. Osim najma, nudimo i kompletan asortiman kamping opreme u našem online shopu — od elektrike i plinske opreme do namještaja i sanitarija. Naš tim stoji Vam na raspolaganju za savjet i podršku tijekom cijelog putovanja.', 'Over the years we have earned the trust of hundreds of satisfied customers. Besides rentals, we offer a complete range of camping equipment in our online shop — from electrical and gas equipment to furniture and sanitary products. Our team is available for advice and support throughout your trip.'), image: '/images/about/onama2.webp', imageAlt: t('Moni uz Petroni kamper', 'Moni beside a Petroni camper') },
      { id: 'testimonials', type: 'testimonials', label: 'Mišljenja korisnika', visible: true, eyebrow: t('Povjerenje', 'Trust'), title: t('Mišljenja naših korisnika', 'What our customers say'), items: [
        { id: 'quote-1', body: t('Vrhunsko iskustvo od prvog kontakta do povratka kampera. Sve preporuke!', 'A top experience from first contact to returning the camper. Highly recommended!') },
        { id: 'quote-2', body: t('Profesionalan tim i besprijekorno održavano vozilo. Putovanje za pamćenje.', 'Professional team and an impeccably maintained vehicle. A trip to remember.') },
        { id: 'quote-3', body: t('Najam je bio jednostavan, a podrška dostupna u svakom trenutku. Hvala!', 'Renting was simple and support was available at all times. Thank you!') }
      ] },
      { id: 'cta', type: 'split_cta', label: 'Završni poziv na rezervaciju', visible: true, title: t('S kamperom nema žurbe', 'No rush with a camper'), body: t('Otkrijte slobodu putovanja bez rasporeda i ograničenja. Bilo da planirate vikend izlet ili dugo putovanje Europom — mi smo tu da Vaše putovanje učinimo bezbrižnim.', 'Discover the freedom of travelling without a schedule or limits. Whether you are planning a weekend getaway or a long journey across Europe — we are here to make your trip carefree.'), image: '/images/vehicles/rimor-evo-sound/05-eso-11.webp', imageAlt: t('Petroni Rimor EVO Sound kamper', 'Petroni Rimor EVO Sound camper'), ctaLabel: t('Rezerviraj', 'Book now'), ctaHref: '/rezerviraj' }
    ]
  },
  contact: {
    title: t('Kontakt za najam kampera, prodaju i shop | Petroni', 'Contact for camper rental, sales and shop | Petroni'),
    seoDescription: t('Kontaktirajte Petroni za najam kampera, prodaju vozila, shop narudžbe i podršku. Adresa, telefon i email na jednom mjestu.', 'Contact Petroni for camper rental, vehicle sales, shop orders and support. Address, phone and email in one place.'),
    sections: [
      { id: 'contact', type: 'contact', label: 'Kontakt i obrazac', visible: true, title: t('Kontaktirajte nas', 'Contact us'), body: t('Naš tim s veseljem stoji na raspolaganju za sva Vaša pitanja.', 'Our team is happy to answer any of your questions.'), items: [
        { id: 'address', title: t('Adresa', 'Address'), body: t('Slavka Tomerlina 9, 10380 Sesvete, Zagreb', 'Slavka Tomerlina 9, 10380 Sesvete, Zagreb') },
        { id: 'phone', title: t('Telefon', 'Phone'), body: t('+385912427247', '+385912427247'), href: 'tel:+385912427247' },
        { id: 'email', title: t('Email', 'Email'), body: t('info@petroni.hr', 'info@petroni.hr'), href: 'mailto:info@petroni.hr' },
        { id: 'note', title: t('Napomena', 'Note'), body: t('Molimo Vas da nas za sve upite kontaktirate isključivo putem e-maila ili telefonskim pozivom. WhatsApp poruke nisu podržane kao službeni kanal komunikacije.', 'Please contact us only by email or phone call. WhatsApp messages are not supported as an official channel.') },
        { id: 'map', title: t('Lokacija', 'Location'), body: t('Petroni d.o.o.\nSlavka Tomerlina 9, 10380 Sesvete, Zagreb', 'Petroni d.o.o.\nSlavka Tomerlina 9, 10380 Sesvete, Zagreb'), href: 'https://www.google.com/maps/search/?api=1&query=Slavka%20Tomerlina%209%2C%2010380%20Sesvete%2C%20Zagreb' }
      ] },
      { id: 'faq', type: 'faq', label: 'Česta pitanja na kontaktu', visible: true, eyebrow: t('Odgovori na sva vaša pitanja', 'Answers to all your questions'), title: t('Najčešće postavljena pitanja', 'Frequently asked questions'), items: [
        { id: 'booking', title: t('Kako mogu rezervirati kamper?', 'How can I book a camper?'), body: t('Rezervaciju možete obaviti online putem naše stranice za rezervacije u nekoliko koraka, ili nas kontaktirajte telefonom/e-mailom i rado ćemo Vam pomoći.', 'You can book online through our reservation page in a few steps, or contact us by phone/email and we will gladly help you.') },
        { id: 'included', title: t('Što je uključeno u cijenu najma?', 'What is included in the rental price?'), body: t('U cijenu najma uključena je osnovna oprema vozila, kilometraža prema dogovoru te tehnička podrška tijekom putovanja. Detalje pronađite u uvjetima najma.', 'The rental price includes the basic vehicle equipment, agreed mileage and technical support during your trip. See the rental terms for details.') },
        { id: 'short-rental', title: t('Mogu li iznajmiti kamper na 2 dana?', 'Can I rent a camper for 2 days?'), body: t('Minimalno trajanje najma ovisi o sezoni. Za kraće najmove slobodno nas kontaktirajte za dostupnost i posebne uvjete.', 'The minimum rental period depends on the season. For shorter rentals, contact us for availability and special terms.') }
      ] }
    ]
  },
  faq: {
    title: t('Česta pitanja o najmu kampera i shopu | Petroni', 'Frequently asked questions about camper rental and shop | Petroni'),
    seoDescription: t('Odgovori na najčešća pitanja o Petroni najmu kampera, uvjetima, plaćanju, dostavi, povratu proizvoda i podršci.', 'Answers to common questions about Petroni camper rental, terms, payments, delivery, returns and support.'),
    sections: [
      { id: 'faq', type: 'faq', label: 'Česta pitanja', visible: true, eyebrow: t('Pomoć', 'Help'), title: t('FAQ', 'FAQ'), items: [
        { id: 'booking', title: t('Kako mogu rezervirati kamper?', 'How can I book a camper?'), body: t('Rezervaciju možete obaviti online putem naše stranice za rezervacije u nekoliko jednostavnih koraka, ili nas kontaktirajte telefonom ili e-mailom.', 'You can book online through our reservation page in a few simple steps, or contact us by phone or email.') },
        { id: 'included', title: t('Što je uključeno u cijenu najma?', 'What is included in the rental price?'), body: t('U cijenu najma uključena je osnovna oprema vozila te tehnička podrška tijekom putovanja. Dodatnu opremu možete odabrati prilikom rezervacije.', 'The rental price includes the basic vehicle equipment and technical support during your trip. Additional extras can be selected during booking.') },
        { id: 'driver-age', title: t('Koja je minimalna starost vozača?', 'What is the minimum driver age?'), body: t('Vozač mora imati najmanje 28 godina na dan preuzimanja i posjedovati važeću vozačku dozvolu.', 'The driver must be at least 28 years old on the pickup date and hold a valid driving licence.') },
        { id: 'cancellation', title: t('Mogu li otkazati rezervaciju?', 'Can I cancel my booking?'), body: t('Uvjeti otkazivanja ovise o aktivnim uvjetima najma. Pogledajte uvjete prikazane tijekom rezervacije ili nas kontaktirajte za detalje.', 'Cancellation conditions depend on the active rental terms. See the terms shown during booking or contact us for details.') },
        { id: 'delivery', title: t('Koliko traje dostava narudžbe iz shopa?', 'How long does shop delivery take?'), body: t('Dostava unutar Hrvatske traje 2–4 radna dana, ovisno o odabranoj dostavnoj službi.', 'Delivery within Croatia takes 2–4 business days, depending on the chosen shipping option.') },
        { id: 'returns', title: t('Mogu li vratiti kupljeni proizvod?', 'Can I return a purchased product?'), body: t('Da, imate pravo na povrat proizvoda u roku od 14 dana od preuzimanja, sukladno našoj politici povrata.', 'Yes, you have the right to return a product within 14 days of receiving it, in accordance with our return policy.') },
        { id: 'payments', title: t('Koje načine plaćanja prihvaćate?', 'What payment methods do you accept?'), body: t('Dostupne načine plaćanja prikazujemo u trenutku rezervacije ili narudžbe. Kartično plaćanje ostaje nedostupno dok CorvusPay produkcijska integracija nije aktivirana.', 'Available payment methods are shown during booking or checkout. Card payment remains unavailable until the production CorvusPay integration is activated.') },
        { id: 'assistance', title: t('Je li dostupna pomoć na putu?', 'Is roadside assistance available?'), body: t('Da, uz najam dobivate kontakt za tehničku podršku i pomoć na putu.', 'Yes, your rental includes a contact for technical support and roadside assistance.') }
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
