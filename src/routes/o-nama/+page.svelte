<script lang="ts">
  import { locale } from '$lib/stores/locale';

  const testimonials = $derived($locale === 'hr' ? [
    'Vrhunsko iskustvo od prvog kontakta do povratka kampera. Sve preporuke!',
    'Profesionalan tim i besprijekorno održavano vozilo. Putovanje za pamćenje.',
    'Najam je bio jednostavan, a podrška dostupna u svakom trenutku. Hvala!',
  ] : [
    'A top experience from first contact to returning the camper. Highly recommended!',
    'Professional team and an impeccably maintained vehicle. A trip to remember.',
    'Renting was simple and support was available at all times. Thank you!',
  ]);
</script>

<svelte:head>
  <title>O Petroniju – iskustvo za vaš put kamperom | Petroni</title>
  <meta name="description" content="Upoznajte Petroni, obiteljski tim s dugogodišnjim iskustvom u najmu i prodaji kampera, karavana i kamping opreme." />
  <meta property="og:title" content="O Petroniju – iskustvo za vaš put kamperom | Petroni" />
  <meta property="og:description" content="Upoznajte Petroni, obiteljski tim s dugogodišnjim iskustvom u najmu i prodaji kampera, karavana i kamping opreme." />
</svelte:head>

<!-- Hero banner -->
<section class="relative h-[320px] md:h-[400px] flex items-center justify-center overflow-hidden">
  <img src="https://www.petroni.hr/wp-content/uploads/2024/03/DSC_0001-768x512.jpg" alt="" class="absolute inset-0 w-full h-full object-cover" />
  <div class="absolute inset-0" style="background:rgba(0,0,0,0.65)"></div>
  <div class="relative z-10 text-center px-4">
    <span class="block text-[11px] font-bold uppercase tracking-[0.22em] mb-4" style="color:#f5c518">{$locale === 'hr' ? 'Upoznajte nas' : 'Get to know us'}</span>
    <h1 class="text-4xl md:text-6xl font-extrabold uppercase tracking-wide" style="color:#ffffff; text-shadow:0 2px 20px rgba(0,0,0,0.9), 0 0 60px rgba(0,0,0,0.5)">{$locale === 'hr' ? 'O nama' : 'About us'}</h1>
  </div>
</section>

<!-- Story 1 -->
<section class="section">
  <div class="container-x grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
    <div>
      <span class="eyebrow mb-3">{$locale === 'hr' ? 'Tko smo' : 'Who we are'}</span>
      <h2 class="text-[28px] font-bold text-[#2b2b2b] mb-4">{$locale === 'hr' ? 'Obiteljska tradicija' : 'A family tradition'}</h2>
      <p class="text-[14px] leading-relaxed text-[#6b7178] mb-4">
        {$locale === 'hr'
          ? 'Petroni d.o.o. hrvatska je tvrtka specijalizirana za najam i prodaju kampera, karavana i opreme za kamping. S više od 19 godina iskustva, mi smo Vaš pouzdani partner za sva kamping putovanja.'
          : 'Petroni d.o.o. is a Croatian company specialised in the rental and sale of campers, caravans and camping equipment. With over 19 years of experience, we are your reliable partner for every camping trip.'}
      </p>
      <p class="text-[14px] leading-relaxed text-[#6b7178]">
        {$locale === 'hr'
          ? 'Naša misija je pružiti Vam slobodu ceste uz maksimalnu udobnost i sigurnost. Svako naše vozilo prolazi strog tehnički pregled prije iznajmljivanja.'
          : 'Our mission is to give you the freedom of the road with maximum comfort and safety. Every vehicle undergoes a strict technical inspection before rental.'}
      </p>
    </div>
    <div class="card overflow-hidden aspect-[4/3]">
      <img src="https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg" alt="Petroni" class="w-full h-full object-cover" />
    </div>
  </div>
</section>

<!-- Story 2 -->
<section class="pb-4">
  <div class="container-x grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
    <div class="card overflow-hidden aspect-[4/3] order-2 lg:order-1">
      <img src="https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp" alt="Petroni" class="w-full h-full object-cover" />
    </div>
    <div class="order-1 lg:order-2">
      <span class="eyebrow mb-3">{$locale === 'hr' ? 'Naše iskustvo' : 'Our experience'}</span>
      <h2 class="text-[28px] font-bold text-[#2b2b2b] mb-4">{$locale === 'hr' ? '19 godina putovanja' : '19 years of travelling'}</h2>
      <p class="text-[14px] leading-relaxed text-[#6b7178]">
        {$locale === 'hr'
          ? 'Kroz godine smo izgradili povjerenje stotina zadovoljnih korisnika. Osim najma, nudimo i kompletan asortiman kamping opreme u našem online shopu — od elektrike i plinske opreme do namještaja i sanitarija. Naš tim stoji Vam na raspolaganju za savjet i podršku tijekom cijelog putovanja.'
          : 'Over the years we have earned the trust of hundreds of satisfied customers. Besides rentals, we offer a complete range of camping equipment in our online shop — from electrical and gas equipment to furniture and sanitary products. Our team is available for advice and support throughout your trip.'}
      </p>
    </div>
  </div>
</section>

<!-- Testimonials -->
<section class="section mt-8" style="background:#fafbfc">
  <div class="container-x">
    <div class="text-center mb-12">
      <span class="eyebrow mb-3">{$locale === 'hr' ? 'Povjerenje' : 'Trust'}</span>
      <h2 class="section-title">{$locale === 'hr' ? 'Mišljenja naših korisnika' : 'What our customers say'}</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each testimonials as quote}
        <div class="card p-7">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#f5c518" class="mb-4"><path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"/></svg>
          <p class="text-[14px] leading-relaxed text-[#5b6168] italic">"{quote}"</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- CTA -->
<section class="section">
  <div class="container-x grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
    <div class="card overflow-hidden aspect-[4/3]">
      <img src="https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg" alt="Petroni" class="w-full h-full object-cover" />
    </div>
    <div>
      <h2 class="section-title mb-4">{$locale === 'hr' ? 'S kamperom nema žurbe' : 'No rush with a camper'}</h2>
      <p class="text-[14px] leading-relaxed text-[#6b7178] mb-6">
        {$locale === 'hr'
          ? 'Otkrijte slobodu putovanja bez rasporeda i ograničenja. Bilo da planirate vikend izlet ili dugo putovanje Europom — mi smo tu da Vaše putovanje učinimo bezbrižnim.'
          : 'Discover the freedom of travelling without a schedule or limits. Whether you are planning a weekend getaway or a long journey across Europe — we are here to make your trip carefree.'}
      </p>
      <a href="/rezerviraj" class="btn btn-primary px-8 py-3.5">{$locale === 'hr' ? 'Rezerviraj' : 'Book now'}</a>
    </div>
  </div>
</section>
