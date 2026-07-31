import {
  goneLegacyProductSlugs,
  legacyProductAliases
} from '$lib/legacy-product-decisions.generated';

export type LegacyRedirectDecision = {
  status: 308;
  target: string;
  locale?: 'en';
  preserveSearch?: boolean;
} | {
  status: 410;
  reason: 'removed_content' | 'removed_product' | 'removed_vehicle';
};

export const CURRENT_PUBLIC_PATHS = new Set([
  '/', '/faq', '/kontakt', '/moj-racun', '/novosti', '/o-nama', '/placanje-dostava',
  '/privatnost', '/reklamacije-povrat', '/rezerviraj', '/shop', '/uvjeti-najma', '/vozila',
  '/vozila/najam-kampera', '/vozila/vozila-za-filmske-produkcije', '/vozila/vozila-za-prodaju'
]);

const exactCroatianRedirects: Readonly<Record<string, string>> = {
  '/webshop/rezerviraj': '/rezerviraj',
  '/cookie-policy-eu': '/privatnost',
  '/faqs': '/faq',
  '/kosarica-2': '/kosarica',
  '/naplata': '/checkout',
  '/placanje-i-dostava': '/placanje-dostava',
  '/privatnost-i-uvjeti-poslovanja': '/privatnost',
  '/reklamacije-i-povrat': '/reklamacije-povrat',
  '/search-availability': '/rezerviraj',
  '/search-results': '/rezerviraj',
  '/priprema-kampera-za-zimu': '/novosti/priprema-kampera-za-zimu',
  '/priprema-kamp-prikolice-za-zimski-san': '/novosti/priprema-kamp-prikolice-za-zimu',
  '/camping-center-petroni-postao-ovlasteni-servis-za-alde-grijanje-u-hrvatskoj': '/novosti/camping-center-petroni-alde-servis',
  '/klima-uredaj-plein-aircon-12v': '/novosti/klima-uredaj-plein-aircon-12v',
  '/camper-trolley-za-jednostavno-manevriranje-sa-prikolicama': '/novosti/camper-trolley'
};

const exactEnglishRedirects: Readonly<Record<string, string>> = {
  '/': '/',
  '/about': '/o-nama',
  '/book-now': '/rezerviraj',
  '/cart': '/kosarica',
  '/checkout': '/checkout',
  '/contact-2': '/kontakt',
  '/cookie-policy-eu': '/privatnost',
  '/faqs': '/faq',
  '/my-account': '/moj-racun',
  '/news': '/novosti',
  '/payment-and-delivery': '/placanje-dostava',
  '/privacy-policy-terms-of-service': '/privatnost',
  '/rental-terms-and-conditions': '/uvjeti-najma',
  '/returns-and-refunds': '/reklamacije-povrat',
  '/search-results': '/rezerviraj',
  '/shop': '/shop',
  '/vehicles': '/vozila',
  '/vehicles/movie-production-vehicles': '/vozila/vozila-za-filmske-produkcije',
  '/vehicles/vehicles-for-rent': '/vozila/najam-kampera',
  '/vehicles/vehicles-for-rent-2': '/vozila/najam-kampera',
  '/vehicles/vehicles-for-sale': '/vozila/vozila-za-prodaju',
  '/air-conditioning-unit-plein-aircon-12v': '/novosti/klima-uredaj-plein-aircon-12v'
};

const goneContentPaths = new Set([
  '/cookie-policy-eu-old',
  '/eurowagon-prikolice',
  '/katalog-reimo-2023',
  '/megamobil-slovenska-bistrica',
  '/order-received/thank-you',
  '/prozori-za-kamp-vozila-carbest',
  '/putopis-crna-gora',
  '/putopis-kamperom-preko-alpi',
  '/toaletna-tekucina-solbio-original',
  '/uvjeti-i-odredbe-nagradne-igre',
  '/weinsberg-caracito',
  '/zasto-su-kamperi-i-kampiranje-nesto-fenomenalno'
]);

const vehicleTargets: Readonly<Record<string, string>> = {
  'budgetvan-55': 'budget-van-55',
  'caratour-ford-600mq': 'caratour-ford-600mq',
  'caravans-international-horon-79m': 'ci-horon-79m',
  'citroen-unitvan': 'citroen-unitvan',
  'costume-truck-renault-master-box': 'costume-truck-renault-master',
  'gully-sucker-iveco-daily-35c15': 'gully-sucker-iveco-daily-35c15',
  'honeywagon-prikolica-wc-vacum-jet-11': 'honeywagon-vacum-jet-1',
  'honeywagon-trailer-wc-vacum-jet-11': 'honeywagon-vacum-jet-1',
  'honeywagon-wc-prikolica-vacum-jet-211': 'honeywagon-vacum-jet-2',
  'honeywagon-wc-trailer-vacum-jet-211': 'honeywagon-vacum-jet-2',
  'kamion-eurocargo-75e15-taillift-grip-electric': 'kamion-eurocargo-75e15',
  'knaus-boxdrive-680me': 'knaus-boxdrive-680me',
  'make-up-truck-21-radna-mjesta-peugeot-boxer': 'make-up-truck-peugeot-boxer',
  'make-up-truck-21-work-stations-peugeot-boxer': 'make-up-truck-peugeot-boxer',
  'make-up-van-iveco-daily-irisbus': 'make-up-van-iveco-daily-irisbus',
  'mclouis-mc4-873': 'mclouis-mc4-873',
  'petrovan-53-4x4': 'petrovan-53-4x4',
  'rimor-evo-sound': 'rimor-evo-sound',
  'rimor-kilig-50': 'rimor-kilig-50',
  'roller-team-kronos-277m': 'roller-team-kronos-277m',
  'tegljac-lamboo-iveco-daily-35c18-be-kat': 'tegljac-lamboo-iveco-daily',
  'truck-eurocargo-75e15-taillift-grip-electric': 'kamion-eurocargo-75e15',
  'weisberg-caraone-550uk': 'weinsberg-caraone-550uk',
  'wenisberg-caraone-550qdk': 'weinsberg-caraone-550qdk',
  'weinsberg-caracompact-suite-640meg-edition-pepper': 'weinsberg-caracompact-suite-640meq'
};

const goneVehicleSlugs = new Set([
  'benimar-mileo-263',
  'caravans-international-elliot-86xt-170ks',
  'motor-home-petromax-50-green-room',
  'roller-team-kronos-279m',
  'weinsberg-caraone-450fu',
  'xgo-dynamic-35'
]);

const categoryTargets: Readonly<Record<string, string>> = {
  'uncategorized': '',
  'akcija': 'akcija',
  'sale': 'akcija',
  'awning-and-other': 'tende-i-dodaci',
  'awning': 'tende-i-dodaci-tende',
  'awning-parts': 'tende-i-dodaci-dodaci',
  'predsator': 'tende-i-dodaci-predsator',
  'caravan-tehnology': 'karavan-tehnologija-oprema',
  'dodatni-retrovizori': 'karavan-tehnologija-oprema-dodatni-retrovizori',
  'prekrivke-zastitne': 'karavan-tehnologija-oprema-prekrivke-zastitne',
  'smart-mover': 'karavan-tehnologija-oprema-smart-mover',
  'cooling-climate-heating': 'hladenje-grijanje',
  'air-condition': 'hladenje-grijanje-klima-uredaji',
  'grijanje': 'hladenje-grijanje-grijanje',
  'hladnjaci-2': 'hladenje-grijanje-hladnjaci',
  'truma-2': 'hladenje-grijanje-truma',
  'ventilacija-cooling-climate-heating': 'hladenje-grijanje-ventilacija',
  'chemicals-and-liquids': 'kemikalije-sredstva',
  'electrical': 'elektrika',
  'electricity': 'elektrika',
  'battery': 'elektrika-baterije-akumulatori',
  'batteries-accumulators': 'elektrika-baterije-akumulatori',
  'cables': 'elektrika-kablovi',
  'inverter': 'elektrika-inverteri',
  'inverters': 'elektrika-inverteri',
  'kablovi': 'elektrika-kablovi',
  'kupaona-kuhinja': 'elektrika-kupaona-kuhinja',
  'osiguraci-2': 'elektrika-osiguraci',
  'punjaci-baterija': 'elektrika-punjaci-baterija',
  'rasvjeta-2': 'elektrika-rasvjeta',
  'solarni-sustavi-2': 'elektrika-solarni-sustavi',
  'svjetlosna-signalizacija-electrical': 'elektrika-svjetlosna-signalizacija',
  'uticnice-prekidaci': 'elektrika-uticnice-prekidaci',
  'gas-tehnology': 'plinska-tehnologija-oprema',
  'plinske-boce': 'plinska-tehnologija-oprema-boce-za-plin',
  'regulatori-plin': 'plinska-tehnologija-oprema-regulatori-za-plin',
  'gume-oprema': 'gume-oprema',
  'household-kitchen': 'kucanstvo-kuhinja',
  'posude-household-kitchen': 'kucanstvo-kuhinja-posude',
  'stednjaci': 'kucanstvo-kuhinja-stednjaci',
  'motorhome-tehnology': 'motorhome-tehnologija-oprema',
  'nosaci-za-bicikle-motorhome-tehnology': 'motorhome-tehnologija-oprema-nosaci-za-bicikle',
  'okretne-konzole': 'motorhome-tehnologija-oprema-okretne-konzole',
  'retrovizori-motorhome-tehnology': 'motorhome-tehnologija-oprema-retrovizori',
  'termozastita': 'motorhome-tehnologija-oprema-termozastite',
  'multimedia-2': 'multimedija',
  'kamere-za-voznju-unatrag': 'multimedija-kamere-za-voznju-unatrag',
  'televizori-i-oprema': 'multimedija-televizori-i-oprema',
  'outdoor-leisure': 'oprema-za-van',
  'security': 'sigurnost',
  'water-sanitary': 'voda-sanitarije',
  'grijaci-vode': 'voda-sanitarije-grijaci-vode',
  'wc-i-dodaci': 'voda-sanitarije-kemijski-wc-i-dodaci',
  'pipe-mjesalice': 'voda-sanitarije-pipe-mjesalice',
  'pumpe-za-vodu-water-sanitary': 'voda-sanitarije-pumpe-za-vodu',
  'spremnici-za-vodu': 'voda-sanitarije-spremnici-za-vodu',
  'umivaonik-sudoper-kada': 'voda-sanitarije-umivaonik-sudoper-kada',
  'windows': 'prozori',
  'podizaci-drzaci': 'prozori-podizaci-drzaci',
  'roof-window': 'prozori-krovni-prozori',
  'side-window': 'prozori-bocni-prozori',
  'rolo-zavjese-i-okviri': 'prozori-rolo-zavjese-okviri',
  'staklo': 'prozori-staklo-prozora',
  'camping-furniture': 'kamping-namjestaj-dijelovi',
  'brave-rucke': 'kamping-namjestaj-dijelovi-brave-rucke',
  'brtvila-profili': 'kamping-namjestaj-dijelovi-brtvila-profili',
  'madraci-kreveti': 'kamping-namjestaj-dijelovi-madraci-kreveti',
  'obloge-izolacije': 'kamping-namjestaj-dijelovi-obloge-izolacije',
  'obloge-izolacije-en-2': 'kamping-namjestaj-dijelovi-obloge-izolacije',
  'panti': 'kamping-namjestaj-dijelovi-panti',
  'sperploce-paneli': 'kamping-namjestaj-dijelovi-sperploce-paneli',
  'stepenice-camping-furniture': 'kamping-namjestaj-dijelovi-stepenice-ulazne',
  'vrata-camping-furniture': 'kamping-namjestaj-dijelovi-vrata'
};

function normalizePath(pathname: string) {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '') || '/';
}

function stripEnglishSuffix(segment: string) {
  return segment.endsWith('-en') ? segment.slice(0, -3) : segment;
}

function redirect(target: string, locale?: 'en', preserveSearch = true): LegacyRedirectDecision {
  return { status: 308, target, ...(locale ? { locale } : {}), preserveSearch };
}

export function legacyRedirectDecision(pathname: string, searchParams = new URLSearchParams()): LegacyRedirectDecision | undefined {
  const normalizedPath = normalizePath(pathname);
  const english = normalizedPath === '/en' || normalizedPath.startsWith('/en/');
  const localizedPath = english ? normalizePath(normalizedPath.slice(3) || '/') : normalizedPath;
  const locale = english ? 'en' : undefined;

  if ((localizedPath === '/' || localizedPath === '/shop') && searchParams.get('taxonomy') === 'product_shipping_class') {
    return redirect('/shop', locale, false);
  }

  const exactTarget = english
    ? exactEnglishRedirects[localizedPath]
    : exactCroatianRedirects[localizedPath];
  if (exactTarget && (exactTarget !== normalizedPath || locale)) return redirect(exactTarget, locale);

  if (goneContentPaths.has(localizedPath)) return { status: 410, reason: 'removed_content' };

  const productMatch = localizedPath.match(english
    ? /^\/(?:product|proizvod)\/([^/]+)$/
    : /^\/proizvod\/([^/]+)$/);
  if (productMatch) {
    const oldSlug = productMatch[1];
    if (goneLegacyProductSlugs.has(oldSlug)) return { status: 410, reason: 'removed_product' };
    return redirect(`/product/${legacyProductAliases[oldSlug] ?? oldSlug}`, locale);
  }

  const categoryMatch = localizedPath.match(/^\/product-category\/(.+)$/);
  if (categoryMatch) {
    const lastSegment = categoryMatch[1].split('/').filter(Boolean).at(-1);
    if (!lastSegment) return redirect('/shop', locale);
    const normalizedSegment = stripEnglishSuffix(lastSegment);
    const category = categoryTargets[lastSegment] ?? categoryTargets[normalizedSegment];
    if (category !== undefined) return redirect(category ? `/shop/${category}` : '/shop', locale);
  }

  const vehicleMatch = localizedPath.match(/^\/vehicle\/([^/]+)$/);
  if (vehicleMatch) {
    const oldSlug = vehicleMatch[1];
    if (goneVehicleSlugs.has(oldSlug)) return { status: 410, reason: 'removed_vehicle' };
    const target = vehicleTargets[oldSlug];
    if (target) return redirect(`/vozila/${target}`, locale);
  }

  const oldAppVehicle = normalizedPath.match(/^\/vozila\/najam-kampera\/([^/]+)$/);
  if (oldAppVehicle) return redirect(`/vozila/${oldAppVehicle[1]}`);

  if (localizedPath.startsWith('/category/') || localizedPath.startsWith('/author/')) {
    return redirect('/novosti', locale);
  }

  const vehicleCategory = localizedPath.match(/^\/categori\/([^/]+)$/)?.[1];
  if (vehicleCategory) {
    const category = stripEnglishSuffix(vehicleCategory);
    if (category.includes('filmske-produkcije')) return redirect('/vozila/vozila-za-filmske-produkcije', locale);
    if (category.includes('prodaju') || category === 'za-naslovnu-za-prodaju') return redirect('/vozila/vozila-za-prodaju', locale);
    if (category === 'za-naslovnu') return redirect('/vozila', locale);
    return redirect('/vozila/najam-kampera', locale);
  }

  if (localizedPath.startsWith('/crbs_vehicle_c/')) return redirect('/vozila/najam-kampera', locale);

  return undefined;
}

export function legacyRedirectTarget(pathname: string, searchParams = new URLSearchParams()) {
  const decision = legacyRedirectDecision(pathname, searchParams);
  return decision?.status === 308 ? decision.target : undefined;
}
