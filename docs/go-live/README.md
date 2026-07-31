# Petroni go-live dokumentacija

Ova mapa je operativni izvor istine za puštanje nove Petroni aplikacije u rad. Ne sadrži lozinke, API ključeve, recovery kodove ni vrijednosti produkcijskih varijabli.

## Odluka i trenutačno stanje

- Ciljana arhitektura je **Petroni domena na Vercelu**, uz Supabase za bazu/Auth/Storage, Resend za transakcijski e-mail i CorvusPay hosted checkout za kartice.
- `petroni.hr` i `www.petroni.hr` dodani su Vercel projektu, ali 31. srpnja 2026. javni DNS još pokazuje na stari WordPress hosting. To je očekivano dok svi go-live gateovi nisu zatvoreni.
- Nameserveri ostaju na `ns1.mojsite.com` i `ns2.mojsite.com` za kontrolirani cutover samo web zapisa. Google MX i ostali mail zapisi ne smiju se mijenjati u sklopu web cutovera.
- WordPress nije runtime ovisnost nove aplikacije, ali mora ostati dostupan kao rollback najmanje 30 dana nakon cutovera.

## Dokumenti

1. [hosting-decision.md](hosting-decision.md) — arhitektura, granice odluke i kriteriji za eventualno potpuno preseljenje.
2. [access-register.md](access-register.md) — potvrđeni pristupi, ciljno vlasništvo i sigurna predaja.
3. [operations-runbook.md](operations-runbook.md) — release, DNS cutover, smoke test, rollback i incidenti.
4. [go-live-checklist.md](go-live-checklist.md) — jedinstveni gateovi i potpisi prije promjene DNS-a.
5. [legacy-url-audit.md](legacy-url-audit.md) — potpuni redirect/410 audit i dnevni 404 postupak.

## Pravilo održavanja

Nakon svake promjene vlasništva, produkcijskog servisa, domene ili postupka oporavka ažurirati ove dokumente u istom pull requestu/commitu. Vrijednosti tajni voditi isključivo u Petroni password manageru i servisima koji ih koriste.
