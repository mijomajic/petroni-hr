<script lang="ts">
  import { locale } from '$lib/stores/locale';

  type PrivacySection = {
    title: string;
    body?: string[];
    items?: string[];
  };

  const updatedHr = '20. srpnja 2026.';
  const updatedEn = '20 July 2026';

  const hrSections: PrivacySection[] = [
    {
      title: 'Voditelj obrade i kontakt',
      body: [
        'Voditelj obrade osobnih podataka je Petroni d.o.o. Za pitanja o privatnosti, pristup podacima, ispravak, brisanje ili druge zahtjeve možete nas kontaktirati na info@petroni.hr.',
        'Kontakt podaci: Petroni d.o.o., Slavka Tomerlina 9, 10380 Sesvete, Zagreb, Hrvatska; telefon +385 91 242 7247.'
      ]
    },
    {
      title: 'Koje podatke obrađujemo',
      items: [
        'Korisnički račun: ime, prezime, email, telefon, adresa ako je unesena, država i podaci potrebni za prijavu putem Supabase Auth sustava. Lozinke se ne pohranjuju u čitljivom obliku.',
        'Rezervacije najma: odabrano vozilo, lokacije, datumi, vremena, broj putnika, planirana kilometraža, destinacija, dodatna oprema, napomene o cijeni, način plaćanja i status rezervacije.',
        'Podaci vozača za rezervaciju: ime, prezime, email, telefon, datum rođenja, broj vozačke dozvole, država izdavanja vozačke dozvole, adresa, grad, poštanski broj i država.',
        'Shop narudžbe: ime i prezime kupca, email, telefon, adresa dostave/računa, država, naručeni proizvodi, količine, cijene, način plaćanja i status narudžbe.',
        'Obavijesti o dostupnosti proizvoda: email adresa, odabrani proizvod, jezik poruke, vrijeme prijave i evidencija pokušaja slanja.',
        'Plaćanja i računi: iznosi, pozivi na broj, status plaćanja, bankovne upute, podaci potrebni za izdavanje računa i evidenciju pokušaja plaćanja.',
        'E-suglasnost za uvjete najma: datum i vrijeme prihvata, IP adresa, verzija prihvaćenih uvjeta i povezana rezervacija. To je evidencija prihvata, a ne jamstvo pravne provedivosti svakog pojedinog uvjeta.',
        'Tehnički podaci: sesijski kolačići, sigurnosni zapisnici, IP adresa u server zapisnicima, podaci o pogreškama i podaci pohranjeni lokalno u pregledniku za košaricu, jezik i nacrt rezervacije.',
        'Komunikacija: sadržaj poruka, emailovi, telefonski upiti i administrativne bilješke potrebne za odgovor ili izvršenje usluge.'
      ]
    },
    {
      title: 'Svrhe i pravne osnove obrade',
      items: [
        'Izrada i vođenje korisničkog računa: izvršenje ugovora ili radnje prije sklapanja ugovora.',
        'Obrada rezervacija, shop narudžbi, dostave, korisničke podrške i komunikacije: izvršenje ugovora ili radnje na zahtjev korisnika.',
        'Jednokratna obavijest kada odabrani rasprodani proizvod ponovno bude na zalihi: radnja na zahtjev korisnika. Prijava se ne koristi za opći marketing.',
        'Provjera uvjeta najma, dobi vozača, dostupnosti vozila, obračun cijene i zaštita od zlouporabe: ugovor, legitimni interes i, gdje je primjenjivo, pravna obveza.',
        'Izdavanje računa, knjigovodstvena i porezna evidencija, reklamacije i potrošačka prava: pravna obveza.',
        'Sigurnost sustava, administrativni zapisnici, sprječavanje prijevara i zaštita pravnih zahtjeva: legitimni interes.',
        'Marketinška komunikacija, analitika, pikseli ili neobavezni kolačići: samo uz privolu ako se takvi alati naknadno uvedu.'
      ]
    },
    {
      title: 'Primatelji i izvršitelji obrade',
      body: [
        'Podatke dijelimo samo kada je to potrebno za pružanje usluge, sigurnost sustava, ispunjenje zakonskih obveza ili zaštitu prava.'
      ],
      items: [
        'Supabase: baza podataka, autentikacija, korisničke sesije i pohrana aplikacijskih podataka.',
        'Vercel: hosting, isporuka aplikacije, tehnički zapisnici i sigurnost infrastrukture.',
        'Resend i povezani email pružatelji, uključujući Amazon SES infrastrukturu: slanje potvrda rezervacija, obavijesti, računa i administrativnih emailova.',
        'CorvusPay: kartična plaćanja kada budu omogućena. Petroni ne pohranjuje pune podatke kartica.',
        'Banke i platni sustavi: obrada uplata, potvrda statusa i knjigovodstvena evidencija.',
        'Dostavne službe, npr. Overseas Express ili BoxNow kada su odabrani: dostava shop narudžbi.',
        'Knjigovodstvo, pravni/tax savjetnici, IT podrška i nadležna tijela kada je to potrebno ili zakonski obvezno.',
        'Google Maps se više ne učitava kao ugrađeni sadržaj na stranici; korisnik može sam otvoriti vanjsku kartu putem poveznice.'
      ]
    },
    {
      title: 'Prijenosi izvan Europskog gospodarskog prostora',
      body: [
        'Neki tehnološki pružatelji mogu obrađivati podatke izvan Europskog gospodarskog prostora. U tom slučaju oslanjamo se na dostupne zaštitne mjere pružatelja, primjerice standardne ugovorne klauzule, odluke o primjerenosti ili druge mehanizme predviđene GDPR-om.'
      ]
    },
    {
      title: 'Rokovi čuvanja',
      items: [
        'Podaci korisničkog računa čuvaju se dok račun postoji ili dok korisnik ne zatraži brisanje, osim ako moramo zadržati pojedine podatke zbog zakona ili otvorenih zahtjeva.',
        'Rezervacije, narudžbe, računi, plaćanja i reklamacije čuvaju se koliko je potrebno za izvršenje usluge, računovodstvene i porezne obveze, potrošačke zahtjeve te moguće pravne zahtjeve.',
        'Evidencija prihvata uvjeta najma čuva se zajedno s rezervacijom na koju se odnosi.',
        'Email i korisnička komunikacija čuva se koliko je potrebno za rješavanje upita, podršku, dokazivanje dogovora i zaštitu prava.',
        'Prijava za dostupnost čuva se do slanja obavijesti ili povlačenja zahtjeva; evidencija slanja može se ograničeno čuvati radi dokazivanja isporuke i zaštite od zlouporabe.',
        'Tehnički i sigurnosni zapisnici čuvaju se ograničeno vrijeme, osim ako je dulje čuvanje potrebno zbog sigurnosnog incidenta, zlouporabe ili pravnog zahtjeva.',
        'Podaci u lokalnoj pohrani preglednika, poput košarice, jezika i nacrta rezervacije, ostaju na uređaju korisnika dok ih korisnik ili preglednik ne izbriše.'
      ]
    },
    {
      title: 'Kolačići, lokalna pohrana i analitika',
      body: [
        'Stranica trenutačno koristi nužne kolačiće i lokalnu pohranu za rad prijave, košarice, jezika, nacrta rezervacije i sigurnih sesija. Ti podaci omogućuju funkcije koje korisnik traži.',
        'Trenutačno nisu dodani marketinški pikseli ni Google Analytics. Ako se uvedu analitika, oglasi, ugrađene karte ili drugi neobavezni alati, prije njihova učitavanja treba dodati odgovarajući mehanizam privole.'
      ]
    },
    {
      title: 'Prava korisnika',
      body: [
        'Korisnik može zatražiti pristup svojim podacima, ispravak netočnih podataka, brisanje, ograničenje obrade, prenosivost podataka, prigovor na obradu koja se temelji na legitimnom interesu te povlačenje privole kada je obrada temeljena na privoli.',
        'Zahtjev pošaljite na info@petroni.hr. Radi zaštite korisnika možemo zatražiti dodatnu provjeru identiteta. Na zahtjeve odgovaramo bez nepotrebnog odgađanja, u pravilu u roku od mjesec dana, osim kada je zahtjev složen ili brojan.'
      ]
    },
    {
      title: 'Pravo na pritužbu',
      body: [
        'Ako smatrate da obrada osobnih podataka nije u skladu s propisima, možete se obratiti Agenciji za zaštitu osobnih podataka Republike Hrvatske (AZOP), azop.hr. Preporučujemo da nas prethodno kontaktirate kako bismo pokušali riješiti zahtjev izravno.'
      ]
    },
    {
      title: 'Sigurnost i plaćanja',
      body: [
        'Koristimo tehničke i organizacijske mjere za zaštitu podataka, uključujući autentikaciju, ograničenje administratorskog pristupa, serversku provjeru cijena i sigurnosne zapisnike. Ukupni iznosi rezervacija ponovno se računaju na serveru.',
        'Kod kartičnog plaćanja, kada bude omogućeno, korisnik se preusmjerava na CorvusPay. Petroni ne pohranjuje puni broj kartice, CVC ni druge osjetljive kartične podatke.'
      ]
    },
    {
      title: 'Djeca i maloljetnici',
      body: [
        'Usluge najma kampera nisu namijenjene djeci. Vozač mora ispunjavati minimalnu dob propisanu uvjetima najma. Maloljetnici ne bi trebali stvarati račun ili slati narudžbe bez roditelja ili skrbnika.'
      ]
    },
    {
      title: 'Uvjeti poslovanja - kratka napomena',
      body: [
        'Korištenjem stranice, slanjem rezervacije ili narudžbe korisnik prihvaća relevantne uvjete prikazane u procesu. Rezervacije i narudžbe počinju kao zahtjev u obradi i nisu automatski potvrđene.',
        'Puni uvjeti najma prikazuju se u procesu rezervacije i korisnik ih mora prihvatiti prije slanja zahtjeva. Za shop narudžbe vrijede prikazani uvjeti plaćanja, dostave, reklamacija i povrata.'
      ]
    },
    {
      title: 'Ažuriranja ove politike',
      body: [
        'Ovu politiku možemo ažurirati radi promjena usluga, alata, zakonskih obveza ili organizacije obrade. Prije javnog lansiranja tekst treba pregledati klijent ili pravni savjetnik.'
      ]
    }
  ];

  const enSections: PrivacySection[] = [
    {
      title: 'Controller and contact',
      body: [
        'The controller of personal data is Petroni d.o.o. For privacy questions, access requests, corrections, deletion or other requests, contact us at info@petroni.hr.',
        'Contact details: Petroni d.o.o., Slavka Tomerlina 9, 10380 Sesvete, Zagreb, Croatia; phone +385 91 242 7247.'
      ]
    },
    {
      title: 'Data we process',
      items: [
        'Account data: first name, last name, email, phone, address if entered, country and data required for login through Supabase Auth. Passwords are not stored in readable form.',
        'Rental bookings: selected vehicle, locations, dates, times, passengers, planned kilometres, destination, extras, pricing notes, payment method and booking status.',
        'Booking driver details: first name, last name, email, phone, date of birth, driving licence number, licence issuing country, address, city, postcode and country.',
        'Shop orders: customer name, email, phone, shipping/billing address, country, ordered products, quantities, prices, payment method and order status.',
        'Back-in-stock alerts: email address, selected product, message language, request time and delivery-attempt records.',
        'Payments and invoices: amounts, payment references, payment status, bank-transfer instructions, data needed for invoices and payment-attempt records.',
        'Rental-term e-consent: acceptance date and time, IP address, accepted terms version and linked booking. This is an acceptance audit trail, not a guarantee that every individual term is legally enforceable.',
        'Technical data: session cookies, security logs, IP address in server logs, error data and browser local storage for cart, language and booking draft.',
        'Communication: message contents, emails, phone enquiries and administrative notes needed to respond or provide the service.'
      ]
    },
    {
      title: 'Purposes and legal bases',
      items: [
        'Creating and managing user accounts: contract performance or steps before entering a contract.',
        'Processing bookings, shop orders, deliveries, support and communication: contract performance or steps requested by the user.',
        'Sending a one-time alert when a selected out-of-stock product becomes available again: a step requested by the user. The request is not used for general marketing.',
        'Checking rental conditions, driver age, vehicle availability, pricing and abuse prevention: contract, legitimate interest and, where applicable, legal obligation.',
        'Invoices, accounting and tax records, complaints and consumer rights: legal obligation.',
        'System security, administrative logs, fraud prevention and legal claims: legitimate interest.',
        'Marketing communication, analytics, pixels or optional cookies: consent, if such tools are introduced later.'
      ]
    },
    {
      title: 'Recipients and processors',
      body: [
        'We share data only where needed to provide the service, keep the system secure, meet legal obligations or protect rights.'
      ],
      items: [
        'Supabase: database, authentication, user sessions and application data storage.',
        'Vercel: hosting, application delivery, technical logs and infrastructure security.',
        'Resend and related email providers, including Amazon SES infrastructure: booking confirmations, notices, invoices and administrative emails.',
        'CorvusPay: card payments when enabled. Petroni does not store full card details.',
        'Banks and payment systems: payment processing, status confirmation and accounting records.',
        'Delivery providers, such as Overseas Express or BoxNow when selected: delivery of shop orders.',
        'Accounting, legal/tax advisers, IT support and public authorities where needed or legally required.',
        'Google Maps is no longer loaded as embedded content on the site; users may open an external map link themselves.'
      ]
    },
    {
      title: 'Transfers outside the European Economic Area',
      body: [
        'Some technology providers may process data outside the European Economic Area. Where that happens, we rely on available safeguards from those providers, such as standard contractual clauses, adequacy decisions or other GDPR mechanisms.'
      ]
    },
    {
      title: 'Retention',
      items: [
        'Account data is kept while the account exists or until deletion is requested, unless some data must be retained for legal obligations or open requests.',
        'Bookings, orders, invoices, payments and complaints are kept as long as needed to provide the service, meet accounting/tax obligations, handle consumer claims and protect legal rights.',
        'Rental-term acceptance records are kept together with the booking to which they relate.',
        'Email and customer communication are kept as long as needed to handle enquiries, provide support, evidence arrangements and protect rights.',
        'A back-in-stock request is kept until the alert is sent or the request is withdrawn; delivery records may be retained for a limited period to evidence delivery and prevent abuse.',
        'Technical and security logs are kept for a limited period, unless longer retention is needed for a security incident, abuse or legal claim.',
        'Browser local-storage data, such as cart, language and booking draft, remains on the user device until the user or browser deletes it.'
      ]
    },
    {
      title: 'Cookies, local storage and analytics',
      body: [
        'The site currently uses necessary cookies and local storage for login, cart, language, booking draft and secure sessions. These support functions requested by the user.',
        'No marketing pixels or Google Analytics have been added at this time. If analytics, advertising, embedded maps or other optional tools are introduced, an appropriate consent mechanism should be added before they load.'
      ]
    },
    {
      title: 'User rights',
      body: [
        'Users may request access to their data, correction of inaccurate data, deletion, restriction of processing, data portability, objection to processing based on legitimate interest and withdrawal of consent where processing is based on consent.',
        'Send requests to info@petroni.hr. To protect users, we may request additional identity verification. We respond without undue delay, usually within one month, unless the request is complex or numerous.'
      ]
    },
    {
      title: 'Right to complain',
      body: [
        'If you believe personal data is not processed in line with the rules, you may contact the Croatian Personal Data Protection Agency (AZOP), azop.hr. We recommend contacting us first so we can try to resolve the request directly.'
      ]
    },
    {
      title: 'Security and payments',
      body: [
        'We use technical and organisational measures to protect data, including authentication, restricted administrator access, server-side price validation and security logs. Booking totals are recalculated on the server.',
        'For card payments, once enabled, the user is redirected to CorvusPay. Petroni does not store full card numbers, CVC codes or other sensitive card details.'
      ]
    },
    {
      title: 'Children and minors',
      body: [
        'Camper rental services are not intended for children. Drivers must meet the minimum age required by the rental terms. Minors should not create accounts or submit orders without a parent or guardian.'
      ]
    },
    {
      title: 'Terms of business - short note',
      body: [
        'By using the site, sending a booking request or placing an order, the user accepts the relevant terms shown in the process. Bookings and orders start as requests under review and are not automatically confirmed.',
        'Full rental terms are shown during booking and must be accepted before submitting the request. For shop orders, the displayed payment, delivery, complaints and return terms apply.'
      ]
    },
    {
      title: 'Updates to this policy',
      body: [
        'We may update this policy to reflect changes in services, tools, legal obligations or processing organisation. Before public launch, the text should be reviewed by the client or a legal adviser.'
      ]
    }
  ];

  const sections = $derived($locale === 'hr' ? hrSections : enSections);
</script>

<svelte:head>
  <title>{$locale === 'hr' ? 'Privatnost & Uvjeti poslovanja' : 'Privacy & Terms of Business'} — Petroni</title>
  <meta name="description" content={$locale === 'hr' ? 'Petroni politika privatnosti: obrada osobnih podataka, pravne osnove, rokovi čuvanja, korisnička prava, kolačići i uvjeti poslovanja.' : 'Petroni privacy policy: personal data processing, legal bases, retention, user rights, cookies and terms of business.'} />
  <meta property="og:title" content={`${$locale === 'hr' ? 'Privatnost & Uvjeti poslovanja' : 'Privacy & Terms of Business'} — Petroni`} />
  <meta property="og:description" content={$locale === 'hr' ? 'Petroni politika privatnosti: obrada osobnih podataka, pravne osnove, rokovi čuvanja, korisnička prava, kolačići i uvjeti poslovanja.' : 'Petroni privacy policy: personal data processing, legal bases, retention, user rights, cookies and terms of business.'} />
</svelte:head>

<div class="section">
  <div class="container-x max-w-4xl mx-auto">
    <span class="eyebrow mb-3">{$locale === 'hr' ? 'Pravne informacije' : 'Legal information'}</span>
    <h1 class="section-title mb-4">{$locale === 'hr' ? 'Privatnost & Uvjeti poslovanja' : 'Privacy & Terms of business'}</h1>
    <p class="lead mb-3">
      {$locale === 'hr'
        ? 'Ova stranica opisuje kako Petroni prikuplja, koristi, čuva i štiti osobne podatke kroz najam kampera, korisničke račune i shop.'
        : 'This page explains how Petroni collects, uses, stores and protects personal data across camper rental, user accounts and the shop.'}
    </p>
    <p class="text-[13px] leading-relaxed text-[#8b9099] mb-10">
      {$locale === 'hr'
        ? `Zadnje ažuriranje: ${updatedHr} Tekst je pripremljen kao praktična politika privatnosti za lansiranje i treba ga pregledati klijent ili pravni savjetnik prije tvrdnje o potpunoj usklađenosti.`
        : `Last updated: ${updatedEn}. This text was prepared as a practical launch privacy policy and should be reviewed by the client or a legal adviser before claiming full compliance.`}
    </p>

    <div class="space-y-8">
      {#each sections as section}
        <section class="card card-static p-6">
          <h2 class="text-[18px] font-bold text-[#2b2b2b] mb-3">{section.title}</h2>
          {#if section.body}
            <div class="space-y-3">
              {#each section.body as paragraph}
                <p class="text-[14px] leading-relaxed text-[#6b7178]">{paragraph}</p>
              {/each}
            </div>
          {/if}
          {#if section.items}
            <ul class="mt-3 space-y-2 text-[14px] leading-relaxed text-[#6b7178]">
              {#each section.items as item}
                <li class="flex gap-2">
                  <span class="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full" style="background:#f5c518"></span>
                  <span>{item}</span>
                </li>
              {/each}
            </ul>
          {/if}
        </section>
      {/each}
    </div>
  </div>
</div>
