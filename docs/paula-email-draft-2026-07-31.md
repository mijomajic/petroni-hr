# Predmet: Re: Tehnički pregled nove Petroni stranice

Pozdrav Paula,

hvala ti na detaljnom popisu. Pitanja su potpuno opravdana prije nego booking, webshop i kartično plaćanje krenu u puni produkcijski rad.

Napravio sam tehnički audit trenutačnog sustava i pripremio handover dokument s arhitekturom, hostingom, pristupima, slikama, administracijom, URL migracijom, privatnošću, backupom, CorvusPayem, sigurnošću i održavanjem.

Najkraći pregled:

- Nova aplikacija je samostalna SvelteKit aplikacija i za rad ne ovisi o WordPressu. WooCommerce je do sada još služio kao privremeni izvor kataloga kroz ručni CSV izvoz; nema automatske runtime veze.
- Trenutačno su frontend, server i admin na Vercelu, baza/Auth/Storage na Supabaseu, e-mail na Resendu, a unos kartice na CorvusPay hosted stranici. Povezivanje naše domene na Vercel nije isto što i preseljenje svega na postojeći hosting.
- Moja je tehnička preporuka zadržati Vercel i spojiti Petroni domenu, osim ako se postojeći hosting zasebno provjeri za Node/SvelteKit i odradi kontrolirani migracijski projekt.
- `/vozila` i Admin → Vozila postoje. Slike se sada mijenjaju unosom URL-a; upload i centralna medijska knjižnica još nisu napravljeni.
- Objave podržavaju skice, a Uvjeti najma verzije. Ostale javne CMS stranice objavljuju se odmah; globalni preview i restore jednim klikom još ne postoje.
- Dio starih URL-ova već ima trajne redirecte, ali stari sitemap audit pokazuje da plan nije potpun, posebno za `/en/*`, stare članke i dio kategorija. To treba završiti prije promjene domene i pratiti 404 nakon puštanja.
- Google Analytics, Meta Pixel i Vercel Analytics nisu ugrađeni. Ipak postoje Google Fonts, FlagCDN i BoxNow widget, pa pravni tekst i način učitavanja tih resursa treba uskladiti prije lansiranja.
- Kartični podaci ne prolaze kroz Petroni aplikaciju i ne spremaju se u našu bazu/Vercel. Aplikacija sprema samo interne reference i status. Prije punog rada treba napraviti stvarni CorvusPay test i dodati formalni reconciliation postupak za slučaj da je uplata prošla, a status se nije ažurirao.
- Kod i migracije postoje na GitHubu i projekt može preuzeti drugi developer. Međutim, GitHub, Vercel, Supabase, Resend i DNS još treba formalno postaviti pod Petroni vlasništvo s najmanje dva odgovorna pristupa.
- Trenutačno nije potvrđen dovoljan backup cijelog sustava. Vercel rollback vraća aplikaciju, ali ne bazu i Storage. Supabase PITR nije uključen, a Storage datoteke nisu dio database backupa, pa treba uvesti zaseban backup i testni restore.

Zbog toga ne bih još gasio WordPress hosting ili licence. Prvo treba završiti zadnji katalog, arhivu stare stranice, redirecte, finalni domain cutover, puni test i rollback period od najmanje 30 dana. Nakon toga možemo po stvarnom WordPress popisu označiti što se gasi, a što ostaje zbog DNS-a, maila ili druge usluge.

U prilogu je detaljan dokument s trenutačnim stanjem i predloženim go-live paketom. U njemu sam namjerno odvojio ono što već postoji od onoga što još treba napraviti, kako ne bismo nejasnoćama prikrili produkcijske obveze.

Za nastavak trebamo potvrditi dvije poslovne odluke:

1. ostaje li aplikacija na Vercelu uz Petroni domenu ili se traži zaseban projekt potpunog preseljenja;
2. koji Petroni računi/osobe trebaju biti vlasnici GitHuba, Vercela, Supabasea, Resenda, DNS-a i administratorskog pristupa.

Nakon te potvrde razvoj se može odraditi u odvojenim, provjerljivim go-live podfazama: vlasništvo i runbook, redirect/404, privacy/legal hardening, backup/restore, CorvusPay reconciliation i media/preview/versioning.

Lijep pozdrav,

Mijo
