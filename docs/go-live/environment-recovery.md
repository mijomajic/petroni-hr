# Environment i recovery tajni

Ovaj dokument sadrži samo nazive i postupak. Vrijednosti produkcijskih tajni ne smiju biti u Gitu, e-mailu, chatu, restore dokazu ni običnom backup manifestu.

## Izvori istine

| Skup | Autoritativni izvor | Recovery |
|---|---|---|
| Vercel Production/Preview | Petroni-owned Vercel projekt | Dva ownera izvoze popis naziva i potvrđuju scope; vrijednosti se čuvaju u Petroni password manageru |
| Supabase URL i javni ključ | Petroni Supabase Project Settings | Ponovno preuzeti iz konzole; service-role ključ rotirati ako je izgubljen ili izložen |
| Resend | Petroni Resend račun | Izdati novi API ključ, ažurirati Vercel i opozvati stari |
| CorvusPay | Petroni merchant račun/dokumentacija | Merchant owner izdaje/rotira vjerodajnice; zatim obvezan kontrolirani test iz 6H-E |
| DNS i domena | Registrar/DNS panel | Dva Petroni ownera, MFA/recovery kodovi u password manageru; web cutover ne mijenja mail zapise |
| Backup enkripcijski ključ | Petroni password manager, odvojeno od backup arhive | Primarni i rezervni owner testiraju dohvat kvartalno; gubitak ključa znači da je arhiva neupotrebljiva |

## Potrebne aplikacijske varijable

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `PUBLIC_SITE_URL`
- `PUBLIC_BOXNOW_PARTNER_ID` kada je dodijeljen
- `SUPABASE_SERVICE_KEY`
- `CORVUSPAY_STORE_ID`
- `CORVUSPAY_SECRET_KEY`
- `CORVUSPAY_ENV`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Prije restore testa usporediti samo nazive i scopeove (`Production`, `Preview`, `Development`). Vrijednosti se ne ispisuju u log. Nakon stvarnog incidenta obnovljene/rotirane vrijednosti upisuju se izravno u servis i Vercel te se pokreće smoke test.

## Opcionalna šifrirana recovery kopija

`npm run backup:production` može uključiti operatorovu datoteku preko `PETRONI_RECOVERY_SECRETS_FILE`. Alat prihvaća samo apsolutnu putanju izvan repozitorija i dozvole `600`; datoteka tada ulazi isključivo u AES-256-GCM šifriranu arhivu. To nije zamjena za Petroni password manager i ne uključuje se automatski.
