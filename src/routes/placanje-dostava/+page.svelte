<script lang="ts">
  import { locale } from '$lib/stores/locale';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  const paymentMethods = $derived($locale === 'hr' ? [
    { name: 'Bankovna doznaka', desc: 'Plaćanje uplatom na bankovni račun tvrtke Petroni d.o.o. Detalji za uplatu dostavljaju se uz potvrdu narudžbe.' },
    { name: 'Kartično plaćanje (CorvusPay)', desc: 'Uskoro dostupno nakon aktivacije produkcijskih vjerodajnica.' },
    { name: 'Plaćanje pouzećem', desc: 'Plaćanje dostavljaču prilikom Overseas isporuke, uz dodatnu naknadu od 1 €.' },
  ] : [
    { name: 'Bank transfer', desc: 'Payment via transfer to the Petroni d.o.o. bank account. Payment details are sent with the order confirmation.' },
    { name: 'Card payment (CorvusPay)', desc: 'Coming soon after production credentials are activated.' },
    { name: 'Cash on delivery', desc: 'Payment to the courier upon Overseas delivery, with an additional €1 fee.' },
  ]);

  const overseas = $derived(data.checkoutConfig.deliveryMethods.find((method) => method.id === 'overseas'));
  const zoneOne = $derived(data.checkoutConfig.overseasZones.find((zone) => zone.id === 'zone_1'));
  const zoneTwo = $derived(data.checkoutConfig.overseasZones.find((zone) => zone.id === 'zone_2'));
  const shippingOptions = $derived(data.checkoutConfig.deliveryMethods
    .filter((method) => method.enabled && method.id !== 'overseas')
    .map((method) => ({
      name: $locale === 'hr' ? method.label_hr : method.label_en,
      price: `${method.price.toFixed(2)} €`,
      desc: method.id === 'personal_pickup'
        ? ($locale === 'hr' ? 'Preuzimanje u našem skladištu u Sesvetama, Zagreb.' : 'Pickup at our warehouse in Sesvete, Zagreb.')
        : ($locale === 'hr' ? 'Preuzimanje u odabranom BoxNow paketomatu, 2–4 radna dana.' : 'Pickup at your selected BoxNow locker, 2–4 business days.')
    })));

  function tierLabel(min: number, max: number | null) {
    if (max === null) return `${min.toFixed(2)} € +`;
    return `${min.toFixed(2)}–${(max - 0.01).toFixed(2)} €`;
  }
</script>

<svelte:head>
  <title>Plaćanje i dostava kamping opreme | Petroni Shop</title>
  <meta name="description" content="Informacije o Petroni načinima plaćanja, dostavi shop narudžbi, osobnom preuzimanju i uvjetima dostave unutar Hrvatske." />
  <meta property="og:title" content="Plaćanje i dostava kamping opreme | Petroni Shop" />
  <meta property="og:description" content="Informacije o Petroni načinima plaćanja, dostavi shop narudžbi, osobnom preuzimanju i uvjetima dostave unutar Hrvatske." />
</svelte:head>

<div class="section">
  <div class="container-x max-w-3xl mx-auto">
    <span class="eyebrow mb-3">Shop</span>
    <h1 class="section-title mb-10">{$locale === 'hr' ? 'Plaćanje & Dostava' : 'Payment & Shipping'}</h1>

    <h2 class="text-[20px] font-bold text-[#2b2b2b] mb-5">{$locale === 'hr' ? 'Načini plaćanja' : 'Payment methods'}</h2>
    <div class="space-y-4 mb-12">
      {#each paymentMethods as m}
        <div class="card p-5">
          <p class="font-semibold text-[#2b2b2b] mb-1">{m.name}</p>
          <p class="text-[13px] text-[#6b7178] leading-relaxed">{m.desc}</p>
        </div>
      {/each}
    </div>

    <h2 class="text-[20px] font-bold text-[#2b2b2b] mb-5">{$locale === 'hr' ? 'Načini dostave' : 'Shipping options'}</h2>
    <div class="space-y-4 mb-8">
      {#if overseas?.enabled && zoneOne && zoneTwo}
        <div class="card p-5">
          <div class="mb-4">
            <p class="font-semibold text-[#2b2b2b] mb-1">Overseas Express</p>
            <p class="text-[13px] text-[#6b7178] leading-relaxed">{$locale === 'hr' ? 'Dostava kurirskom službom unutar Hrvatske, 2–4 radna dana. Zona se određuje prema poštanskom broju adrese dostave.' : 'Courier delivery within Croatia in 2–4 business days. The zone is determined from the delivery postal code.'}</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[520px] text-sm">
              <thead><tr class="border-b border-[#e5e7eb] text-left text-xs uppercase tracking-wide text-[#7a7f86]"><th class="py-2 pr-4">{$locale === 'hr' ? 'Vrijednost košarice' : 'Cart value'}</th><th class="px-3 py-2">{$locale === 'hr' ? zoneOne.label_hr : zoneOne.label_en}</th><th class="px-3 py-2">{$locale === 'hr' ? zoneTwo.label_hr : zoneTwo.label_en}</th></tr></thead>
              <tbody>
                {#each zoneOne.tiers as tier, index}
                  <tr class="border-b border-[#eef0f2] last:border-0"><td class="py-2.5 pr-4 text-[#5b6168]">{tierLabel(tier.min, tier.max)}</td><td class="px-3 py-2.5 font-bold text-[#b5890a]">{tier.price.toFixed(2)} €</td><td class="px-3 py-2.5 font-bold text-[#b5890a]">{(zoneTwo.tiers[index]?.price ?? overseas.price).toFixed(2)} €</td></tr>
                {/each}
                {#if data.checkoutConfig.freeShippingThreshold > 0}<tr class="border-t-2 border-[#f0d87a] bg-[#fffaf0]"><td class="py-2.5 pr-4 font-semibold text-[#6f5600]">{data.checkoutConfig.freeShippingThreshold.toFixed(2)} € +</td><td class="px-3 py-2.5 font-bold text-[#6f5600]">0.00 €</td><td class="px-3 py-2.5 font-bold text-[#6f5600]">0.00 €</td></tr>{/if}
              </tbody>
            </table>
          </div>
          <details class="mt-4 rounded-lg bg-[#f6f7f9] p-3 text-xs text-[#62676e]"><summary class="cursor-pointer font-bold">{$locale === 'hr' ? `Poštanski brojevi Zone II (${zoneTwo.postalCodes.length})` : `Zone II postal codes (${zoneTwo.postalCodes.length})`}</summary><p class="mt-2 break-words leading-relaxed">{zoneTwo.postalCodes.join(', ')}</p></details>
        </div>
      {/if}
      {#each shippingOptions as s}
        <div class="card p-5 flex items-center justify-between gap-4">
          <div>
            <p class="font-semibold text-[#2b2b2b] mb-1">{s.name}</p>
            <p class="text-[13px] text-[#6b7178] leading-relaxed">{s.desc}</p>
          </div>
          <span class="font-bold text-lg" style="color:#b5890a">{s.price}</span>
        </div>
      {/each}
    </div>

    {#if data.checkoutConfig.freeShippingThreshold > 0}
      <div class="card p-5" style="background:#fffaf0">
        <p class="text-[13px] text-[#6b7178]">{$locale === 'hr' ? `Besplatna Overseas dostava za narudžbe od ${data.checkoutConfig.freeShippingThreshold.toFixed(2)} €.` : `Free Overseas delivery for orders from €${data.checkoutConfig.freeShippingThreshold.toFixed(2)}.`}</p>
      </div>
    {/if}
  </div>
</div>
