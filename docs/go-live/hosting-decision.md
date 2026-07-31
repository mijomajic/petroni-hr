# ADR-001 — produkcijski hosting i domena

Datum odluke: 31. srpnja 2026.

Status: prihvaćeno za go-live pripremu

Vlasnik poslovne odluke: Petroni

Tehnička provedba: imenovani developer uz osobu s DNS pristupom

## Odluka

Nova Petroni aplikacija ostaje na Vercelu. Finalne domene `petroni.hr` i `www.petroni.hr` povezuju se na postojeći Vercel projekt tek nakon zatvaranja go-live checkliste.

Ostali produkcijski servisi ostaju specijalizirane vanjske usluge:

| Sloj | Produkcijski servis | Napomena |
|---|---|---|
| Javni web, server i admin | Vercel, projekt `petroni-hr` | SvelteKit aplikacija i serverske rute |
| Baza, Auth i Storage | Supabase, projekt `Petroni`, EU (`eu-west-1`) | Poslovni podaci, računi i datoteke |
| Transakcijski e-mail | Resend | Sender mora ostati verificiran za Petroni domenu |
| Kartice | CorvusPay hosted checkout | Petroni ne prima ni ne sprema PAN/CVC |
| DNS | Trenutačni DNS provider na `mojsite.com` nameserverima | U cutoveru mijenjaju se samo web zapisi |
| E-mail sandučići | Google MX zapisi na Petroni domeni | Izvan opsega web cutovera; moraju ostati netaknuti |

## Potvrđeno stanje 31. srpnja 2026.

- Vercel deployment je `Ready`, a projektu su dodani aliasi `petroni.hr`, `www.petroni.hr` i `petroni-hr.vercel.app`.
- Javni `petroni.hr` preusmjerava na `www.petroni.hr`, a obje web adrese još poslužuje Apache/WordPress na adresi `178.218.165.100`.
- Vercel prijavljuje da finalne domene nisu pravilno usmjerene. U aktualnim Vercel uputama za oba hosta traži se A zapis na `76.76.21.21`.
- Nameserveri su `ns1.mojsite.com` i `ns2.mojsite.com`; MX zapisi vode na Google mail infrastrukturu.

IP vrijednosti iznad su snimka stanja, a ne trajna konfiguracijska konstanta. Neposredno prije promjene ponovno pročitati vrijednosti u Vercel Domain Settings i izvesti trenutačnu DNS zonu.

## Razlozi

- Aplikacija je izgrađena i testirana za `@sveltejs/adapter-vercel`.
- Postojeći deployment, environment varijable, preview i rollback tijek već rade na Vercelu.
- Promjena samo web DNS zapisa ima manji rizik od istodobnog preseljenja runtimea, baze, e-maila i platnog sustava.
- Ostavljanje postojećih nameservera izbjegava nepotreban rizik za Google MX, SPF, DKIM, DMARC i druge zapise koji nisu dio web aplikacije.

## Izričito nije dio ove odluke

- Gašenje WordPress hostinga ili licenci prije isteka rollback razdoblja.
- Migracija Supabasea, Resenda ili CorvusPaya na drugi servis.
- Zamjena Google mail infrastrukture.
- Potpuno preseljenje SvelteKit aplikacije na postojeći PHP/WordPress hosting.

## Kada ponovno razmotriti odluku

Potpuno preseljenje s Vercela otvara se kao zaseban projekt samo ako naručitelj dostavi imenovani hosting i potvrdi: podržan Node.js runtime, procesni nadzor, HTTPS/reverse proxy, sigurne environment varijable, production/preview odvajanje, logove, automatski deploy, rollback, resursne limite i izlaznu mrežu prema Supabaseu, Resendu, CorvusPayu i dostavnim servisima. Prije migracije obvezni su staging test i dokumentirana proba povratka.
