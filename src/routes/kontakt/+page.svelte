<script lang="ts">
  import { locale } from '$lib/stores/locale';

  let name = $state('');
  let email = $state('');
  let phone = $state('');
  let topic = $state('Prodaja');
  let message = $state('');
  let agree = $state(false);
  let sent = $state(false);
  let loading = $state(false);

  async function handleSubmit() {
    loading = true;
    await new Promise(r => setTimeout(r, 800));
    sent = true;
    loading = false;
  }

  let openFaq = $state<number | null>(0);
  const faqs = $derived($locale === 'hr' ? [
    { q: 'Kako mogu rezervirati kamper?', a: 'Rezervaciju možete obaviti online putem naše stranice za rezervacije u nekoliko koraka, ili nas kontaktirajte telefonom/e-mailom i rado ćemo Vam pomoći.' },
    { q: 'Što je uključeno u cijenu najma?', a: 'U cijenu najma uključena je osnovna oprema vozila, kilometraža prema dogovoru te tehnička podrška tijekom putovanja. Detalje pronađite u uvjetima najma.' },
    { q: 'Mogu li iznajmiti kamper na 2 dana?', a: 'Minimalno trajanje najma ovisi o sezoni. Za kraće najmove slobodno nas kontaktirajte za dostupnost i posebne uvjete.' },
  ] : [
    { q: 'How can I book a camper?', a: 'You can book online through our reservation page in a few steps, or contact us by phone/email and we will gladly help you.' },
    { q: 'What is included in the rental price?', a: 'The rental price includes the basic vehicle equipment, agreed mileage and technical support during your trip. See the rental terms for details.' },
    { q: 'Can I rent a camper for 2 days?', a: 'The minimum rental period depends on the season. For shorter rentals, contact us for availability and special terms.' },
  ]);
</script>

<svelte:head>
  <title>Kontakt — Petroni</title>
  <meta name="description" content="Kontaktirajte Petroni za najam kampera, prodaju vozila, shop narudžbe i podršku. Adresa, telefon i email na jednom mjestu." />
  <meta property="og:title" content="Kontakt — Petroni" />
  <meta property="og:description" content="Kontaktirajte Petroni za najam kampera, prodaju vozila, shop narudžbe i podršku. Adresa, telefon i email na jednom mjestu." />
</svelte:head>

<div class="section">
  <div class="container-x">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
      <!-- Form -->
      <div>
        <h1 class="text-[30px] font-bold text-[#2b2b2b] mb-3">{$locale === 'hr' ? 'Kontaktirajte nas' : 'Contact us'}</h1>
        <p class="text-[14px] text-[#7a7f86] mb-8">{$locale === 'hr' ? 'Naš tim s veseljem stoji na raspolaganju za sva Vaša pitanja.' : 'Our team is happy to answer any of your questions.'}</p>

        {#if sent}
          <div class="card p-8 text-center">
            <div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style="background:#fff7e0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f5c518" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 class="font-bold text-[#2b2b2b] text-lg mb-1">{$locale === 'hr' ? 'Poruka poslana!' : 'Message sent!'}</h3>
            <p class="text-sm text-[#7a7f86]">{$locale === 'hr' ? 'Javit ćemo Vam se što je prije moguće.' : 'We will get back to you as soon as possible.'}</p>
          </div>
        {:else}
          <div class="space-y-5">
            <div><span class="field-label">{$locale === 'hr' ? 'Ime i prezime' : 'Full name'}</span><input class="field" bind:value={name} /></div>
            <div><span class="field-label">{$locale === 'hr' ? 'E-mail' : 'Email'}</span><input type="email" class="field" bind:value={email} /></div>
            <div><span class="field-label">{$locale === 'hr' ? 'Broj telefona' : 'Phone number'}</span><input type="tel" class="field" bind:value={phone} /></div>
            <div>
              <span class="field-label">{$locale === 'hr' ? 'Tema' : 'Topic'}</span>
              <select class="field" bind:value={topic}>
                <option>{$locale === 'hr' ? 'Prodaja' : 'Sales'}</option>
                <option>{$locale === 'hr' ? 'Najam' : 'Rental'}</option>
                <option>Shop</option>
                <option>{$locale === 'hr' ? 'Ostalo' : 'Other'}</option>
              </select>
            </div>
            <div><span class="field-label">{$locale === 'hr' ? 'Poruka' : 'Message'}</span><textarea rows="5" class="field resize-none" bind:value={message}></textarea></div>
            <label class="flex items-start gap-2 text-[13px] text-[#7a7f86]">
              <input type="checkbox" class="mt-1 accent-[#f5c518]" bind:checked={agree} />
              <span>{$locale === 'hr' ? 'Prihvaćam i slažem se s' : 'I accept and agree to the'} <a href="/privatnost" class="font-semibold" style="color:#f5c518">{$locale === 'hr' ? 'uvjetima poslovanja & Politikom privatnosti' : 'terms of business & Privacy Policy'}</a></span>
            </label>
            <button onclick={handleSubmit} disabled={loading || !name || !email || !message || !agree} class="btn btn-primary px-8 py-3.5 disabled:opacity-50">
              {loading ? ($locale === 'hr' ? 'Šaljem…' : 'Sending…') : ($locale === 'hr' ? 'Pošalji' : 'Send')}
            </button>
          </div>
        {/if}
      </div>

      <!-- Info + map -->
      <div>
        <div class="space-y-3 text-[14px] mb-6">
          <p><span class="font-bold text-[#2b2b2b]">{$locale === 'hr' ? 'Adresa' : 'Address'}:</span> <span class="text-[#6b7178]">Slavka Tomerlina 9, 10380 Sesvete, Zagreb</span></p>
          <p><span class="font-bold text-[#2b2b2b]">{$locale === 'hr' ? 'Telefon' : 'Phone'}:</span> <a href="tel:+385912427247" class="text-[#6b7178] hover:text-[#b5890a]">+385912427247</a></p>
          <p><span class="font-bold text-[#2b2b2b]">Email:</span> <a href="mailto:info@petroni.hr" class="text-[#6b7178] hover:text-[#b5890a]">info@petroni.hr</a></p>
          <p class="text-[13px] text-[#8b9099] leading-relaxed">
            <span class="font-bold text-[#2b2b2b]">{$locale === 'hr' ? 'NAPOMENA' : 'NOTE'}:</span>
            {$locale === 'hr' ? 'Molimo Vas da nas za sve upite kontaktirate isključivo putem e-maila ili telefonskim pozivom. WhatsApp poruke nisu podržane kao službeni kanal komunikacije.' : 'Please contact us only by email or phone call. WhatsApp messages are not supported as an official channel.'}
          </p>
        </div>
        <div class="card overflow-hidden h-[320px]">
          <iframe title="Petroni lokacija" class="w-full h-full border-0" loading="lazy"
            src="https://maps.google.com/maps?q=Slavka%20Tomerlina%209%2C%20Sesvete%2C%20Zagreb&t=&z=14&ie=UTF8&iwloc=&output=embed"></iframe>
        </div>
      </div>
    </div>

    <!-- FAQ -->
    <div class="max-w-3xl mx-auto text-center">
      <span class="eyebrow mb-3">{$locale === 'hr' ? 'Odgovori na sva vaša pitanja' : 'Answers to all your questions'}</span>
      <h2 class="section-title mb-8">{$locale === 'hr' ? 'Najčešće postavljena pitanja' : 'Frequently asked questions'}</h2>
      <div class="text-left space-y-3">
        {#each faqs as faq, i}
          <div class="card overflow-hidden">
            <button onclick={() => openFaq = openFaq === i ? null : i} class="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
              <span class="font-medium text-[15px] text-[#2b2b2b]">{faq.q}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b9099" stroke-width="2.5" class="flex-shrink-0 transition-transform" style="transform:rotate({openFaq === i ? 180 : 0}deg)"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            {#if openFaq === i}
              <p class="px-5 pb-5 text-[14px] leading-relaxed text-[#6b7178]">{faq.a}</p>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
