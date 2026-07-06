<script lang="ts">
  import { locale } from '$lib/stores/locale';

  let openIndex = $state<number | null>(0);

  const faqs = $derived($locale === 'hr' ? [
    { q: 'Kako mogu rezervirati kamper?', a: 'Rezervaciju možete obaviti online putem naše stranice za rezervacije u nekoliko jednostavnih koraka, ili nas kontaktirajte telefonom ili e-mailom.' },
    { q: 'Što je uključeno u cijenu najma?', a: 'U cijenu najma uključena je osnovna oprema vozila te tehnička podrška tijekom putovanja. Dodatna opremu možete odabrati prilikom rezervacije.' },
    { q: 'Koja je minimalna starost vozača?', a: 'Vozač mora imati najmanje 28 godina na dan preuzimanja i posjedovati važeću vozačku dozvolu.' },
    { q: 'Mogu li otkazati rezervaciju?', a: 'Besplatno otkazivanje moguće je do 30 dana prije preuzimanja vozila. Pogledajte uvjete najma za detalje.' },
    { q: 'Koliko traje dostava narudžbe iz shopa?', a: 'Dostava unutar Hrvatske traje 2–4 radna dana, ovisno o odabranoj dostavnoj službi.' },
    { q: 'Mogu li vratiti kupljeni proizvod?', a: 'Da, imate pravo na povrat proizvoda u roku od 14 dana od preuzimanja, sukladno našoj politici povrata.' },
    { q: 'Koje načine plaćanja prihvaćate?', a: 'Prihvaćamo plaćanje bankovnom doznakom i karticom putem CorvusPaya.' },
    { q: 'Je li dostupna pomoć na putu?', a: 'Da, svi naši kamperi dolaze s kontaktom za tehničku podršku i pomoć na putu 0-24.' },
  ] : [
    { q: 'How can I book a camper?', a: 'You can book online through our reservation page in a few simple steps, or contact us by phone or email.' },
    { q: 'What is included in the rental price?', a: 'The rental price includes the basic vehicle equipment and technical support during your trip. Additional extras can be selected during booking.' },
    { q: 'What is the minimum driver age?', a: 'The driver must be at least 28 years old on the pickup date and hold a valid driving licence.' },
    { q: 'Can I cancel my booking?', a: 'Free cancellation is possible up to 30 days before pickup. See the rental terms for details.' },
    { q: 'How long does shop delivery take?', a: 'Delivery within Croatia takes 2–4 business days, depending on the chosen shipping option.' },
    { q: 'Can I return a purchased product?', a: 'Yes, you have the right to return a product within 14 days of receiving it, in accordance with our return policy.' },
    { q: 'What payment methods do you accept?', a: 'We accept bank transfer and card payment via CorvusPay.' },
    { q: 'Is roadside assistance available?', a: 'Yes, all our campers come with a 24/7 technical support and roadside assistance contact.' },
  ]);
</script>

<svelte:head><title>FAQ — Petroni</title></svelte:head>

<div class="section">
  <div class="container-x max-w-3xl mx-auto">
    <span class="eyebrow mb-3">{$locale === 'hr' ? 'Pomoć' : 'Help'}</span>
    <h1 class="section-title mb-10">FAQ</h1>

    <div class="space-y-3">
      {#each faqs as faq, i}
        <div class="card overflow-hidden">
          <button onclick={() => openIndex = openIndex === i ? null : i} class="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
            <span class="font-medium text-[15px] text-[#2b2b2b]">{faq.q}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b9099" stroke-width="2.5" class="flex-shrink-0 transition-transform" style="transform:rotate({openIndex === i ? 180 : 0}deg)"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          {#if openIndex === i}
            <p class="px-5 pb-5 text-[14px] leading-relaxed text-[#6b7178]">{faq.a}</p>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>
