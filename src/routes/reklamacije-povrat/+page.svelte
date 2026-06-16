<script lang="ts">
  import { locale } from '$lib/stores/locale';

  const sections = $derived($locale === 'hr' ? [
    { title: 'Pravo na povrat', body: 'Sukladno Zakonu o zaštiti potrošača, imate pravo na jednostrani raskid ugovora u roku od 14 dana od dana preuzimanja proizvoda, bez navođenja razloga.' },
    { title: 'Postupak povrata', body: 'Za povrat proizvoda potrebno je ispuniti obrazac za jednostrani raskid ugovora ili nas obavijestiti putem e-maila na info@petroni.hr, te vratiti proizvod u originalnom pakiranju, neoštećen i neupotrijebljen.' },
    { title: 'Povrat novca', body: 'Nakon zaprimanja i provjere vraćenog proizvoda, povrat novca izvršava se u roku od 14 dana istim načinom plaćanja koji je korišten prilikom kupnje.' },
    { title: 'Troškovi povrata', body: 'Troškove povrata proizvoda snosi kupac, osim u slučaju kada je proizvod neispravan ili ne odgovara narudžbi.' },
    { title: 'Reklamacije', body: 'Pisani prigovor možete podnijeti putem e-maila na info@petroni.hr ili poštom na adresu tvrtke. Na reklamaciju odgovaramo u zakonskom roku od 15 dana.' },
  ] : [
    { title: 'Right of return', body: 'In accordance with consumer protection law, you have the right to withdraw from the contract within 14 days of receiving the product, without giving any reason.' },
    { title: 'Return process', body: 'To return a product, please fill out the withdrawal form or notify us by email at info@petroni.hr, and return the product in its original packaging, undamaged and unused.' },
    { title: 'Refunds', body: 'After receiving and inspecting the returned product, the refund is issued within 14 days using the same payment method used for the purchase.' },
    { title: 'Return costs', body: 'The cost of returning the product is borne by the customer, except when the product is defective or does not match the order.' },
    { title: 'Complaints', body: 'You can submit a written complaint by email to info@petroni.hr or by post to our company address. We respond to complaints within the statutory period of 15 days.' },
  ]);
</script>

<svelte:head><title>Reklamacije & Povrat — Petroni</title></svelte:head>

<div class="section">
  <div class="container-x max-w-3xl mx-auto">
    <span class="eyebrow mb-3">Shop</span>
    <h1 class="section-title mb-10">{$locale === 'hr' ? 'Reklamacije & Povrat' : 'Complaints & Returns'}</h1>

    <div class="card p-5 mb-8" style="background:#fffaf0">
      <p class="text-[13px] font-semibold" style="color:#b5890a">{$locale === 'hr' ? '14 dana za povrat proizvoda bez objašnjenja razloga.' : '14 days to return a product without giving a reason.'}</p>
    </div>

    <div class="space-y-8">
      {#each sections as s}
        <div>
          <h2 class="text-[18px] font-bold text-[#2b2b2b] mb-2">{s.title}</h2>
          <p class="text-[14px] leading-relaxed text-[#6b7178]">{s.body}</p>
        </div>
      {/each}
    </div>
  </div>
</div>
