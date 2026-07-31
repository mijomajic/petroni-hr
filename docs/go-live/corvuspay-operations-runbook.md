# CorvusPay operacije, reconciliation i produkcijski test

Ovaj je dokument operativni izvor istine za fazu 6H-E. Petroni aplikacija nikada ne prima, sprema ni zapisuje broj kartice, CVV ili 3-D Secure podatke; kupac ih unosi isključivo na CorvusPay hostanoj formi.

## Potvrđeno stanje 31. srpnja 2026.

- Kanonski application origin u Vercelu je `https://petroni.hr` (bez `www`). Javni DNS još poslužuje stari WordPress pa finalni callbackovi ne smiju biti aktivirani prije cutovera.
- Produkcijski nazivi `CORVUSPAY_STORE_ID`, `CORVUSPAY_SECRET_KEY` i `CORVUSPAY_ENV` postoje u Vercelu, ali njihove su vrijednosti prazne. Kartično plaćanje zato je sigurno nedostupno.
- `CRON_SECRET` je postavljen u Vercel Production.
- CorvusPay status endpoint traži merchant mTLS certifikat. Testni poziv bez certifikata završio je TLS handshake odbijanjem, u skladu s CorvusPay API dokumentacijom.
- Migracija `0039_phase6h_corvuspay_reconciliation.sql` primijenjena je na produkcijski Supabase.

## Vjerodajnice i callback URL-ovi

Payment owner iz Petronija/Monija mora kroz CorvusPay dobiti i u Petroni password manager spremiti:

- produkcijski Store ID, Secret Key i potvrdu da je point of sale aktivan;
- merchant API klijentski certifikat, privatni ključ, eventualni passphrase i datum isteka;
- pristup produkcijskom i testnom Merchant Portalu s MFA-om;
- aktualnu merchant integracijsku dokumentaciju za ugovoreni profil.

Vercel Production koristi:

- `CORVUSPAY_STORE_ID`
- `CORVUSPAY_SECRET_KEY`
- `CORVUSPAY_ENV=production`
- `CORVUSPAY_API_CERT_PEM`
- `CORVUSPAY_API_KEY_PEM`
- `CORVUSPAY_API_KEY_PASSPHRASE` samo ako je ključ šifriran
- `CRON_SECRET`

Za kontrolirani test prije DNS cutovera u Merchant Portalu privremeno postaviti:

- Success URL: `https://petroni-hr.vercel.app/api/corvuspay/callback`
- Cancel URL: `https://petroni-hr.vercel.app/api/corvuspay/cancel`

Neposredno prije aktiviranja kartica na finalnoj domeni, nakon DNS cutovera, promijeniti na:

- Success URL: `https://petroni.hr/api/corvuspay/callback`
- Cancel URL: `https://petroni.hr/api/corvuspay/cancel`

`www` se ne koristi dok se izričito ne promijeni kanonska odluka. Nakon svake promjene spremiti screenshot Merchant Portala bez tajni i HTTP smoke dokaz za oba URL-a.

## Sigurnosni model

- Checkout parametri potpisuju se HMAC-SHA256 potpisom prema merchant dokumentaciji; `order_number` je kratka reverzibilna referenca vezana uz serverom stvoreni UUID.
- Success callback prihvaća samo valjan CorvusPay potpis. Ako potpisani redirect nije dostupan, status se provjerava mTLS server-to-server pozivom i prihvaćaju se samo `authorized` ili `completed`.
- Cancel callback nije dokaz otkazivanja poslovnog zapisa. On samo zapisuje da se kupac vratio preko Cancel URL-a; ne otkazuje narudžbu, ne oslobađa robu i ne šalje email o poslovnom otkazu.
- Povrat, storno i ručno povezivanje ne izvršavaju se automatski iz Petronija. Administrator ih prvo radi/provjerava u Merchant Portalu, zatim ih zapisuje u adminu kao audit događaj.

## Automatska dnevna kontrola

Vercel poziva `/api/cron/corvuspay-reconciliation` svaki dan u 05:15 UTC i šalje `Authorization: Bearer <CRON_SECRET>`. Ruta:

1. uzima CorvusPay redirect pokušaje stare najmanje deset minuta iz zadnjih 30 dana i sve otvorene incidente;
2. dohvaća status preko merchant mTLS API-ja;
3. uspoređuje `authorized/completed` s lokalnim statusom odgovarajuće rate ili narudžbe;
4. zapisuje run, pokušaj provjere i trajni incident u Supabase;
5. šalje deduplicirani admin alarm kada se provider i Petroni ne podudaraju;
6. ne mijenja lokalni status automatski.

Ako API certifikat nije konfiguriran ili lookup ne uspije, incident je `warning/lookup_failed`. Ako je jedna strana plaćena, a druga nije, incident je `critical`. Admin na detalju rezervacije/narudžbe ima **Provjeri na CorvusPayu** i popis otvorenih/riješenih incidenata.

## Ručno povezivanje i incident

1. Otvoriti rezervaciju ili narudžbu u Petroni adminu.
2. Kopirati punu `provider_reference`; ne uparivati samo po imenu ili iznosu.
3. U Merchant Portalu provjeriti istu referencu, iznos, valutu, status, vrijeme i approval code.
4. Kliknuti **Provjeri na CorvusPayu**. Ako automatski lookup nije dostupan, ne nagađati status.
5. Ako je CorvusPay `authorized/completed`, a Petroni nije plaćen, tek nakon ručne provjere spremiti lokalni status plaćanja. Shop stock commit mora uspjeti.
6. U bloku **Ručna CorvusPay operacija** zapisati `Ručno povezivanje`, iznos, rezultat i kratku potvrdu iz portala. Ovaj obrazac ne izvršava financijsku operaciju.
7. Ponoviti provjeru; incident se automatski zatvara kada se statusi podudaraju.
8. Ako iznos/referenca ne odgovaraju, ne mijenjati zapis; označiti P1 incident i uključiti payment ownera/CorvusPay podršku.

## Otkazivanje, storno i povrat

- Otkazivanje rezervacije/narudžbe u Petroniju nije povrat novca.
- `Cancellation`/storno koristi se samo za aktivnu predautorizaciju; `Refund`/povrat koristi se za već autoriziranu ili kompletiranu naplatu.
- U Merchant Portalu odabrati točnu referencu i puni ili djelomični iznos. Druga osoba provjerava podatke prije potvrde za veće iznose.
- Nakon odgovora providera u Petroni adminu zapisati vrstu, iznos, `requested/completed/failed` i potvrdu. Lokalni povijesni status plaćanja ne vraća se na `unpaid` jer bi se izgubila činjenica da je naplata postojala.
- Kupcu slati potvrdu povrata tek nakon provider potvrde. CorvusPay navodi da knjiženje kupcu ovisi o banci i može trajati 1–28 dana.
- Ako banka odbije refund, sačuvati provider rezultat i eskalirati banci/CorvusPayu; ne označavati kao izvršeno.

## Kontrolirana stvarna transakcija

Izvršava se samo uz neposrednu potvrdu payment ownera za točan predmet i iznos:

1. potvrditi produkcijske vjerodajnice, mTLS certifikat, privremene Vercel callbackove i aktivan merchant profil;
2. odabrati najniži smisleni stvarni artikl/uslugu te unaprijed dogovoriti ostaje li kupnja ili se radi refund;
3. zabilježiti vrijeme i očekivani iznos, bez kartičnih podataka;
4. korisnik osobno unosi karticu na CorvusPay stranici i završava 3-D Secure;
5. usporediti istu referencu i iznos u Merchant Portalu, `payment_attempts`, poslovnom zapisu, adminu i email zapisima;
6. kliknuti ručnu CorvusPay provjeru i pokrenuti zaštićeni reconciliation endpoint;
7. provjeriti da nema otvorenog incidenta, duplog emaila, duplog stock commita ni kartičnih podataka u logovima;
8. payment owner upisuje prolaz/pad i vrijeme u go-live checklistu; dogovoreni refund vodi se prethodnim postupkom.

Trenutačno se ovaj test ne može pokrenuti jer produkcijske merchant vrijednosti i API certifikat nisu dostavljeni.

## Autoritativni izvori

- [CorvusPay FAQ — callbackovi, status, refund i operativni statusi](https://www.corvuspay.com/cesto-postavljana-pitanja/)
- [CorvusPay API integracija — mTLS certifikat i upravljanje transakcijama](https://www.corvuspay.com/poslovni/api-integracija/)
- Merchant-specifična integracijska dokumentacija iz Portala ima prednost za točna polja i ugovoreni profil.
