# Privatnost, browser pohrana i vanjski resursi

Tehnički audit: 31. srpnja 2026.
Opseg: Phase 6H-C, trenutni SvelteKit runtime i migracija `0038_phase6h_legal_documents.sql`.

Ovaj dokument je tehnički inventar, ne pravno mišljenje niti jamstvo usklađenosti. Petroni i imenovani pravni savjetnik odobravaju konačne HR/EN tekstove i poslovne rokove.

## Ishod audita

- Poppins fontovi više ne kontaktiraju Google; 12 potrebnih Latin/Latin Extended WOFF2 datoteka poslužuje aplikacija.
- HR/EN zastavice više ne kontaktiraju Flagcdn; lokalne su u `static/flags/`.
- BoxNow skripta i iframe ne učitavaju se pri ulasku u checkout niti samim odabirom metode. Preglednik kontaktira BoxNow tek nakon klika **Odaberi paketomat na karti**.
- Google Analytics, marketinški pikseli, oglasne skripte i ugrađeni Google Maps nisu pronađeni.
- Uvedene su odvojene, verzionirane HR/EN stranice za privatnost, kolačiće, uvjete webshopa, plaćanje/dostavu i reklamacije/povrat.
- Admin pravnih dokumenata ne dopušta izravno prepisivanje objavljenog teksta: spremanje stvara nacrt, objava je zasebna akcija, a restore kopira staru verziju u novi nacrt.
- Sav uneseni Markdown prolazi kroz renderer koji escapira proizvoljni HTML prije prikaza.

## Kolačići i browser pohrana

| Mehanizam | Ključ / vrsta | Sadržaj | Trajanje | Svrha |
|---|---|---|---|---|
| Cookie | Supabase Auth cookieji, naziv određuje Supabase SSR | potpisana sesija/tokeni | prema Supabase sesiji | prijava korisnika i administratora |
| Cookie | `petroni_password_recovery_intent` | kontekst account/admin | najviše 20 minuta, HttpOnly, SameSite=Lax, Secure na HTTPS-u | povezivanje zahtjeva i PKCE recovery callbacka u istom pregledniku |
| Cookie | `petroni_password_recovery` | oznaka dopuštene recovery sesije | najviše 20 minuta, HttpOnly, SameSite=Lax, Secure na HTTPS-u | pristup stranici za postavljanje nove lozinke |
| localStorage | `petroni_locale` | `hr` ili `en` | do brisanja | korisnikov jezik |
| localStorage | `petroni_cart` | ID, slug, naziv, cijena, slika, količina i stanje proizvoda | do pražnjenja/brisanja | košarica bez obavezne prijave |
| sessionStorage | `petroni_booking` | nacrt rezervacije, uključujući podatke vozača nakon unosa | do zatvaranja kartice/brisanja | nastavak nedovršene rezervacije u istoj kartici |
| sessionStorage | `petroni_booking_result` | kratkotrajna potvrda, upute i bankovne uplatnice | do zatvaranja kartice/brisanja | success prikaz nakon slanja rezervacije |
| sessionStorage | `petroni_order_result` | kratkotrajna potvrda i upute narudžbe | do zatvaranja kartice/brisanja | success prikaz nakon checkouta/platnog povratka |

Nema neobavezne analitike ili marketinga, pa tehnička implementacija ne prikazuje privolu koja bi sugerirala izbor za alate koji ne postoje. Ako se kasnije uvede neobavezni alat, mora se dodati u ovaj inventar i blokirati do odgovarajućeg korisničkog izbora prije produkcijskog uključivanja.

## Mrežni zahtjevi i trenutak aktivacije

### Učitavaju se za rad aplikacije

- Vercel poslužuje aplikaciju, lokalne fontove, zastavice i statičke datoteke.
- Supabase prima serverske upite aplikacije i Auth zahtjeve. Javni mediji/obrazac za povrat mogu se poslužiti iz Petroni Supabase Storagea.
- Slike proizvoda koje još pokazuju na Petroni WordPress host ili Supabase Storage učitavaju se uz prikaz relevantnog proizvoda. Njihov konačni Petroni-owned arhiv i media migration dio su Phase 6H-F.

### Učitavaju se tek nakon korisnikove akcije

- BoxNow: tek nakon odabira BoxNow dostave i klika za otvaranje karte.
- CorvusPay: browser odlazi na hosted checkout tek nakon slanja narudžbe/rezervacije s kartičnim plaćanjem; status provjera je server-to-server.
- Google Maps, Facebook, Instagram, partneri i Njuškalo: samo kao obične vanjske poveznice nakon klika.
- Resend/email infrastruktura: server-side tek kada aplikacija šalje transakcijsku poruku; nema browser skripte.

## Pravni CMS i kontrola objave

Dokumenti:

| Ključ | Javna ruta |
|---|---|
| `privacy` | `/privatnost` |
| `cookies` | `/kolacici` |
| `shop_terms` | `/uvjeti-poslovanja` |
| `delivery_payment` | `/placanje-dostava` |
| `returns_complaints` | `/reklamacije-povrat` |

Zaštićeni admin je na `/admin/pravni-dokumenti`. Browser nema write policy za tablice. Serverske akcije zahtijevaju aktivnog administratora i koriste service-role RPC funkcije. Svaka akcija stvara zapis u postojećem `admin_events` auditu.

Životni ciklus:

1. **Spremi novi nacrt** arhivira prethodni nacrt, ali ne mijenja javnu verziju.
2. **Objavi nacrt** arhivira prethodno objavljenu verziju i atomarno objavljuje novi HR/EN tekst.
3. **Vrati kao nacrt** kopira odabranu staru verziju u novi nacrt; nikada ne briše ni ne prepisuje povijest.
4. Datum početka primjene i oznaka verzije prikazuju se na javnoj stranici.
5. Migracijski početni tekst je izričito označen `technical-baseline`; Petroni/legal ga mora odobriti ili zamijeniti prije go-live potpisa.

## Obvezni ručni test nakon migracije 0038

1. Prijaviti se kao administrator i otvoriti svih pet dokumenata.
2. Na jednom dokumentu spremiti testni HR/EN nacrt i potvrditi da javna stranica ostaje nepromijenjena.
3. Objaviti odobreni nacrt i provjeriti HR/EN naslov, sadržaj, verziju i datum na javnoj ruti.
4. Stariju verziju vratiti kao nacrt i potvrditi da javna verzija opet ostaje nepromijenjena.
5. Objaviti samo stvarno odobrenu verziju ili testni nacrt ostaviti neobjavljenim.
6. U privatnom prozoru otvoriti početnu, checkout bez BoxNow klika i svih pet pravnih ruta; u Network panelu potvrditi da nema Google Fonts, Flagcdn, BoxNow, analytics ili marketing zahtjeva.
7. Odabrati BoxNow i kliknuti kartu; tek tada očekivati `widget-cdn.boxnow.hr` i BoxNow iframe zahtjeve.

## Otvoreni go-live potpisi

- Petroni potvrđuje identitet voditelja obrade, kontakte, pružatelje, stvarne rokove čuvanja i poslovne postupke.
- Pravni savjetnik potvrđuje HR tekstove, EN značenje/prijevod, potrošačke uvjete, povrate, prigovore i pravne osnove.
- Petroni potvrđuje datum početka primjene svake verzije.
- Tek nakon tih potpisa Gate C može biti označen potpuno zatvorenim.
