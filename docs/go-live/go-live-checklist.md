# Petroni go-live checklist

Status na 31. srpnja 2026.: **NIJE ODOBRENO ZA DNS CUTOVER**. Vercel aplikacija je kandidat za produkciju, ali javna domena namjerno ostaje na WordPressu dok se ne zatvore obvezni gateovi.

Oznake: `[x]` tehnički potvrđeno, `[ ]` otvoreno, `N/A` izričito nije primjenjivo uz razlog.

## Gate A — vlasništvo, hosting i operacije (6H-A)

- [x] Produkcijska arhitektura i Vercel odluka dokumentirani.
- [x] Potvrđeno da javni DNS još pokazuje na WordPress i da Vercel aliasi čekaju cutover.
- [x] Dokumentiran cutover koji čuva Google MX i ostale mail zapise.
- [x] Release, smoke test, rollback i incident runbook dokumentirani.
- [x] Aktivni admini aplikacije potvrđeni: `info@petroni.hr` i `zoezedone@gmail.com`.
- [ ] Petroni je imenovao primarnog i rezervnog ownera za GitHub, Vercel, Supabase, Resend, CorvusPay, DNS/registrar, WordPress hosting i Google mail.
- [ ] Repo je prenesen pod Petroni vlasništvo i više nije javno izložen bez poslovne odluke.
- [ ] Vercel/Supabase/Resend projekt i billing/recovery imaju Petroni ownera i rezervnog administratora.
- [ ] Osoba s DNS pristupom potvrdila je izvoz zone, promjenu samo web zapisa i rollback.
- [ ] WordPress hosting/admin/licence imaju Petroni pristup i imenovanog vlasnika.

## Gate B — legacy URL-ovi i SEO (6H-B)

- [x] Zamrznuto je svih 14 starih Yoast/WooCommerce sitemapova: 3.638 zapisa i 3.636 jedinstvenih URL-ova.
- [ ] Iz starog Search Console propertyja izvezeni su top landing, linked i postojeći 404 URL-ovi te uspoređeni s auditom.
- [x] Svaki sitemap URL ima postojeći canonical, jedan 308 cilj ili eksplicitnu 410 odluku.
- [x] Posebno su pokriveni `/en/*`, stari članci, proizvodi, kategorije, vozila, autori i taxonomy query URL-ovi.
- [x] Automatski test potvrđuje da nema nepokrivenih URL-ova, loopova i redirect lanaca.
- [x] Implementiran je strukturirani javni 404 zapis, CSV sažetak i dnevni 30-dnevni postupak.
- [x] Dokumentiran je finalni sitemap/canonical/Search Console postupak nakon DNS cutovera.

## Gate C — privatnost i pravni sadržaj (6H-C)

- [x] Google fontovi i HR/EN zastavice poslužuju se lokalno bez Google/Flagcdn zahtjeva.
- [x] BoxNow se učitava tek nakon odabira metode i klika za otvaranje službene karte.
- [x] Browser storage/cookie inventar odgovara kodu i ugrađenoj početnoj politici; nema analitike ni marketing piksela.
- [x] Za svih pet pravnih dokumenata implementirani su zaštićeni HR/EN nacrti, datum primjene, povijest, zasebna objava i restore bez gubitka povijesti.
- [ ] Migracija `0038_phase6h_legal_documents.sql` primijenjena je na produkcijski Supabase i admin/browser ponašanje ručno je potvrđeno.
- [ ] Politika privatnosti, kolačići, uvjeti kupnje, plaćanje/dostava i reklamacije imaju konačne odobrene HR/EN verzije.
- [ ] Petroni/pravni savjetnik odobrio je tekstove; tehnički tim nije prikazan kao pravni jamac.

## Gate D — backup i restore (6H-D)

- [ ] Potvrđen je Supabase backup retention/PITR status i odgovorna osoba.
- [ ] Automatiziran je šifrirani logički backup baze izvan aktivnog Supabase projekta.
- [ ] Automatiziran je zaseban backup Supabase Storage objekata i metapodataka.
- [ ] Dokumentirano je sigurno čuvanje/recovery environment varijabli bez commita tajni.
- [ ] Testni restore baze i Storagea uspješno je proveden u odvojenom okruženju.
- [ ] Evidentirani su trajanje restorea, rezultat i kvartalni raspored ponavljanja.

## Gate E — CorvusPay (6H-E)

- [ ] Merchant dokumentacija i produkcijski callback URL-ovi potvrđeni su s CorvusPayem.
- [ ] Request/callback potpisi i server-to-server provjera prolaze kontrolirane testove.
- [ ] Postoji periodična provjera/reconciliation i alarm za naplaćeno, a neažurirano plaćanje.
- [ ] Jedna odobrena stvarna transakcija uspoređena je u CorvusPayu, Supabaseu, adminu i e-mailu.
- [ ] Dokumentirani su refund/cancel i ručni recovery postupci; kartični podaci nisu u Petroni sustavu.

## Gate F — sadržaj i mediji (6H-F)

- [ ] Admin ima siguran upload/medijsku knjižnicu s optimizacijom, alt tekstom i evidencijom izvora/licence.
- [ ] Kritični CMS moduli imaju draft/preview/verzije i kontrolirani restore.
- [ ] Potvrđeni su vlasništvo i izvor svih produkcijskih slika; sporne slike su zamijenjene ili odobrene.
- [ ] Izvorne fotografije i manifesti imaju Petroni-owned arhivu izvan developerskog računala.

## Završni release i cutover

- [ ] Dogovoren je datum, mirni poslovni prozor i imenovane su sve uloge iz runbooka.
- [ ] Napravljen je zadnji WooCommerce freeze/sync i Supabase je proglašen autoritativnim katalogom.
- [ ] `npm test`, `npm run check` i `npm run build` prolaze na točnom release commitu.
- [ ] Produkcijske migracije i environment nazivi provjereni su bez izlaganja tajni.
- [ ] WordPress baza, `wp-content`, DNS zona, plugin/licence i trenutni web zapisi arhivirani su.
- [ ] TTL web zapisa smanjen je unaprijed; MX/TXT zapisi ostaju netaknuti.
- [ ] Vercel deployment je `Ready` i smoke test na Vercel aliasu prolazi.
- [ ] Go-live owner izdao je odluku **KRENI**.
- [ ] Nakon DNS promjene prošli su tehnički, poslovni, e-mail i platni smoke testovi.
- [ ] Zabilježeni su commit, deployment ID, DNS vrijednosti, vrijeme i potpis rezultata.
- [ ] Dogovoreni su 30-dnevni 404/incident nadzor i najmanje 30 dana WordPress rollbacka.

## Potpisi

| Uloga | Ime | Odluka | Datum/vrijeme |
|---|---|---|---|
| Petroni go-live owner |  | KRENI / STANI |  |
| Release developer |  | tehnički prolaz / pad |  |
| DNS operator |  | zona i rollback potvrđeni |  |
| Poslovni tester |  | poslovni prolaz / pad |  |
| Payment tester |  | CorvusPay prolaz / pad |  |
| Incident/rollback owner |  | spremnost potvrđena |  |
