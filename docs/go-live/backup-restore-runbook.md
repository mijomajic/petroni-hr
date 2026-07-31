# Backup i restore runbook

Zadnja tehnička provjera: 31. srpnja 2026.

## Potvrđeno produkcijsko stanje

- Projekt: Supabase `Petroni`, regija `eu-west-1`.
- Supabase fizički backup mehanizam (`walg`) je uključen, ali CLI ne prikazuje dostupnu fizičku backup točku.
- PITR je isključen.
- Remote migration ledger je 31. srpnja 2026. poravnat s već primijenjenim lokalnim migracijama `0001`–`0038`; `supabase db push --dry-run` potvrđuje `Remote database is up to date`.
- Database backup ne sadrži stvarne Supabase Storage objekte, zato ih ovaj postupak preuzima zasebno.
- Na dan testa Storage ima jedan bucket `petroni-assets`, 3.280 objekata i 178.711.614 bajtova metapodataka.

Native retention i eventualna promjena plana ostaju poslovna potvrda Supabase ownera. Neovisni backup ispod ne ovisi o native restore točki.

## Preduvjeti

1. Supabase CLI je prijavljen Petroni owner/developer računom ili postoji `SUPABASE_ACCESS_TOKEN` u sigurnom scheduleru.
2. PostgreSQL 17 client/server alati postoje (`brew install postgresql@17`). Ne pokreće se trajni servis.
3. `PETRONI_SUPABASE_PROJECT_REF` pokazuje na odobreni projekt.
4. `PETRONI_BACKUP_DIR` je privatna mapa izvan Git repozitorija.
5. `PETRONI_BACKUP_PASSPHRASE_FILE` je izvan repozitorija, ima dozvole `600` i njegovu kopiju čuvaju Petroni primarni i rezervni owner u password manageru.

## Izrada backupa

```bash
cd /putanja/do/petroni-app
export PETRONI_SUPABASE_PROJECT_REF='odobreni-project-ref'
export PETRONI_BACKUP_DIR='/Petroni-owned/backup-lokacija'
export PETRONI_BACKUP_PASSPHRASE_FILE='/sigurna/lokacija/backup-passphrase'
npm run backup:production
```

Alat:

- potvrđuje linked project ref;
- izvozi role, public schema, Auth/Storage managed schema i sve podatke, uključujući Auth i Storage metapodatke;
- preuzima svaki Storage bucket zasebno;
- uspoređuje remote i lokalni popis objekata;
- zapisuje SHA-256 za svaku datoteku;
- pakira sadržaj i šifrira ga AES-256-GCM ključem izvedenim kroz scrypt;
- ostavlja samo `.tar.gz.enc` i njegov `.sha256`; privremeni plaintext se briše.

## Izolirani restore test

```bash
export PETRONI_BACKUP_PASSPHRASE_FILE='/sigurna/lokacija/backup-passphrase'
npm run backup:restore-test -- '/Petroni-owned/backup-lokacija/petroni-....tar.gz.enc'
```

Restore test dekriptira u privatnu privremenu mapu, provjerava sve hashove, pokreće privremeni PostgreSQL 17 na slobodnom lokalnom portu, vraća Auth/Storage/public sheme i podatke, uspoređuje broj redaka svake tablice te provjerava sve Storage objekte i bajtove. Na kraju zaustavlja i briše izoliranu bazu/plaintext te ostavlja samo nesenzitivni `*.restore-evidence.json`.

Ovo je dokaz oporavljivosti podataka i Storage objekata, ne produkcijski overwrite postupak. Stvarni incident prvo se vraća u novi Supabase projekt, provjerava aplikacijom i tek zatim preusmjerava promet. Nikada ne pokretati restore preko aktivne produkcije.

## Raspored, retention i odgovornost

- Automatizirani encrypted backup: dnevno nakon poslovnog dana.
- Retention: 14 dnevnih, 8 tjednih i 12 mjesečnih kopija, uz najmanje jednu kopiju na Petroni-owned lokaciji izvan developerskog računala.
- Restore test: kvartalno i nakon veće promjene sheme/Storage postupka.
- Svaki test bilježi artifact hash, vrijeme, trajanje, broj tablica/redaka/objekata, rezultat i dvije osobe koje su provjerile.
- Primarni i rezervni backup owner, konačna objektna lokacija i scheduler još moraju biti imenovani u Petroni internom registru.

## Prvi restore dokaz — 31. srpnja 2026.

- Artifact: `petroni-2026-07-31T15-44-37-698Z.tar.gz.enc`
- Encrypted veličina: 173.814.327 bajtova
- SHA-256: `a99863a1a7b592548dfa7ff8bfb0bc7ca815796597c7d368c716123e0e00b12d`
- Baza: 55 tablica i 5.814 redaka uspoređeno s manifestom
- Storage: `petroni-assets`, 3.280/3.280 objekata i 178.711.614 bajtova provjereno
- Izolirani restore: PostgreSQL 17 na privremenom lokalnom portu, bez produkcijskih mutacija
- Trajanje: 4,7 sekundi od dekripcije do potvrđenog rezultata
- Rezultat: `pass`
- Recovery secrets datoteka nije bila uključena; environment recovery ostaje u password manageru prema zasebnom postupku.

Lokalni artifact i ključ su odvojeni, ali to još nije Petroni-owned off-site kopija. Prije zatvaranja poslovnog gatea Petroni mora imenovati primarnog/rezervnog ownera, odabrati vlasničku off-site lokaciju i aktivirati scheduler.

## Incidentni redoslijed

1. Zaustaviti mutacije ili prebaciti aplikaciju u maintenance način ako je gubitak podataka aktivan.
2. Sačuvati trenutno stanje i logove; ne prepisivati jedinu kopiju.
3. Odabrati zadnju valjanu arhivu prema SHA-256 i vremenu.
4. Vratiti u izolirani Supabase projekt, uključujući Storage objekte i metapodatke.
5. Rotirati/obnoviti environment vrijednosti prema `environment-recovery.md`.
6. Pokrenuti tehnički i poslovni smoke test, zatim odobriti kontrolirani cutover.
7. Zabilježiti uzrok, RPO, RTO, izgubljene/promijenjene zapise i korektivne mjere.
