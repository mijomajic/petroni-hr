export const LEGAL_DOCUMENT_KEYS = [
  'privacy',
  'cookies',
  'shop_terms',
  'delivery_payment',
  'returns_complaints'
] as const;

export type LegalDocumentKey = typeof LEGAL_DOCUMENT_KEYS[number];
export type LegalDocumentStatus = 'draft' | 'published' | 'archived';

export type LegalDocumentDefinition = {
  key: LegalDocumentKey;
  label: string;
  route: string;
};

export type LegalDocumentVersion = {
  id: string | null;
  document_key: LegalDocumentKey;
  version_number: number;
  version_label: string;
  status: LegalDocumentStatus;
  effective_date: string;
  title_hr: string;
  title_en: string;
  summary_hr: string;
  summary_en: string;
  content_hr: string;
  content_en: string;
  created_at: string | null;
  created_by: string | null;
  published_at: string | null;
  published_by: string | null;
  restored_from_id: string | null;
  uses_fallback?: boolean;
};

export const LEGAL_DOCUMENT_DEFINITIONS: Record<LegalDocumentKey, LegalDocumentDefinition> = {
  privacy: { key: 'privacy', label: 'Politika privatnosti', route: '/privatnost' },
  cookies: { key: 'cookies', label: 'Kolačići i pohrana preglednika', route: '/kolacici' },
  shop_terms: { key: 'shop_terms', label: 'Uvjeti poslovanja webshopa', route: '/uvjeti-poslovanja' },
  delivery_payment: { key: 'delivery_payment', label: 'Plaćanje i dostava', route: '/placanje-dostava' },
  returns_complaints: { key: 'returns_complaints', label: 'Reklamacije i povrat', route: '/reklamacije-povrat' }
};

const BASE_VERSION = {
  id: null,
  version_number: 1,
  version_label: '2026-07-31-technical-baseline',
  status: 'published' as const,
  effective_date: '2026-07-31',
  created_at: null,
  created_by: null,
  published_at: null,
  published_by: null,
  restored_from_id: null,
  uses_fallback: true
};

export const DEFAULT_LEGAL_DOCUMENTS: Record<LegalDocumentKey, LegalDocumentVersion> = {
  privacy: {
    ...BASE_VERSION,
    document_key: 'privacy',
    title_hr: 'Politika privatnosti',
    title_en: 'Privacy Policy',
    summary_hr: 'Kako Alderway prikuplja, koristi, čuva i štiti osobne podatke u najmu kampera, korisničkim računima i webshopu. Objavljena verzija primjenjuje se od navedenog datuma.',
    summary_en: 'How Alderway collects, uses, retains and protects personal data in camper rental, user accounts and the webshop. The published version applies from its stated effective date.',
    content_hr: `## Voditelj obrade i kontakt

Voditelj obrade je Alderway Campers, 18 Alder Way, Northmere, N04 R2Y6, Irska. Za pitanja, zahtjeve za pristup, ispravak, brisanje ili druga prava obratite se na hello@alderwaycampers.com ili +353 1 687 2048.

## Podaci koje obrađujemo

- Račun i prijava: ime, prezime, email, telefon, adresa i država ako su uneseni te podaci nužni za Supabase Auth sesiju. Lozinke se ne čuvaju u čitljivom obliku.
- Najam: vozilo, lokacije, datumi i vremena, putnici, kilometraža, destinacija, dodatna oprema, cijena, način plaćanja i status.
- Vozač: kontaktni podaci, datum rođenja, broj i država izdavanja vozačke dozvole te adresa.
- Webshop: kontakt i adresa, proizvodi, količine, cijene, dostava, plaćanje i status narudžbe.
- Dostupnost proizvoda: email, proizvod, jezik, vrijeme zahtjeva i evidencija slanja.
- Plaćanja, računi i prigovori: iznosi, reference, statusi i podaci potrebni za poslovnu evidenciju.
- E-suglasnost: vrijeme, IP adresa, verzija uvjeta i rezervacija. To je revizijski trag, ne jamstvo pravne provedivosti.
- Tehnički podaci i komunikacija: nužni kolačići, zapisnici, podaci o pogreškama, lokalna pohrana i sadržaj upita.

## Svrhe i pravne osnove

Podatke obrađujemo radi radnji prije ugovora i izvršenja ugovora, ispunjenja pravnih obveza, sigurnosti i sprječavanja zlouporabe, zaštite pravnih zahtjeva te odgovora na zahtjev korisnika. Marketing, analitika i neobavezni alati smiju se uvesti samo uz odgovarajuću pravnu osnovu i, kada je potrebno, prethodnu privolu.

## Primatelji i pružatelji usluga

Kada je nužno, podatke mogu obrađivati pružatelji hostinga, baze podataka, transakcijske e-pošte, kartičnog plaćanja, banke, dostavne i paketomat usluge, knjigovodstvo, pravni ili IT savjetnici i nadležna tijela. Alderway ne pohranjuje pune podatke platnih kartica.

## Međunarodni prijenosi

Pojedini tehnološki pružatelji mogu obrađivati podatke izvan EGP-a. Tada se primjenjuju dostupne zaštitne mjere pružatelja, primjerice odluke o primjerenosti ili standardne ugovorne klauzule.

## Rokovi čuvanja

Podaci se čuvaju onoliko koliko je potrebno za račun ili uslugu, računovodstvene i porezne obveze, potrošačke zahtjeve, sigurnost i moguće pravne zahtjeve. Zahtjev za obavijest o zalihi čuva se do slanja ili povlačenja. Podaci u pregledniku ostaju do završetka sesije ili brisanja od korisnika, ovisno o vrsti pohrane.

## Vaša prava

Možete zatražiti pristup, ispravak, brisanje, ograničenje, prenosivost, prigovor ili povlačenje privole kada je primjenjivo. Radi zaštite možemo zatražiti provjeru identiteta. Možete se obratiti i Irskoj komisiji za zaštitu podataka.

## Sigurnost i djeca

Primjenjujemo kontrolu pristupa, serversku provjeru cijena, sigurnosne zapise i druge razmjerne mjere. Usluga najma nije namijenjena maloljetnim vozačima, a maloljetnici ne bi trebali samostalno stvarati račun ili naručivati.

## Promjene politike

Objavljena verzija, datum početka primjene i povijest promjena vode se u zaštićenom Alderway administracijskom sustavu.`,
    content_en: `## Controller and contact

The controller is Alderway Campers, 18 Alder Way, Northmere, N04 R2Y6, Ireland. For questions or requests for access, correction, deletion or other rights, contact hello@alderwaycampers.com or +353 1 687 2048.

## Data we process

- Account and login data, rental and driver details, webshop order and delivery data, back-in-stock requests, payments, invoices, complaints and customer communications.
- Rental consent records include the time, IP address, accepted version and linked booking so the agreed terms can be reproduced with the reservation.
- Technical data includes necessary cookies, security and error logs, and browser storage used for language, cart and booking drafts.

## Purposes and legal bases

We process data for pre-contract steps and contract performance, legal obligations, service security, abuse prevention, legal claims and actions requested by the user. Marketing, analytics and optional tools may be introduced only with an appropriate legal basis and prior consent where required.

## Recipients, transfers and retention

Where necessary, data may be processed by hosting, database, transactional email, hosted card-payment, banking, courier and parcel-locker providers, as well as accounting, legal or IT advisers and public authorities. Alderway does not store full card details. Some providers may process data outside the EEA using available safeguards. Data is retained only as long as needed for the service, legal duties, security and claims.

## Your rights

You may request access, correction, deletion, restriction, portability, objection or withdrawal of consent where applicable. Identity verification may be required. You may also contact the Irish Data Protection Commission.

## Changes

The published version, effective date and change history are maintained in the protected Alderway administration system.`
  },
  cookies: {
    ...BASE_VERSION,
    document_key: 'cookies',
    title_hr: 'Kolačići i pohrana preglednika',
    title_en: 'Cookies and Browser Storage',
    summary_hr: 'Popis tehnički nužnih kolačića i podataka koje Alderway aplikacija čuva u pregledniku. Trenutačno nema analitičkih ni marketinških kolačića.',
    summary_en: 'An inventory of technically necessary cookies and browser storage used by Alderway. There are currently no analytics or advertising cookies.',
    content_hr: `## Što se trenutačno koristi

- Supabase Auth postavlja nužne sesijske kolačiće za prijavu i zaštitu korisničkih i administratorskih računa.
- Kratkotrajni HttpOnly kolačići koriste se samo tijekom sigurnog postupka oporavka lozinke.
- Lokalna pohrana čuva jezik sučelja i sadržaj košarice dok ih korisnik ili preglednik ne izbriše.
- Sesijska pohrana čuva nacrt rezervacije i kratkotrajni rezultat narudžbe ili rezervacije do zatvaranja kartice preglednika.

## Analitika i marketing

Alderway trenutačno ne učitava Google Analytics, marketinške piksele ni oglasne kolačiće. Za nužne funkcije ne prikazuje se obmanjujući banner za privolu. Ako se uvede neobavezna analitika ili marketing, ti se alati ne smiju učitati prije odgovarajućeg izbora korisnika.

## Vanjske usluge

Fontovi i grafički elementi poslužuju se lokalno. Karta paketomata ne učitava se pri otvaranju stranice, nego tek kada kupac odabere dostavu u paketomat i otvori kartu. Vanjske poveznice prema kartama i partnerima kontaktiraju te stranice tek nakon klika.

## Upravljanje podacima u pregledniku

Košaricu možete isprazniti u sučelju. Ostalu lokalnu ili sesijsku pohranu i kolačiće možete izbrisati kroz postavke preglednika. Brisanje prijavnih kolačića odjavljuje korisnika, a brisanje sesijske pohrane uklanja nedovršeni nacrt rezervacije.`,
    content_en: `## Current use

- Supabase Auth sets necessary session cookies for signed-in user and administrator sessions.
- Short-lived HttpOnly cookies are used only during secure password recovery.
- Local storage retains the interface language and cart until the user or browser clears them.
- Session storage retains the booking draft and short-lived booking or order result until the browser tab is closed.

## Analytics, marketing and external services

Alderway currently loads no Google Analytics, advertising pixels or marketing cookies. Local fonts and interface assets do not contact third parties. The parcel-locker map loads only after the customer selects locker delivery and opens the map. External maps and partner sites are contacted only after the user follows their links.

## Controls

The cart can be cleared in the interface. Other browser data and cookies can be removed through browser settings. Clearing authentication cookies signs the user out; clearing session storage removes an unfinished booking draft.`
  },
  shop_terms: {
    ...BASE_VERSION,
    document_key: 'shop_terms',
    title_hr: 'Uvjeti poslovanja webshopa',
    title_en: 'Webshop Terms of Business',
    summary_hr: 'Osnovna pravila naručivanja, plaćanja, dostave i povrata u Alderway webshopu.',
    summary_en: 'Core rules for ordering from the Alderway webshop. The published version applies from its stated effective date.',
    content_hr: `## Prodavatelj i kontakt

Alderway Campers, 18 Alder Way, Northmere, N04 R2Y6, Irska. Kontakt: hello@alderwaycampers.com i +353 1 687 2048.

## Proizvodi, cijene i dostupnost

Prikazane cijene izražene su u eurima. Dostupnost i ukupni iznos ponovno se provjeravaju na serveru prije spremanja narudžbe. Očita pogreška u cijeni, opisu ili zalihi ne stvara obvezu isporuke po pogrešnom podatku; Alderway će kupca obavijestiti i ponuditi nastavak ili otkazivanje.

## Narudžba i potvrda

Slanje narudžbe znači da je zahtjev zaprimljen na obradu. Automatska poruka potvrđuje primitak, a ne mora sama značiti konačno prihvaćanje ili otpremu. Kupac mora unijeti točne podatke i provjeriti sažetak prije slanja.

## Plaćanje i dostava

Dostupni načini, cijene, rokovi i ograničenja prikazuju se na stranici Plaćanje i dostava te u checkoutu. Kod kartičnog plaćanja korisnik se preusmjerava na CorvusPay; Alderway ne pohranjuje pune podatke kartice.

## Povrat, prigovor i materijalni nedostatak

Postupak je opisan na stranici Reklamacije i povrat. Ovi uvjeti ne ograničavaju prava koja kupcu pripadaju po obveznim propisima.

## Privatnost

Obrada osobnih podataka opisana je u Politici privatnosti i dokumentu Kolačići i pohrana preglednika.

## Mjerodavno pravo i izmjene

Primjenjuje se pravo Irske i obvezna pravila zaštite potrošača. Na narudžbu se primjenjuje verzija objavljena s datumom početka primjene u trenutku naručivanja. Svaka objavljena izmjena sadrži datum početka primjene.`,
    content_en: `## Seller and contact

Alderway Campers, 18 Alder Way, Northmere, N04 R2Y6, Ireland. Contact: hello@alderwaycampers.com and +353 1 687 2048.

## Products, prices and availability

Prices are displayed in euros. Availability and totals are checked again on the server before an order is stored. An obvious error in price, description or stock does not create an obligation to supply using incorrect information; Alderway will contact the customer and offer continuation or cancellation.

## Orders, payment and delivery

Submitting an order records a request for processing. An automated receipt message does not necessarily constitute final acceptance or dispatch. Available payment and delivery methods, prices and restrictions are shown on the Payment and Shipping page and at checkout. Full card details are not stored by Alderway.

## Returns, complaints and privacy

The process is described on the Complaints and Returns page. These terms do not limit mandatory consumer rights. Personal-data processing is described in the Privacy Policy and Cookies and Browser Storage document.

## Applicable version

The version published with the effective date at the time of ordering applies. Each published update includes its effective date.`
  },
  delivery_payment: {
    ...BASE_VERSION,
    document_key: 'delivery_payment',
    title_hr: 'Plaćanje i dostava',
    title_en: 'Payment and Shipping',
    summary_hr: 'Načini plaćanja, dostave i preuzimanja. Važeće cijene izračunavaju se iz Alderway poslovnih postavki i prikazane su niže.',
    summary_en: 'Payment, delivery and pickup methods. Current prices are calculated from Alderway business settings and shown below.',
    content_hr: `## Plaćanje

Checkout prikazuje samo trenutačno omogućene metode. Bankovna uplata izvršava se prema podacima iz potvrde. Plaćanje pouzećem dostupno je samo za podržane dostavne metode i može uključivati prikazanu naknadu. Kartično plaćanje koristi CorvusPay kada je usluga tehnički i poslovno omogućena.

## Dostava i osobno preuzimanje

Cijena kurirske dostave ovisi o zoni, poštanskom broju i vrijednosti košarice. Dostava u paketomat ima zasebnu cijenu, a paketomat kupac bira na karti koja se učitava tek nakon klika. Proizvodi označeni samo za osobno preuzimanje ne mogu se poslati dostavnom službom.

## Rokovi i praćenje

Prikazani rokovi dostave su procjene i mogu ovisiti o zalihi, uplati, dostavljaču, adresi i izvanrednim okolnostima. Alderway šalje potvrdu i daljnje upute na email kupca.`,
    content_en: `## Payment

Checkout shows only currently enabled methods. Bank transfers use the details in the confirmation. Cash on delivery is available only for supported methods and may include the displayed fee. Card payment uses CorvusPay when technically and commercially enabled.

## Delivery and pickup

Courier pricing depends on zone, postcode and cart value. Parcel-locker delivery has a separate price, and its map loads only after the customer opens it. Pickup-only products cannot be sent by a delivery provider.

## Timing

Displayed delivery times are estimates and may depend on stock, payment, the carrier, address and exceptional circumstances. Alderway sends confirmation and further instructions by email.`
  },
  returns_complaints: {
    ...BASE_VERSION,
    document_key: 'returns_complaints',
    title_hr: 'Reklamacije i povrat',
    title_en: 'Complaints and Returns',
    summary_hr: 'Postupak za povrat proizvoda, oštećenje u transportu i reklamacije u Alderway webshopu.',
    summary_en: 'Process for product returns, transit damage and complaints in the Alderway webshop.',
    content_hr: `## Povrat proizvoda

Za povrat se javite na hello@alderwaycampers.com s predmetom „POVRAT PROIZVODA” kako biste dobili upute. Robu vratite bez nepotrebnog odgađanja, odgovarajuće zaštićenu i uz podatke potrebne za povezivanje s narudžbom. Zakonska prava kupca ne ograničavaju se ovim uputama.

## Oštećen ili neispravan proizvod

Obavijestite Alderway što prije. Radi brže obrade priložite fotografije proizvoda, ambalaže, transportne kutije i vidljivog oštećenja te sačuvajte proizvod i ambalažu do završetka postupka. Preporučeni brzi rok za prijavu transportnog oštećenja ne ograničava zakonska prava.

## Obrada zahtjeva

Alderway će pregledati dostavljene podatke i, kada je potrebno, vraćenu robu. O rješenju, zamjeni, popravku, umanjenju cijene ili povratu kupac će biti obaviješten prema primjenjivim pravilima i okolnostima zahtjeva.

## Obrazac

Postojeći obrazac za povrat dostupan je putem poveznice na ovoj stranici. Primjenjuje se postupak objavljen na ovoj stranici.`,
    content_en: `## Product returns

Contact hello@alderwaycampers.com with the subject “PRODUCT RETURN” for instructions. Return goods without unnecessary delay, suitably protected and with information that links them to the order. These instructions do not restrict mandatory consumer rights.

## Damaged or defective products

Notify Alderway as soon as possible. To speed up processing, include photos of the product, packaging, shipping box and visible damage, and retain the product and packaging until the process is complete. A recommended quick notice for transit damage does not limit statutory rights.

## Handling the request

Alderway will review the submitted information and, where needed, the returned goods. The customer will be informed about the applicable resolution. The process published on this page applies.`
  }
};

export function isLegalDocumentKey(value: string): value is LegalDocumentKey {
  return LEGAL_DOCUMENT_KEYS.includes(value as LegalDocumentKey);
}

export function cloneLegalDocument(value: LegalDocumentVersion): LegalDocumentVersion {
  return { ...value };
}
