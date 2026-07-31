# Produkcijski operativni runbook

Namjena: kontrolirani release, promjena domene, provjera, rollback i odgovor na incident za novu Petroni aplikaciju.

## 1. Uloge prije početka

Prije bilo kakve produkcijske promjene u privatnom operativnom kanalu imenovati:

| Uloga | Odgovornost |
|---|---|
| Go-live owner | Donosi odluku kreni/stani i prihvaća poslovni rezultat |
| Release developer | Provjerava commit, testove, Vercel deployment i logove |
| DNS operator | Izvozi zonu, mijenja samo odobrene web zapise i može ih vratiti |
| Poslovni tester | Testira booking, webshop, e-mailove, admin i sadržaj |
| Payment tester | Provodi odobreni stvarni CorvusPay test i provjerava merchant zapis |
| Incident/rollback owner | Proglašava rollback i koordinira povrat |

Jedna osoba može imati više uloga, ali go-live owner i poslovni tester trebaju izričito potvrditi rezultat.

## 2. Redovni release bez promjene DNS-a

Iz korijena `petroni-app/`:

```bash
git status --short --branch
git fetch origin
npm ci
npm test
npm run check
npm run build
```

Uvjeti za nastavak:

- radno stablo nema neočekivane promjene;
- cilj je pregledan commit na `main` grani;
- svi testovi prolaze;
- `npm run check` nema grešaka; upozorenja se ne smiju prešutjeti;
- build prolazi;
- sve nove migracije su idempotentne, pregledane i primijenjene prije funkcije koja ih zahtijeva;
- u Vercelu postoje sve potrebne Production varijable po nazivima iz `.env.example`, bez ispisivanja njihovih vrijednosti.

Postupak:

1. Push na `origin/main` pokreće Vercel production deployment.
2. Pričekati status `Ready`; zabilježiti commit i deployment ID.
3. Provjeriti preview/`petroni-hr.vercel.app` prije promjene finalne domene.
4. Provjeriti početnu, `/vozila`, `/rezerviraj`, `/trgovina`, `/kosarica`, `/naplata`, `/kontakt`, HR/EN i redirect na `/admin/login` bez prijave.
5. Pregledati server/runtime logove za nove 5xx greške.
6. Ne slati booking/narudžbu niti stvarnu kartičnu uplatu bez unaprijed odobrenog produkcijskog testa.

## 3. Preduvjeti za prvi DNS cutover

DNS se ne mijenja dok [go-live-checklist.md](go-live-checklist.md) nema odobrenje svih obveznih gateova. Minimalno:

- repo/Vercel/Supabase/DNS imaju Petroni ownera i rezervni pristup;
- WordPress baza, `wp-content`, plugin/licence popis i DNS zona su arhivirani;
- završen je zadnji WooCommerce freeze/sync i dogovoreno je da je Supabase novi autoritativni katalog;
- redirect audit i 404 plan su završeni;
- privacy/legal zahvati i odobreni tekstovi su aktivni;
- baza i Storage imaju provjeren backup/restore;
- CorvusPay kontrolirani test i reconciliation postupak su završeni;
- finalni `PUBLIC_SITE_URL` je `https://www.petroni.hr` ili druga izričito dogovorena kanonska varijanta, a svi CorvusPay/Auth callbackovi odgovaraju toj odluci;
- WordPress ostaje dostupan najmanje 30 dana kao rollback.

## 4. DNS cutover

### Najmanje 24 sata ranije

1. Izvesti kompletnu DNS zonu i snimiti TTL, A/AAAA/CNAME, MX, TXT, SPF, DKIM, DMARC i CAA zapise.
2. Snimiti trenutačne web vrijednosti. Dana 31. srpnja 2026. `petroni.hr` i `www.petroni.hr` razrješavali su se na `178.218.165.100`.
3. Smanjiti TTL samo web zapisa ako provider to dopušta. Ne dirati MX/TXT zapise.
4. U Vercel Domain Settings ponovno pročitati tražene vrijednosti. Dana 31. srpnja 2026. Vercel je za oba hosta tražio A zapis `76.76.21.21`.
5. Potvrditi da je najnoviji deployment `Ready`, finalni canonical/env/callback URL-ovi postavljeni i smoke test na Vercel aliasu prolazi.

### Promjena

1. Na postojećem `mojsite.com` DNS provideru promijeniti samo A zapis za apex `petroni.hr` na Vercelovu aktualnu vrijednost.
2. Promijeniti samo web zapis za `www.petroni.hr` prema aktualnoj Vercel uputi.
3. Ne mijenjati nameservere, MX, SPF, DKIM, DMARC, Google verification ni druge TXT zapise.
4. Zabilježiti vrijeme, staru i novu vrijednost, TTL i izvršitelja.

### Provjera propagacije

```bash
dig +short A petroni.hr
dig +short A www.petroni.hr
dig +short MX petroni.hr
curl -I https://petroni.hr
curl -I https://www.petroni.hr
```

Potvrditi:

- oba web hosta vode na Vercel i HTTPS certifikat je valjan;
- jedna kanonska varijanta vraća 200, druga jedan izravan permanent redirect;
- nema Apache/WordPress odgovora na finalnom hostu;
- Google MX zapisi ostali su identični;
- `/robots.txt` i `/sitemap.xml` koriste finalnu domenu;
- stari reprezentativni URL-ovi vraćaju očekivani 308/410, bez lanaca i 404 odredišta.

## 5. Poslovni smoke test nakon cutovera

Izvršiti HR i EN gdje postoji prijevod:

1. Naslovnica, navigacija, slike i kontakt.
2. Popis/detail vozila i dostupnost do završnog pregleda bez slanja rezervacije.
3. Shop pretraga/kategorija/detail, košarica i sve dostavne kombinacije bez slanja narudžbe.
4. Supabase prijava, odjava i kontrolirani password recovery za odobren račun.
5. Admin prijava za `info@petroni.hr`; čitanje dashboarda, rezervacija, narudžbi i CMS-a bez nepotrebne izmjene podataka.
6. Kontrolirani kontakt e-mail i primitak na `info@petroni.hr`.
7. Jedna odobrena guest rezervacija/narudžba po poslovnom planu; testne retke označiti i ukloniti ako mogu blokirati raspoloživost.
8. CorvusPay stvarna transakcija isključivo prema fazi 6H-E, uz usporedbu merchant reference, internog statusa, iznosa i e-maila.
9. Vercel logovi, Supabase audit/payment/email događaji i browser konzola bez novih kritičnih grešaka.

Go-live owner potpisuje rezultat ili aktivira rollback.

## 6. Rollback

### A. Regresija samo u novom deploymentu

1. Zaustaviti daljnje deployeve.
2. U Vercelu promovirati zadnji poznati ispravan production deployment.
3. Ne vraćati bazu automatski: stariji kod možda nije kompatibilan s novom migracijom.
4. Ponoviti kritični smoke test i zapisati deployment ID/commit.

### B. DNS/cutover ili kritična poslovna greška

1. Go-live/rollback owner proglašava povrat.
2. DNS operator vraća web zapise na vrijednosti iz neposrednog pre-cutover izvoza. Snimka 31. srpnja bila je `178.218.165.100`, ali mjerodavan je izvoz napravljen neposredno prije promjene.
3. Ne mijenjati MX/TXT/nameservere.
4. Provjeriti da stari WordPress opet poslužuje oba hosta i da e-mail radi.
5. Sačuvati Vercel/Supabase/CorvusPay logove i popis booking/order/payment zapisa nastalih tijekom novog prozora; ne brisati ih naslijepo.
6. Ručno uskladiti korisnike i transakcije koje su nastale prije povratka.

### C. Podatkovni ili platni incident

1. Ograničiti daljnje zahvaćene operacije najbržom sigurnom, reverzibilnom mjerom; po potrebi vratiti web promet na WordPress.
2. Sačuvati audit, payment attempts, Vercel logove i vremenski prozor incidenta.
3. Ne pokretati restore preko aktivne produkcije bez odobrenog recovery plana i provjere svježeg backupa.
4. Postupiti po restore planu iz faze 6H-D i reconciliation planu iz 6H-E.
5. Poslovni vlasnik potvrđuje ispravnost rezervacija, narudžbi, zaliha i uplata prije ponovnog otvaranja.

## 7. Incident klasifikacija

| Razina | Primjer | Prva reakcija |
|---|---|---|
| SEV-1 | Stranica nedostupna, pogrešna naplata, curenje podataka, masovni gubitak rezervacija/narudžbi | Odmah zaustaviti release, obavijestiti go-live ownera, sačuvati dokaze i odlučiti o rollbacku |
| SEV-2 | Booking/shop/admin funkcija ne radi za dio korisnika, e-mailovi ili callbackovi kasne | Ograničiti zahvaćeni tok, otvoriti incident i ispraviti/rollbackati u dogovorenom roku |
| SEV-3 | Sadržaj, pojedinačni redirect, slika ili nekritičan prikaz nije ispravan | Evidentirati, privremeno ublažiti i uključiti u prvi sigurni release |

Za sigurnosni incident ne objavljivati osobne podatke u chat/log sažetku. Petroni kao voditelj obrade odlučuje o pravnoj procjeni i eventualnoj prijavi AZOP-u/korisnicima.

## 8. Završetak rollback razdoblja

WordPress hosting i plaćene licence razmatrati za gašenje tek kada najmanje 30 dana vrijedi sve:

- nema razloga za DNS rollback;
- 404 izvještaj je obrađen i glavni legacy URL-ovi rade;
- booking, shop, plaćanja, e-mail i admin stabilni su;
- postoje neovisni backupi nove baze i Storagea te uspješan test restore;
- potvrđeno je da hosting ne drži DNS, Google mail, arhivu ili drugi Petroni servis;
- Petroni pisano odobrava gašenje i postoji konačna WordPress arhiva.
