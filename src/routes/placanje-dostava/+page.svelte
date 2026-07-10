<script lang="ts">
  import { locale } from '$lib/stores/locale';

  const paymentMethods = $derived($locale === 'hr' ? [
    { name: 'Bankovna doznaka', desc: 'Plaćanje uplatom na bankovni račun tvrtke Petroni d.o.o. Detalji za uplatu dostavljaju se uz potvrdu narudžbe.' },
    { name: 'Kartično plaćanje (CorvusPay)', desc: 'Sigurno plaćanje karticama (Visa, Mastercard, Maestro) putem CorvusPay sustava.' },
  ] : [
    { name: 'Bank transfer', desc: 'Payment via transfer to the Petroni d.o.o. bank account. Payment details are sent with the order confirmation.' },
    { name: 'Card payment (CorvusPay)', desc: 'Secure card payment (Visa, Mastercard, Maestro) via the CorvusPay system.' },
  ]);

  const shippingOptions = $derived($locale === 'hr' ? [
    { name: 'Overseas Express', price: '11 €', desc: 'Dostava kurirskom službom, 2–4 radna dana.' },
    { name: 'Osobno preuzimanje', price: '0 €', desc: 'Preuzimanje u našem skladištu u Sesvetama, Zagreb.' },
    { name: 'BoxNow', price: '9 €', desc: 'Preuzimanje u BoxNow paketomatu po izboru, 2–4 radna dana.' },
  ] : [
    { name: 'Overseas Express', price: '€11', desc: 'Courier delivery, 2–4 business days.' },
    { name: 'Personal pickup', price: '€0', desc: 'Pickup at our warehouse in Sesvete, Zagreb.' },
    { name: 'BoxNow', price: '€9', desc: 'Pickup at a BoxNow parcel locker of your choice, 2–4 business days.' },
  ]);
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

    <div class="card p-5" style="background:#fffaf0">
      <p class="text-[13px] text-[#6b7178]">{$locale === 'hr' ? 'Besplatna dostava za narudžbe iznad 1000 €.' : 'Free shipping for orders over €1000.'}</p>
    </div>
  </div>
</div>
