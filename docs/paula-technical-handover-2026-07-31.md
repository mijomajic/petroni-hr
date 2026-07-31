# Petroni — tehnički pregled sustava i plan za puštanje u rad

Datum pregleda: 31. srpnja 2026.  
Status: radni handover za vlasnika sustava i IT podršku  
Opseg: javna stranica, booking, webshop, administracija, podaci, plaćanje, privatnost, hosting, pristupi i oporavak

> Sažetak odluke: nova Petroni aplikacija može nastaviti raditi na Vercelu uz Petroni domenu, dok Supabase, Resend i CorvusPay ostaju specijalizirani vanjski servisi. To je trenutačno najmanje rizična produkcijska arhitektura. Puno preseljenje na postojeći hosting nije provedeno niti je tehnički potvrđeno. Prije punog puštanja treba zatvoriti vlasništvo i pristupe, provjerljiv backup i restore, cjelovit SEO redirect plan, pravne tekstove i vanjske resurse, te stvarni CorvusPay test i postupak usklađenja uplata.

## 1. Kratki odgovori

- Aplikacija je izrađena u SvelteKitu 2 i Svelteu 5, uz TypeScript i Tailwind CSS 4.
- WordPress nije potreban da bi nova aplikacija radila. Nema runtime API veze prema WordPressu ni aktivnih WordPress plugina unutar nove aplikacije.
- WooCommerce je do 31. srpnja 2026. još korišten kao privremeni izvor kataloga putem ručnog CSV izvoza i kontroliranog uvoza u Supabase. To nije automatska ni trajna integracija.
- Frontend, serverske rute i admin trenutačno rade na Vercelu. Baza, korisnički računi i većina poslovnih podataka rade na Supabaseu. E-mail šalje Resend. Kartična naplata ide na CorvusPayovu hosted stranicu.
- Povezivanje `petroni.hr` s Vercelom nije isto što i preseljenje cijelog sustava na postojeći hosting. U toj varijanti domena pokazuje na Vercel, a ostali servisi ostaju gdje jesu.
- Postojeći hosting nije provjeren za SvelteKit/Node aplikaciju. Za potpuno uklanjanje Vercela hosting mora podržavati Node.js servis, HTTPS, reverse proxy, sigurne varijable okruženja, kontinuiran rad procesa i izlazne veze prema Supabaseu, Resendu i CorvusPayu. Potrebna je i promjena deployment adaptera.
- `/vozila` i Admin → Vozila postoje. Paula ih vjerojatno nije vidjela u očekivanom WordPress obliku.
- Slike se u adminu trenutačno uređuju unosom URL-a. Ne postoji klasičan upload gumb ni centralna medijska knjižnica.
- Objave imaju status skice. Javne CMS stranice spremaju se odmah javno. Uvjeti najma imaju sačuvane verzije. Globalni preview, verzioniranje svih sadržaja i povrat jednim klikom ne postoje.
- Dio starih URL-ova već ima trajna preusmjeravanja, ali audit starog sitemapa pokazuje da plan još nije potpun, posebno za `/en/*`, stare članke i dio kategorija.
- Google Analytics, Meta Pixel i Vercel Analytics nisu ugrađeni. Ipak se učitavaju Google Fonts, zastavice s FlagCDN-a i BoxNow widget na checkoutu, pa trenutačna izjava o samo nužnim tehnologijama nije potpuna.
- Kartični broj i CVC ne unose se u Petroni aplikaciju niti se spremaju u Supabase/Vercel. Korisnik se preusmjerava na CorvusPay.
- Kod postoji na GitHubu i može ga preuzeti drugi developer, ali računi i pristupi još nisu preneseni na formalno Petroni vlasništvo.
- Kod i deployment imaju povijest, ali trenutno nije potvrđen dovoljno dobar backup cijelog sustava. Supabase PITR nije uključen, a provjera nije pokazala dostupnu fizičku backup točku. Supabase Storage datoteke ionako nisu dio database backupa.

## 2. Arhitektura i ovisnosti

| Dio sustava | Trenutačna lokacija | Svrha | Ovisnost o WordPressu |
|---|---|---|---|
| Javni frontend | Vercel | Stranice, shop, booking i korisnički račun | Ne |
| Serverske rute i admin | Vercel, Node runtime | Cijene, rezervacije, narudžbe, e-mailovi i zaštićene admin akcije | Ne |
| Baza podataka | Supabase Postgres, EU regija | Vozila, cijene, proizvodi, rezervacije, narudžbe i CMS | Ne |
| Prijava korisnika | Supabase Auth | Korisnički i administratorski računi | Ne |
| Slike i dokumenti | Git/Vercel static te Supabase Storage | Vozila, javne slike, shop fotografije i PDF dokumenti | Ne nakon završene migracije |
| Transakcijski e-mail | Resend | Potvrde, obavijesti i računi | Ne |
| Kartično plaćanje | CorvusPay hosted checkout | Unos i obrada kartice izvan Petroni aplikacije | Ne |
| Dostava | Overseas i BoxNow | Poslovna pravila dostave i BoxNow izbor paketomata | Ne |
| Izvorni kod | GitHub | Verzije koda, review i predaja drugom developeru | Ne |

WordPress je i dalje važan samo kao stari produkcijski sustav do promjene domene i kao povijesni izvor sadržaja/proizvoda. Najnoviji WooCommerce katalog sinkroniziran je ručnim CSV procesom 31. srpnja 2026. Nakon puštanja nove trgovine treba proglasiti jedan sustav autoritativnim; nema automatske dvosmjerne sinkronizacije zaliha između WooCommercea i Supabasea.

## 3. WordPress plugini, licence i gašenje stare stranice

Iz koda nove aplikacije nije moguće izraditi pouzdan popis svih plaćenih WordPress licenci. Za to je potreban izvoz iz WordPress admina i računa na kojima se licence plaćaju. U javno dostupnom sitemapu vidi se barem Yoast SEO, WooCommerce i višejezična struktura, ali taj tehnički trag nije dovoljan za odluku o otkazivanju.

Ne preporučuje se gasiti WordPress ili licence prije ovih uvjeta:

1. Završni WooCommerce freeze i zadnji uvoz proizvoda, cijena i zaliha.
2. Potpuna kopija WordPress baze i `wp-content` datoteka.
3. Izvoz popisa plugina, licenci, domena, mail usluga i vanjskih integracija.
4. Potvrđen redirect za sve stare sitemap URL-ove i najvažnije linkove iz Search Consolea.
5. Prebacivanje domene i provjera bookinga, webshopa, e-mailova, admina i plaćanja.
6. Dogovoreni rollback prozor od najmanje 30 dana; 60 dana je sigurniji izbor.
7. Potvrda da WordPress hosting ne drži DNS, mail sandučiće ili druge servise koji bi se slučajno ugasili zajedno sa stranicom.

Tek nakon toga plugin/licence se mogu označiti kao: zadržati, otkazati nakon rollback roka ili zadržati zbog druge Petroni usluge.

## 4. Hosting i preporučena odluka

### Preporučena produkcijska varijanta

Povezati Petroni domenu na postojeći Vercel projekt. Vercel nastavlja izvršavati aplikaciju, Supabase ostaje baza/Auth/Storage, Resend ostaje e-mail servis, a CorvusPay platni servis. Postojeći WordPress hosting više ne poslužuje web stranicu, ali ne smije se ugasiti dok nisu provjereni DNS, e-mail i rollback.

Prednosti su najmanje promjena, postojeći deployment proces, brzi rollback aplikacije i arhitektura za koju je kod već konfiguriran. Nedostatak je da sustav ostaje raspoređen na više specijaliziranih servisa, što je normalno za ovu vrstu aplikacije, ali zahtijeva uredno vlasništvo računa.

### Potpuno preseljenje s Vercela

To je zaseban migracijski projekt. Preselio bi se frontend, server i admin, ali Supabase, Resend i CorvusPay i dalje ostaju vanjski servisi osim ako se posebno ne migriraju i oni. Za postojeći hosting treba potvrditi:

- podržan i održavan Node.js runtime;
- kontinuiran proces ili kompatibilan serverless runtime;
- HTTPS, custom domene i reverse proxy;
- sigurne environment varijable i odvojeni production/preview kontekst;
- dovoljne limite memorije, trajanja zahtjeva i upload veličine;
- logove, monitoring, automatski deploy i rollback;
- izlaznu mrežu prema Supabaseu, Resendu, CorvusPayu i dostavnim servisima;
- testno okruženje i mogućnost povratka na staru verziju.

Dok taj hosting nije imenovan i tehnički provjeren, ne može se odgovorno obećati potpuno preseljenje niti prestanak ovisnosti o Vercelu.

### Odgovornost za migraciju

Treba je dogovoriti pisano prije promjene DNS-a. Minimalno trebaju biti imenovani:

- vlasnik poslovne odluke i go-live odobrenja;
- osoba s DNS/hosting pristupom;
- developer koji radi konfiguraciju i deployment;
- osoba koja provodi poslovni test bookinga, shopa, dostave, računa i admina;
- osoba koja provodi i potpisuje CorvusPay test;
- osoba odgovorna za rollback ako provjera ne prođe.

## 5. Vlasništvo, pristupi i mogućnost preuzimanja

Trenutačno potvrđeno stanje:

| Servis | Trenutačno stanje | Rizik | Potrebno konačno stanje |
|---|---|---|---|
| GitHub | Javni repo `mijomajic/petroni-hr`; jedini collaborator je `mijomajic` | Klijent nema neovisan vlasnički pristup; repo je javan | Petroni organizacija/račun kao vlasnik, privatni repo, najmanje dva vlasnika i developer pristup |
| Vercel | Projekt `mijos-projects/petroni-hr` na razvojnom timu | Ovisnost o razvojnom računu | Petroni tim kao vlasnik i najmanje dva administratorska člana |
| Supabase | Projekt `Petroni`; razvojni račun ima pristup | Vlasništvo i dodatni članovi nisu dokumentirani | Petroni owner, rezervni owner/admin i developer s najmanjim potrebnim ovlastima |
| Resend | Ključevi su u Vercelu; vlasnički račun nije potvrđen ovim auditom | Moguća ovisnost o jednom računu i senderu | Petroni račun, verificirana domena/sender i dva administratora |
| CorvusPay | Enkriptirane produkcijske varijable postoje u Vercelu | Nije dokumentiran puni vlasnički/admin popis ni uspješan stvarni test | Petroni merchant račun, dva ovlaštena kontakta i dokumentiran test |
| Admin aplikacije | Aktivni administrator `zoezedone@gmail.com` | Jedan operativni admin | Najmanje dva imenovana admina i postupak uklanjanja pristupa |
| DNS/registrar/hosting | Nije provjeren u ovom auditu | Cutover ili e-mail mogu biti blokirani | Dva Petroni vlasnička pristupa i evidentiran registrar/DNS provider |

Drugi developer može klonirati i pokrenuti kod jer README, migracije i testovi postoje. Ne može samostalno održavati produkciju bez pristupa GitHubu, Vercelu, Supabaseu, Resendu, CorvusPayu, DNS-u i pripadajućim tajnama. Tajne se ne šalju mailom; predaju se kroz vlasničke račune i password manager, a nakon predaje se rotiraju.

## 6. Admin, vozila, slike, skice i povijest

### Vozila

Javna stranica `/vozila` postoji i vodi na najam, prodaju i filmsku produkciju. U adminu postoji Admin → Vozila (`/admin/vozila`) s uređivanjem detalja, dostupnosti, galerije i blokiranih datuma.

### Slike

Trenutačni admin koristi polja „Slike, jedan URL po retku“. To znači da administrator mora prvo imati URL slike, a zatim ga zalijepiti u vozilo, proizvod, objavu ili javnu stranicu. Klasičan upload, organizacija mapa, zamjena datoteke, alt tekst i pregled originala nisu objedinjeni u medijskoj knjižnici.

Trenutačna pohrana:

- optimizirane slike vozila i dio javnih slika nalaze se u Git repozitoriju i isporučuju preko Vercela;
- shop fotografije i migrirani WordPress dokumenti/slike nalaze se u Supabase Storageu;
- izvorne fotografije vozila postoje u lokalnim mapama `Slike 1.dio` i `Slike vozila 2.dio`, izvan Git repozitorija;
- WordPress slike kopirane su u Supabase uz manifest i checksum, ali to nije zamjena za klijentsku arhivu originala.

Potrebno je uvesti Petroni-owned medijsku knjižnicu s uploadom, automatskom optimizacijom, originalom koji se ne mijenja, izvedenicama, alt tekstom, evidencijom autora/licence i sigurnim brisanjem samo nekorištenih datoteka.

### Skice, preview i rollback

- Objave podržavaju skicu i objavu.
- Uvjeti najma čuvaju verzije i aktivnu verziju.
- Četiri javne CMS stranice (Naslovnica, O nama, Kontakt, FAQ) trenutno se objavljuju odmah nakon spremanja.
- Vozila i proizvodi imaju aktivno/neaktivno stanje, ali nemaju pravi preview izmjene prije objave.
- Admin audit bilježi prije/poslije stanje za velik dio administratorskih akcija.
- Ne postoji globalni prikaz povijesti, vraćanje jednim klikom ni verzioniranje svih sadržaja.

Preporuka je dodati draft/published verziju, privatni preview URL, povijest verzija, usporedbu promjena i restore akciju za sve sadržajne module.

## 7. Stari URL-ovi, SEO i 404 nadzor

Nova aplikacija već ima trajne HTTP 308 redirecte za poznate stare stranice, glavne vehicle URL-ove i dio WooCommerce kategorija. Produkcijski primjer je provjeren i vraća ispravan 308.

Međutim, stari Yoast sitemap još sadrži:

- velik broj `/en/...` URL-ova;
- stare članke na root slugovima, dok nova aplikacija koristi `/novosti/[slug]`;
- kategorije koje nisu u trenutnoj ručnoj mapi;
- više product sitemap datoteka i posebne WooCommerce rute.

Zato redirect posao nije gotov. Prije promjene domene treba automatski:

1. Preuzeti i zamrznuti sve stare sitemapove.
2. Za svaki URL odrediti novi URL, `410 Gone` ili dokumentirano izuzeće.
3. Testirati da nema redirect loopa ili lanca i da odredište nije 404.
4. Posebno obraditi `/en/*` bez stvaranja duplicate contenta.
5. Usporediti top landing stranice i vanjske linkove iz Google Search Consolea.
6. Nakon cutovera dnevno pratiti 404 i popunjavati redirect mapu barem 30 dana.
7. Predati novi sitemap Search Consoleu tek kada finalna domena pokazuje na novu aplikaciju.

Vlasnik zadatka treba biti developer za implementaciju i izvještaj, uz Paula/Moni potvrdu poslovno ispravnog odredišta za stranice koje nemaju očiti ekvivalent.

## 8. Pravne stranice, kolačići i vanjski servisi

### Trenutačna uredljivost

- Uvjeti najma: uređuju se u Admin → Uvjeti najma, HR/EN, uz verzije.
- Politika privatnosti i kratka bilješka o uvjetima poslovanja: trenutno su u kodu na `/privatnost`.
- Plaćanje i dostava: trenutno su u kodu na `/placanje-dostava`.
- Reklamacije i povrat: trenutno su u kodu na `/reklamacije-povrat`.
- Zasebna Politika kolačića i potpuni, verzionirani Uvjeti kupnje nisu implementirani kao admin sadržaj.

Ove stranice treba prebaciti u zaštićeni pravni CMS s HR/EN verzijama, statusom skice, datumom stupanja na snagu, poviješću i mogućnošću povratka. Pravne tekstove mora odobriti Petroni ili pravni savjetnik; tehnički tim može točno opisati tehnologiju, ali ne treba jamčiti pravnu usklađenost.

### Trenutačni first-party cookie i browser storage inventar

| Naziv / obrazac | Vrsta i trajanje | Svrha | Tko postavlja |
|---|---|---|---|
| `sb-<project>-auth-token` i mogući chunkovi | Cookie, bibliotečki maksimum do 400 dana; stvarni tokeni se obnavljaju/uklanjaju odjavom | Prijava i sigurna sesija korisnika/admina | Petroni aplikacija / Supabase Auth |
| `petroni_password_recovery_intent` | HttpOnly cookie, 20 minuta | Veže zahtjev za oporavak lozinke uz isti preglednik | Petroni aplikacija |
| `petroni_password_recovery` | HttpOnly cookie, 20 minuta | Dopušta postavljanje nove lozinke nakon valjane potvrde | Petroni aplikacija |
| `petroni_cart` | Local Storage, do brisanja od korisnika/preglednika ili pražnjenja košarice | Lokalna košarica | Petroni aplikacija |
| `petroni_locale` | Local Storage, do brisanja | HR/EN izbor | Petroni aplikacija |
| `petroni_booking` | Session Storage, do zatvaranja taba/sesije | Nedovršeni booking koraci i uneseni podaci | Petroni aplikacija |
| `petroni_booking_result` | Session Storage | Prikaz rezultata rezervacije | Petroni aplikacija |
| `petroni_order_result` | Session Storage | Prikaz rezultata narudžbe i uplatnica | Petroni aplikacija |

Napomena: booking draft u Session Storageu može sadržavati kontaktne i vozačke podatke koje je korisnik upisao prije slanja. To treba jasno navesti i razmotriti čišćenje nakon uspjeha, odustajanja ili isteka.

### Analitika i third-party učitavanja

Audit koda nije pronašao Google Analytics, Meta Pixel, Vercel Analytics, Hotjar, Clarity, chat ili oglasne piksele. Trenutačno ipak postoje vanjski zahtjevi:

- Google Fonts na svim stranicama; Google prima IP adresu, traženi URL, user agent i referrer za isporuku fonta;
- FlagCDN slike zastavica u headeru;
- Supabase domena za javne slike/dokumente i API/Auth;
- BoxNow skripta i iframe na checkoutu; skripta se sada učitava odmah nakon otvaranja checkouta, prije nego korisnik odabere BoxNow;
- CorvusPay tek kada se korisnik odluči na kartično plaćanje i bude preusmjeren;
- vanjski linkovi prema društvenim mrežama, kartama i partnerima, bez ugrađenih social feedova.

Trenutno nema consent bannera jer nije uvedena analitika/oglašavanje. Ipak, tehničko stanje treba uskladiti s pravnim tekstom. Najčišći zahvati su samostalno hostati font i zastavice, ukloniti preostale vanjske slike iz default sadržaja te BoxNow učitati tek nakon izbora BoxNow dostave i jasne korisničke akcije. Ako se kasnije uvedu analitika ili marketing, moraju biti blokirani do privole, a korisnik mora moći promijeniti ili povući privolu.

## 9. Backup, restore i kontinuitet poslovanja

### Što postoji

- GitHub čuva kod i povijest commitova.
- Vercel čuva deployment verzije i omogućuje rollback aplikacijskog deploya; to ne vraća bazu ni Supabase Storage.
- Supabase projekt koristi fizički backup mehanizam, ali audit kroz CLI trenutno nije pokazao dostupne backup točke, a PITR je isključen.
- Migracijski SQL i migracijski manifesti postoje u repozitoriju.
- Statičke slike u repozitoriju pokrivene su Git poviješću.

### Kritični nedostatak

Nije potvrđen postupak kojim se cijela usluga može vratiti: baza, Auth podaci, Storage objekti, environment varijable, domena i zadnja dobra verzija aplikacije. Supabase službeno navodi da database backup ne uključuje objekte spremljene preko Storage API-ja.

### Minimalni produkcijski plan

1. Potvrditi Supabase plan, dnevni backup retention i odgovornu osobu.
2. Uvesti automatski dnevni logički export baze u šifriranu lokaciju izvan Supabase projekta.
3. Uvesti periodičnu kopiju oba produkcijska Storage bucketa s manifestom i checksumom.
4. Čuvati siguran popis environment varijabli i vlasnika, bez spremanja tajnih vrijednosti u Git.
5. Dokumentirati Vercel rollback i ponovno povezivanje domene.
6. Definirati RPO i RTO; početna preporuka je najviše 24 sata mogućeg gubitka podataka i povrat osnovne usluge unutar četiri sata, a poslovni vlasnik mora to potvrditi.
7. Izvesti testni restore u odvojeni projekt prije lansiranja i najmanje kvartalno.
8. Dokumentirati tko proglašava incident, tko radi restore i tko potvrđuje ispravnost bookinga/narudžbi.

Službene reference: [Supabase Database Backups](https://supabase.com/docs/guides/platform/backups), [Vercel rollback](https://vercel.com/docs/deployments/rollback-production-deployment) i [Vercel deployment retention](https://vercel.com/docs/deployment-retention).

## 10. CorvusPay i slučajevi neusklađene uplate

Aplikacija koristi CorvusPay hosted checkout. Prije preusmjeravanja sprema rezervaciju ili narudžbu i interni pokušaj plaćanja. CorvusPayu šalje referencu narudžbe, iznos, opis, e-mail i potpis. Kartični broj, datum isteka i CVC ne postoje u Petroni formama i ne spremaju se u Petroni bazi ili Vercelu.

Povrat iz CorvusPaya provjerava potpis. Ako povrat nema dovoljno potpisanih polja, server može napraviti status upit prema CorvusPayu. Nakon uspjeha ažurira se status rezervacije/narudžbe i zapisuje provider referenca i approval metadata.

Zaštite koje postoje:

- ne stvara se redirect bez prethodno spremljene rezervacije/narudžbe;
- reference su deterministički povezane s internim UUID-om;
- callback se kriptografski provjerava ili potvrđuje server-to-server statusom;
- pokušaji i ishodi plaćanja imaju audit zapise;
- shop zalihu potvrđuje server zajedno s prijelazom narudžbe u obradu.

Preostali rizik: ako je kartica naplaćena, ali Supabase update ili callback trajno ne uspije, transakcija se može pronaći po CorvusPay referenci i ručno povezati, ali nema periodičnog automatskog reconciliation joba ni alarma za takve slučajeve. Prije punog rada treba dodati:

1. admin akciju „Provjeri status na CorvusPayu“;
2. dnevni reconciliation izvještaj za Corvus transakcije nasuprot Petroni statusima;
3. alarm za potvrđenu uplatu bez uspješnog ažuriranja;
4. idempotentnu ponovnu obradu callbacka;
5. kontrolirani stvarni test kupnje i bookinga, uključujući namjerno prekinut povrat korisnika.

Produkcijske CorvusPay varijable postoje i opcija je uključena u sučelju, ali ovaj audit nije izvršio stvarnu kartičnu transakciju niti pregledao tajne vrijednosti.

## 11. Zaštita i čuvanje osobnih podataka

Postojeće tehničke zaštite uključuju HTTPS, server-side provjeru cijena, Supabase Row Level Security, odvojeni server-only service key, zaštićene admin rute, aktivnu admin tablicu, sigurne payment link tokene, e-consent audit, te admin, e-mail i payment događaje. Prijavljeni korisnik kroz javne politike može čitati samo vlastite rezervacije i narudžbe; administratorske operacije idu kroz server i aktivnu admin ulogu.

Trenutni operativni pristup imaju aktivni admin aplikacije i osobe s odgovarajućim Vercel/Supabase/Resend računima ili produkcijskim tajnama. Točan imenovani popis nije formalno predan klijentu i treba ga zatvoriti u access registru.

Politika privatnosti opisuje kategorije i načela čuvanja, ali nema poslovno odobrenih konkretnih rokova ni automatske retention procedure. Potrebno je definirati, najmanje za:

- korisničke račune;
- neuspjele i otkazane booking zahtjeve;
- potvrđene rezervacije, ugovore i e-consent;
- narudžbe, račune i poreznu dokumentaciju;
- kontakt upite i e-mail pokušaje;
- back-in-stock obavijesti;
- admin/security logove;
- payment reference i reconciliation zapise;
- lokalne booking draftove u pregledniku.

Rokove potvrđuju Petroni računovodstvo/pravnici, a developer implementira brisanje, anonimizaciju, izvoz i evidenciju izvršenja.

## 12. AI alati i porijeklo slika

AI asistenti korišteni su u razvoju i provjeri koda te u pripremi tehničkog teksta. To ne mijenja vlasništvo Petronija nad njegovim kodom i podacima, ali pristupe i licence treba formalno predati kroz repozitorij i račune.

Za trenutnu galeriju vozila postoje isporučene izvorne mape. Fotografije su programski auto-orijentirane, smanjene i pretvorene u WebP, uz thumbnail izvedenice. Taj proces ne dodaje tekst na fotografije. Shop fotografije potječu iz WooCommerce izvoza i preseljene su u Supabase uz manifest/checksum. Partner logotipi i dio javnih slika potječu iz dostavljenih ili javno preuzetih brand materijala.

Audit nije pronašao trenutni image-generation pipeline, ali nema potpunog provenance registra za svaku javnu sliku. Za sliku na kojoj se pojavio tekst koji nije na originalu treba dostaviti URL ili screenshot; tada se može usporediti prikazana datoteka s izvornikom i zamijeniti je. Nije odgovorno tvrditi porijeklo konkretne sporne slike bez identifikacije.

Potrebno je konsolidirati originale u Petroni-owned arhivu i za svaku medijsku datoteku čuvati: izvor, autora/vlasnika, licencu/dozvolu, originalni checksum, izvedenice i stranice koje je koriste.

## 13. Dokumentacija i održavanje

U repozitoriju već postoje:

- `README.md` s lokalnim pokretanjem, environment varijablama, testovima, migracijama i deploymentom;
- `HANDOFF.md` s poviješću faza i poznatim produkcijskim stanjem;
- `petroni-backend-build-plan.md` kao implementacijski plan;
- numerirane Supabase migracije;
- automatizirani testovi cijena, checkouta, CorvusPaya, redirecta, sigurnosti i CMS-a;
- migracijski izvještaji i manifesti za WordPress/WooCommerce slike;
- skripta i manifest optimiziranih slika vozila.

Nakon zatvaranja go-live stavki treba isporučiti završni operator handbook s:

- vlasnicima svih računa i billing kontakta;
- postupkom releasea, rollbacka i promjene environment varijabli;
- dnevnim/kvartalnim backup i restore postupkom;
- incident kontaktima i eskalacijom;
- admin uputama za vozila, proizvode, objave, pravne stranice, slike i verzije;
- CorvusPay i e-mail troubleshootingom;
- retention i access-review rasporedom;
- procedurom predaje novom developeru.

Dokumentacija se može poslati na `info@petroni.hr`, ali pristupne tajne i recovery kodovi ne šalju se kao privitak ili običan e-mail.

## 14. Predloženi go-live paket

### P0 — obavezno prije punog rada

- potvrditi hosting odluku: Vercel + Petroni domena ili zaseban puni hosting projekt;
- prenijeti vlasništvo/dodati Petroni ownere na GitHub, Vercel, Supabase, Resend i DNS;
- privatizirati repo nakon prijenosa i rotirati produkcijske tajne;
- uspostaviti i testirati backup baze i Storagea;
- dovršiti redirect mapu iz svih starih sitemapova i uključiti 404 monitoring;
- pravno odobriti privatnost, kolačiće, kupnju, dostavu, povrat i najam;
- ukloniti ili uvjetno/lijeno učitati nepotrebne third-party resurse;
- napraviti stvarni CorvusPay test i dodati reconciliation postupak;
- provesti puni E2E test bookinga, webshopa, e-mailova, računa i admina na finalnoj domeni.

### P1 — visoki prioritet odmah nakon ili kao uvjet klijenta za launch

- media upload i Petroni-owned original library;
- skice, preview i verzioniranje svih javnih sadržaja;
- admin pregled audit povijesti i restore jednim klikom;
- konkretni retention rokovi i automatizirano brisanje/anonimizacija;
- drugi admin i periodična revizija pristupa;
- monitoring aplikacijskih grešaka, e-mail failurea i payment mismatcha.

### Predložena podjela implementacije

1. Faza 6H-A — vlasništvo, access registar, hosting odluka i finalni runbook.
2. Faza 6H-B — potpuni legacy redirect audit, `/en/*` migracija i 404 monitoring.
3. Faza 6H-C — privacy hardening, self-hosted fontovi/zastavice, lazy BoxNow i legal CMS.
4. Faza 6H-D — backup automatizacija, Storage backup i restore proba.
5. Faza 6H-E — CorvusPay reconciliation i kontrolirani production payment test.
6. Faza 6H-F — media upload, preview, verzije i admin restore.

Svaka podfaza treba završiti provjerom, commitom i zasebnim prihvatom prije sljedeće.

## 15. Go-live prihvatni zapisnik

Go-live se odobrava tek kada su evidentirani datum, tester i rezultat za:

1. Domena, HTTPS, canonical, sitemap i robots.
2. Redirect uzorak i 404 izvještaj.
3. Registracija, prijava, oporavak i promjena lozinke.
4. Guest i account booking, cijena, dostupnost i e-consent.
5. Bankovna uplata i sve HUB-3 uplatnice.
6. CorvusPay kupnja, booking, otkazivanje i prekid povratka.
7. Guest i account webshop checkout za Overseas, BoxNow i osobno preuzimanje.
8. Narudžbe, zaliha, e-mailovi i PDF račun.
9. Admin vozila, cijene, rezervacije, proizvodi, narudžbe, objave, javne i pravne stranice.
10. Backup i testni restore.
11. Access registar i recovery pristupi.
12. Potpisano poslovno i pravno odobrenje tekstova i rokova čuvanja.

## 16. Izvori i provjerene činjenice

Ovaj pregled temelji se na repozitoriju `petroni-app`, produkcijskoj provjeri `https://petroni-hr.vercel.app`, starim Petroni sitemapovima, stanju GitHub/Vercel/Supabase CLI pristupa i službenoj dokumentaciji servisa. Tajne vrijednosti nisu čitane ni uključene u dokument.

- [Supabase Database Backups](https://supabase.com/docs/guides/platform/backups)
- [Supabase Access Control](https://supabase.com/docs/guides/platform/access-control)
- [Vercel production rollback](https://vercel.com/docs/deployments/rollback-production-deployment)
- [Vercel deployment retention](https://vercel.com/docs/deployment-retention)
- [Google Fonts privacy and data collection](https://developers.google.com/fonts/faq/privacy)

