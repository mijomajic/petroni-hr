<script lang="ts">
  import { locale } from '$lib/stores/locale';

  const categories = $derived([
    {
      href: '/vozila/najam-kampera',
      image: '/images/vehicles/ci-horon-79m/01-horon-79-1.webp',
      title: $locale === 'hr' ? 'Vozila za najam' : 'Rental vehicles',
      description: $locale === 'hr' ? 'Kamperi i kamp-prikolice za vaše sljedeće putovanje.' : 'Campers and caravans for your next journey.'
    },
    {
      href: '/vozila/vozila-za-filmske-produkcije',
      image: '/images/vehicles/make-up-truck-peugeot-boxer/01-peugeot-sminka-1.webp',
      title: $locale === 'hr' ? 'Vozila za filmske produkcije' : 'Vehicles for film productions',
      description: $locale === 'hr' ? 'Specijalna vozila i podrška za produkcije na terenu.' : 'Special vehicles and on-location production support.'
    },
    {
      href: '/vozila/vozila-za-prodaju',
      image: '/images/vehicles/weinsberg-caracompact-suite-640meq/01-3300-caracompact-suite-pepper-mb-640meg-exbp-presse-8616.webp',
      title: $locale === 'hr' ? 'Vozila za prodaju' : 'Vehicles for sale',
      description: $locale === 'hr' ? 'Odabrana vozila spremna za novu priču na cesti.' : 'Selected vehicles ready for their next story on the road.'
    }
  ]);

  const brands = [
    { name: 'Knaus', image: '/partners/logos/knaus-dark.png', href: 'https://www.knaus.com/en-int/' },
    { name: 'Weinsberg', image: '/partners/logos/weinsberg.png', href: 'https://weinsberg.com/en-int/' },
    { name: 'Rimor', image: '/partners/logos/rimor.svg', href: 'https://www.rimor.it/it/en' },
    { name: 'Roller Team', image: '/partners/logos/roller-team.svg', href: 'https://www.rollerteam.it/' },
    { name: 'Caravans International', image: '/partners/logos/caravans-international.svg', href: 'https://www.caravansinternational.it/fr/' },
    { name: 'Mega Mobil', image: '/partners/logos/mega-mobil-dark.png', href: 'https://megamobil.si/en/' },
    { name: 'Truma', image: '/partners/logos/truma-cropped.webp', href: 'https://www.truma.com/' },
    { name: 'Thetford', image: '/partners/logos/thetford.png', href: 'https://www.thetford.com/' }
  ];
</script>

<svelte:head>
  <title>Naša vozila — najam, prodaja i filmske produkcije | Petroni</title>
  <meta name="description" content="Petroni vozila za najam, prodaju i filmske produkcije, uz servis i podršku za kampere i kamp-prikolice." />
  <meta property="og:title" content="Naša vozila | Petroni" />
  <meta property="og:description" content="Najam, prodaja i specijalizirana vozila za filmske produkcije." />
</svelte:head>

<section class="relative isolate min-h-[360px] overflow-hidden bg-[#1f2d33] sm:min-h-[430px]">
  <img src="/images/vehicles/ci-horon-79m/01-horon-79-1.webp" alt="" class="absolute inset-0 h-full w-full object-cover" />
  <div class="absolute inset-0 bg-[#12252d]/65"></div>
  <div class="container-x relative flex min-h-[360px] items-center justify-center py-20 text-center sm:min-h-[430px]">
    <div>
      <p class="mb-4 text-xs font-black uppercase tracking-[0.24em] text-[#f5c518]">Petroni</p>
      <h1 class="text-4xl font-black uppercase tracking-tight text-white sm:text-6xl">{$locale === 'hr' ? 'Naša vozila' : 'Our vehicles'}</h1>
      <p class="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">{$locale === 'hr' ? 'Odaberite vozilo i uslugu koji najbolje odgovaraju vašem putovanju ili projektu.' : 'Choose the vehicle and service that best fit your journey or project.'}</p>
    </div>
  </div>
</section>

<section class="section bg-white">
  <div class="container-x">
    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      {#each categories as category}
        <a href={category.href} class="group relative isolate min-h-[360px] overflow-hidden bg-[#253238] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518] focus-visible:ring-offset-4">
          <img src={category.image} alt="" class="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <div class="absolute inset-0 bg-gradient-to-t from-[#122026]/85 via-[#122026]/25 to-transparent"></div>
          <div class="relative flex min-h-[360px] flex-col justify-end p-7 text-center text-white">
            <h2 class="text-2xl font-black uppercase leading-tight">{category.title}</h2>
            <p class="mx-auto mt-3 max-w-xs text-sm leading-6 text-white/85">{category.description}</p>
            <span class="mx-auto mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.13em] text-[#f5c518]">{$locale === 'hr' ? 'Pogledaj ponudu' : 'View selection'} <span aria-hidden="true">→</span></span>
          </div>
        </a>
      {/each}
    </div>
  </div>
</section>

<section class="section border-y border-[#eceef1] bg-[#fafbfc]">
  <div class="container-x">
    <div class="mx-auto mb-10 max-w-2xl text-center">
      <p class="eyebrow">{$locale === 'hr' ? 'Partneri' : 'Partners'}</p>
      <h2 class="section-title mt-3">{$locale === 'hr' ? 'Naši partneri' : 'Our partners'}</h2>
    </div>
    <div class="grid grid-cols-2 border-l border-t border-[#e6e8eb] sm:grid-cols-4 lg:grid-cols-8">
      {#each brands as brand}
        <a href={brand.href} target="_blank" rel="noreferrer" class="flex aspect-[4/3] items-center justify-center border-b border-r border-[#e6e8eb] bg-white p-5 transition hover:bg-[#fffdf4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518] focus-visible:ring-inset">
          <img src={brand.image} alt={brand.name} class="max-h-12 max-w-full object-contain" />
        </a>
      {/each}
    </div>
  </div>
</section>

<section class="section bg-white">
  <div class="container-x grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
    <div class="relative min-h-[280px] overflow-hidden bg-[#2b383d] sm:min-h-[360px]">
      <img src="/images/vehicles/weinsberg-caraone-550qdk/01-co550qdk-2.webp" alt="Kamper u Petroni servisu" class="absolute inset-0 h-full w-full object-cover" />
      <div class="absolute inset-0 bg-[#122026]/35"></div>
      <div class="absolute bottom-0 left-0 right-0 bg-[#f5c518] px-6 py-4 text-sm font-black uppercase tracking-wide text-[#2b2b2b]">{$locale === 'hr' ? 'Klinika za kamper vozila' : 'Camper vehicle clinic'}</div>
    </div>
    <div>
      <p class="eyebrow">{$locale === 'hr' ? 'Klinički caravan centar' : 'Caravan service centre'}</p>
      <h2 class="section-title mt-3">{$locale === 'hr' ? 'Servis za kampere i kamp-prikolice' : 'Camper and caravan service'}</h2>
      <div class="mt-6 space-y-4 text-[15px] leading-7 text-[#5b6168]">
        <p>{$locale === 'hr' ? 'Petroni servis okuplja educirani tim i provjerene dijelove za redovno održavanje, dijagnostiku i popravke kamperskih vozila.' : 'Petroni service brings together a trained team and proven parts for regular maintenance, diagnostics and repairs of camping vehicles.'}</p>
        <p>{$locale === 'hr' ? 'Javite nam se s opisom potrebe i dogovorite termin. Vozilo ostavite kod nas, a naš tim javit će vam se čim posao bude završen.' : 'Contact us with a description of what you need and arrange an appointment. Leave the vehicle with us and our team will contact you as soon as the work is complete.'}</p>
      </div>
      <a href="/kontakt" class="btn btn-primary mt-7 inline-flex px-6 py-3">{$locale === 'hr' ? 'Kontaktirajte nas' : 'Contact us'}</a>
    </div>
  </div>
</section>
