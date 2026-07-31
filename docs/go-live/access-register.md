# Registar vlasništva i produkcijskih pristupa

Zadnja tehnička provjera: 31. srpnja 2026.

Klasifikacija: interni operativni dokument bez tajni

## Pravila

- Produkcijski servis mora imati Petroni-owned vlasnički račun i najmanje jednog rezervnog vlasnika/administratora.
- Osobni developerski račun može ostati suradnik, ali ne smije biti jedina točka pristupa ili oporavka.
- Admin aplikacije nije isto što i pristup Supabase/Vercel/GitHub konzoli.
- Lozinke, ključevi, recovery kodovi i vrijednosti environment varijabli ne upisuju se u Git, ovaj dokument, e-mail ili chat.
- Tajne se predaju kroz Petroni password manager ili vlasnički servis, zatim se rotiraju i provjerava se da stara vrijednost više ne radi.

## Registar

| Sustav | Potvrđeno stanje | Ciljno stanje | Status / sljedeća radnja |
|---|---|---|---|
| GitHub | Javni repo `mijomajic/petroni-hr`; jedini potvrđeni collaborator/administrator je `mijomajic` | Petroni organizacija kao vlasnik, privatni repo, dva Petroni ownera, developer s potrebnim ovlastima | **Otvoreno:** osnovati/imenovati Petroni GitHub organizaciju i prenijeti repo; nakon transfera provjeriti deploy vezu |
| Vercel | Projekt `petroni-hr` u timu `mijos-projects`; potvrđeni CLI korisnik `zoezedone-5809` | Petroni tim s dva vlasnička člana; developer kao član; billing/recovery pod Petronijem | **Otvoreno:** imenovati Petroni račune i provesti transfer projekta/domene bez prekida deploya |
| Supabase | Projekt `Petroni`, `ACTIVE_HEALTHY`, regija `eu-west-1`; konzolni vlasnici nisu formalno evidentirani | Petroni owner, rezervni owner/admin i developer s najmanjim potrebnim ovlastima | **Otvoreno:** imenovati članove, dodati ih kroz Supabase Access Control i provjeriti prijavu |
| Resend | Produkcijske varijable postoje u Vercelu; vlasnički članovi nisu potvrđeni ovim auditom | Petroni owner + rezervni admin; verificirana Petroni domena/sender | **Otvoreno:** evidentirati račun, članove, domenu, billing i recovery; ne kopirati API ključ u registar |
| CorvusPay | Produkcijske varijable postoje u Vercelu; hosted checkout je tehnički integriran | Petroni merchant owner i najmanje dva ovlaštena poslovna kontakta | **Otvoreno:** evidentirati merchant administratore i dokumentaciju; stvarni test pripada fazi 6H-E |
| DNS/registrar | DNS je na `ns1.mojsite.com` / `ns2.mojsite.com`; registrar i osobe s pristupom nisu formalno evidentirani | Dva Petroni pristupa, poznat registrar, recovery i billing kontakt | **Blokira cutover:** imenovati osobu koja može izvesti zonu, promijeniti web A zapise i napraviti rollback |
| WordPress hosting | Trenutačno poslužuje javni `petroni.hr`; upravljački pristupi i licence nisu u ovom registru | Petroni vlasnički pristup i potpuna arhiva tijekom rollback razdoblja | **Otvoreno:** evidentirati hosting, SFTP/panel, backup i licence; ne gasiti najmanje 30 dana nakon cutovera |
| Google mail/DNS | MX zapisi za Petroni domenu vode na Google | Dva Petroni Google administratora i dokumentiran recovery | **Zaštititi:** web cutover ne smije mijenjati MX/SPF/DKIM/DMARC |
| Admin aplikacije | Aktivni admini: `info@petroni.hr` i `zoezedone@gmail.com` | Najmanje dva imenovana poslovna admina; osobni recovery admin ukloniti tek nakon provjerenog Petroni pristupa | **Djelomično:** oba računa su aktivna; Petroni treba potvrditi tko ostaje nakon handovera |
| Domenski poslovni e-mail | Operativni kontakt aplikacije je `info@petroni.hr` | Petroni-owned inbox s najmanje dvije odgovorne osobe ili delegiranim pristupom | **Za potvrdu:** provjeriti primitak booking, order, kontakt i security poruka |
| Backup arhiva i ključ | Prvi encrypted artifact i odvojeni ključ postoje lokalno; restore dokaz je prošao | Petroni-owned off-site spremište, primarni i rezervni owner, ključ u Petroni password manageru, aktivan scheduler | **Otvoreno:** imenovati ownere i konačnu lokaciju; lokalna developerska kopija nije dovoljna za poslovni gate |

## Podaci koje Petroni mora upisati izvan javnog repozitorija

Voditi u internom password manageru ili sigurnom vlasničkom registru:

| Sustav | Primarni vlasnik | Rezervni vlasnik | Billing kontakt | Recovery metoda | Zadnja provjera |
|---|---|---|---|---|---|
| GitHub | upisati | upisati | upisati | upisati | datum |
| Vercel | upisati | upisati | upisati | upisati | datum |
| Supabase | upisati | upisati | upisati | upisati | datum |
| Resend | upisati | upisati | upisati | upisati | datum |
| CorvusPay | upisati | upisati | upisati | upisati | datum |
| DNS/registrar | upisati | upisati | upisati | upisati | datum |
| WordPress hosting | upisati | upisati | upisati | upisati | datum |
| Google Workspace/mail | upisati | upisati | upisati | upisati | datum |

## Postupak sigurne predaje

Za svaki servis, ovim redom:

1. Petroni imenuje primarni i rezervni poslovni račun s uključenim MFA-om.
2. Postojeći administrator poziva oba računa kroz službeni members/access ekran servisa.
3. Petroni se prijavljuje i potvrđuje da vidi točan projekt, billing, logove i recovery postavke.
4. Vlasništvo/billing se prenosi na Petroni gdje servis to podržava.
5. Produkcijske tajne se rotiraju kroz servis i Vercel; vrijednosti se ne šalju između osoba u čistom tekstu.
6. Pokreće se smoke test bez stvarne kupnje, osim kontroliranog CorvusPay testa u fazi 6H-E.
7. Developerske ovlasti se svode na najmanje potrebne. Stari pristup uklanja se tek nakon uspješne provjere i dogovorenog recovery prozora.
8. U internom registru bilježe se datum, izvršitelj i osoba koja je provjerila rezultat.

## Kvartalna provjera i offboarding

- Svaka tri mjeseca pregledati članove svih osam sustava, neaktivne tokene, billing/recovery kontakte i aktivne admine aplikacije.
- Pri odlasku osobe prvo osigurati drugog ownera, zatim ukloniti članstvo, opozvati osobne tokene/sesije i rotirati dijeljene tajne kojima je osoba mogla pristupiti.
- Nakon svake promjene administratora aplikacije provjeriti `admin_users`, a promjenu provesti kroz novu migraciju ili zaštićenu administratorsku operaciju; ne brisati audit povijest.
