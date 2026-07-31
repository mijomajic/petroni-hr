# Legacy URL audit i 404 nadzor

Datum zamrzavanja: 31. srpnja 2026.

Izvor: javni Yoast sitemap index na staroj WordPress stranici, njegovih 14 sitemapova, WooCommerce Store API za HR/EN product slugove i SKU-ove te aktivni Supabase katalog.

## Rezultat

| Mjera | Broj |
|---|---:|
| Zapisa u sitemapovima | 3.638 |
| Jedinstvenih starih URL-ova | 3.636 |
| Već kanonskih URL-ova bez potrebe za redirectom | 12 |
| URL-ova s jednim HTTP 308 redirectom | 3.529 |
| URL-ova s izričitim HTTP 410 Gone | 95 |
| Jedinstvenih starih product slugova | 2.296 |
| Product slugova koji su ostali isti | 1.636 |
| Preimenovanih proizvoda sigurno spojenih preko SKU-a | 586 |
| Uklonjenih proizvoda bez aktivnog SKU para | 74 |

Potpuni dokazi:

- `legacy-wordpress-sitemaps-2026-07-31.json` — nepromjenjivi snimak svih sitemap URL-ova;
- `legacy-url-decisions-2026-07-31.csv` — jedan red za svaki jedinstveni URL, sa statusom, odredištem, jezikom i razlogom;
- `src/lib/legacy-product-decisions.generated.ts` — runtime product aliasi i 410 odluke generirani iz WooCommerce SKU-a i Supabasea;
- `src/lib/legacy-redirects.test.ts` — regresijski test koji pada ako bilo koji zamrznuti URL ostane bez odluke ili stvara redirect lanac.

Snapshot se ne prepisuje nakon cutovera. Ako se prije cutovera napravi novi WordPress catalogue/content freeze, generira se novi datirani snapshot i čuva prethodni kao dokaz.

## Pravila odluke

- Aktivni proizvod s istim slugom: `/proizvod/<slug>` ili `/en/product/<slug>` ide izravno na `/product/<slug>`.
- Preimenovani proizvod: stari WooCommerce slug povezuje se na aktivni Supabase slug isključivo preko istog SKU-a, ne fuzzy usporedbom naziva.
- Proizvod bez aktivnog SKU para vraća `410 Gone`; ne preusmjerava se obmanjujuće na nepovezan proizvod.
- Stare product kategorije mapirane su na jednu od 66 živih Supabase kategorija ili, za `uncategorized`, na `/shop`.
- Stari HR/EN vehicle slug mapiran je na stvarno aktivno vozilo. Šest povučenih modela bez zamjene vraća 410.
- Stari članci s odgovarajućom objavom idu na `/novosti/<slug>`. Uklonjeni putopisi, zastarjeli katalog/nagradna igra i sadržaj bez stvarne zamjene vraćaju 410.
- `/en/*` URL-ovi vode na jedinstvenu kanonsku rutu i nose jednokratni `lang=en`; preglednik postavlja postojeću EN preferenciju pa uklanja pomoćni parametar iz vidljivog URL-a.
- Legacy taxonomy query za shipping class vodi na `/shop` bez prenošenja zastarjelih `taxonomy`/`term` parametara.
- Redirecti su permanentni 308, jedan korak, bez loopa i bez redirecta na drugi legacy URL.

## 410 odluke koje trebaju poslovnu potvrdu

Osim 74 proizvoda bez aktivnog SKU para, audit je označio:

- povučena vozila: Benimar Mileo 263, Caravans International Elliot 86XT, Roller Team Kronos 279M, XGO Dynamic 35, Petromax 50 Green Room i Weinsberg CaraOne 450FU;
- uklonjene/stare članke: prozori Carbest, putopisi Alpe i Crna Gora, kampiranje, Eurowagon, Solbio članak, REIMO katalog 2023, Weinsberg CaraCito i MegaMobil;
- isteklu nagradnu igru i staru WooCommerce thank-you rutu.

Ako Petroni potvrdi stvarno sadržajno jednak novi URL, 410 se može zamijeniti direktnim 308. Preusmjeravanje na naslovnicu samo radi uklanjanja 410 nije prihvatljivo.

## Search Console ulaz koji još nedostaje

Javni sitemapovi su zamrznuti. Za završnu provjeru treba iz starog Google Search Console propertyja izvesti:

1. Performance → Pages, zadnjih 16 mjeseci, CSV;
2. Links → Top linked pages, CSV;
3. Pages/Indexing → Not found (404), CSV ako je dostupan.

Developer uspoređuje svaki dodatni URL s decision CSV-om. URL koji nije bio u sitemapu dobiva istu eksplicitnu odluku i regresijski test. Izvoz može dostaviti Paula/Moni; pristup Search Consoleu nije potreban za izvršavanje aplikacije, ali podatak zatvara migracijski audit.

## Dnevni 404 nadzor — prvih 30 dana

Aplikacija u Vercel runtime log zapisuje strukturirani događaj `public_404` s metodom, putanjom i referrer originom/putanjom. Query parametri, cookieji, tijelo zahtjeva, e-mail i drugi osobni podaci ne ulaze u taj zapis. Admin/API/Auth/payment-link 404 nisu dio javnog SEO izvještaja.

Svaki dan nakon cutovera:

```bash
npx vercel logs --environment production --since 24h --status-code 404 --json --no-branch \
  | npm run report:404 > petroni-404-daily.csv
```

Postupak trijaže:

1. Otvoriti CSV i prvo obraditi putanje s najvećim brojem zahtjeva ili vanjskim referrerom.
2. Utvrditi je li riječ o starom stvarnom URL-u, pogrešnom internom linku, bot skenu ili korisničkoj pogrešci.
3. Za stvarni stari sadržaj odrediti jedan relevantan 308 ili 410. Ne preusmjeravati sve 404 na naslovnicu.
4. Dodati odluku u `legacy-redirects.ts`, test i decision report; pokrenuti `npm run test:seo`, puni test, check i build.
5. Nakon deploymenta ručno provjeriti status i konačno odredište te zabilježiti datum/rješenje u dnevnom izvještaju.
6. Čuvati dnevne CSV izvještaje u Petroni-owned privatnoj operativnoj arhivi, ne u javnom Git repozitoriju.

Nadzor se provodi dnevno najmanje 30 dana. Nakon toga prelazi na tjedni pregled dok god Search Console ili Vercel pokazuju relevantne nove 404 putanje.

## Finalni canonical/sitemap postupak

1. Prije cutovera postaviti `PUBLIC_SITE_URL` na odabranu kanonsku domenu i uskladiti Supabase Auth/CorvusPay callbackove.
2. Nakon propagacije potvrditi da `/robots.txt` referencira finalni `/sitemap.xml` i da svaka sitemap lokacija koristi finalni HTTPS host.
3. Provjeriti da apex/www imaju samo jedan permanentni redirect i da canonical odgovara odredištu.
4. Predati novi sitemap u finalni Search Console property.
5. Pratiti Page indexing, canonical i 404 najmanje 30 dana; nove stvarne legacy URL-ove dodavati kroz isti testirani proces.
