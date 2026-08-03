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
    { name: 'Knaus', image: '/partners/logos/knaus-dark.png', href: 'https://konfigurator.knaustabbert.de/configurator/knaus/de?lang=en' },
    { name: 'Weinsberg', image: '/partners/logos/weinsberg.png', href: 'https://weinsberg.com/en-int/' },
    { name: 'Tabbert', image: '/partners/logos/tabbert.jpg', href: 'https://www.tabbert.com/en-int/' },
    { name: 'Roller Team', image: '/partners/logos/roller-team.svg', href: 'https://www.rollerteam.hr/HR-en/' },
    { name: 'Caravans International', image: '/partners/logos/caravans-international.svg', href: 'https://www.caravansinternational.it/HR-en/' },
    { name: 'Rimor', image: '/partners/logos/rimor.svg', href: 'https://www.rimor.it/at/en/camper' },
    { name: 'Mega Mobil', image: '/partners/logos/mega-mobil-dark.png', href: 'https://megamobil.si/en/' },
    { name: 'Truma', image: '/partners/logos/truma-cropped.webp', href: 'https://www.truma.com/' },
    { name: 'Thetford', image: '/partners/logos/thetford.png', href: 'https://www.thetford.com/' },
    { name: 'Ma-Ve', image: '/partners/logos/ma-ve.webp', href: 'https://www.ma-ve.co.uk/' },
    { name: 'Eurowagon', image: '/partners/logos/eurowagon.webp', href: 'https://www.eurowagon.cz/cs/' },
    { name: 'SRM', image: '/partners/logos/srm.webp', href: 'https://www.srmecatronic.com/en' },
    { name: 'Alde', image: '/partners/logos/alde.jpg', href: 'https://en.alde.se/' },
    { name: 'Udruga kampista Hrvatske', image: '/partners/logos/udruga-kampista.png', href: 'https://udrugakampista.hr' },
    { name: 'Polidor', image: '/partners/logos/polidor.png', href: 'https://www.campingpolidor.com' },
    { name: 'Camp Baldarin', image: '/partners/logos/camp-baldarin.png', href: 'https://www.camp-baldarin.com' },
    { name: 'Camping Plitvice', image: '/partners/logos/plitvice.svg', href: 'https://campingplitvice.hr/' },
    { name: 'Kamping udruženje Hrvatske', image: '/partners/logos/kamping-udruzenje.jpg', href: 'https://www.camping.hr/hr' }
  ];
</script>

<svelte:head>
  <title>Naša vozila — najam, prodaja i filmske produkcije | Petroni</title>
  <meta name="description" content="Petroni vozila za najam, prodaju i filmske produkcije, uz servis i podršku za kampere i kamp-prikolice." />
  <meta property="og:title" content="Naša vozila | Petroni" />
  <meta property="og:description" content="Najam, prodaja i specijalizirana vozila za filmske produkcije." />
</svelte:head>

<section class="relative isolate min-h-[320px] overflow-hidden bg-[#1f2d33] md:min-h-[400px]">
  <img src="/images/vehicles/ci-horon-79m/01-horon-79-1.webp" alt="" class="absolute inset-0 h-full w-full object-cover" />
  <div class="absolute inset-0 bg-[#12252d]/65"></div>
  <div class="container-x relative flex min-h-[320px] items-center justify-center py-16 text-center md:min-h-[400px]">
    <div>
      <p class="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-[#f5c518]">Petroni</p>
      <h1 class="text-[2rem] font-black uppercase leading-[1.08] tracking-tight text-white sm:text-[2.65rem]">{$locale === 'hr' ? 'Naša vozila' : 'Our vehicles'}</h1>
      <p class="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/85 sm:text-base">{$locale === 'hr' ? 'Odaberite vozilo i uslugu koji najbolje odgovaraju vašem putovanju ili projektu.' : 'Choose the vehicle and service that best fit your journey or project.'}</p>
    </div>
  </div>
</section>

<section class="section bg-white">
  <div class="container-x">
    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      {#each categories as category}
        <a href={category.href} class="card card-interactive group relative isolate min-h-[340px] overflow-hidden bg-[#253238] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518] focus-visible:ring-offset-4">
          <img src={category.image} alt="" class="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <div class="absolute inset-0 bg-gradient-to-t from-[#111a1e]/95 via-[#122026]/55 to-[#122026]/15"></div>
          <div class="relative flex min-h-[340px] flex-col justify-end p-7 text-center text-white">
            <h2 class="text-xl font-black uppercase leading-tight text-white">{category.title}</h2>
            <p class="mx-auto mt-3 max-w-xs text-sm leading-6 text-white/85">{category.description}</p>
            <span class="mx-auto mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.13em] text-[#f5c518]">{$locale === 'hr' ? 'Pogledaj ponudu' : 'View selection'} <span aria-hidden="true">→</span></span>
          </div>
        </a>
      {/each}
    </div>
  </div>
</section>

<section class="section border-y border-[#eceef1] bg-[#f7f8f9]">
  <div class="container-x">
    <div class="mx-auto mb-10 max-w-2xl text-center">
      <p class="eyebrow">{$locale === 'hr' ? 'Partneri' : 'Partners'}</p>
      <h2 class="section-title mt-3">{$locale === 'hr' ? 'Naši partneri' : 'Our partners'}</h2>
    </div>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
      {#each brands as brand}
        <a href={brand.href} target="_blank" rel="noreferrer" class="card card-interactive flex aspect-[4/3] items-center justify-center overflow-hidden p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518] focus-visible:ring-offset-2" aria-label={brand.name}>
          <img src={brand.image} alt={brand.name} loading="lazy" class="h-full w-full object-contain" />
        </a>
      {/each}
    </div>
  </div>
</section>

<section class="section bg-white">
  <div class="container-x grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
    <div class="card card-static flex min-h-[300px] items-center justify-center overflow-hidden bg-white p-6 sm:min-h-[360px] sm:p-10">
      <img src="/images/roni-hitna-kamperska.png" alt="Petroni klinika za kamper vozila" loading="lazy" class="max-h-[310px] w-full object-contain" />
    </div>
    <div>
      <p class="eyebrow">{$locale === 'hr' ? 'Klinički caravan centar' : 'Caravan service centre'}</p>
      <h2 class="mt-3 text-[1.65rem] font-black uppercase leading-[1.15] tracking-tight text-[#2b2b2b] sm:text-[2rem]">{$locale === 'hr' ? 'Klinika za kamper vozila' : 'Camper vehicle clinic'}</h2>
      <div class="mt-6 space-y-4 text-[15px] leading-7 text-[#5b6168]">
        <p>{$locale === 'hr' ? 'Kao jedino mjesto u Hrvatskoj u kojem kamp vozilo može dobiti vrhunsku njegu, iskusnu ruku školovanih stručnjaka i veliki broj dijelova na skladištu, naša klinika rješava vaše probleme u najkraćem mogućem roku.' : 'As the only place in Croatia where a camping vehicle can receive premium care from trained specialists and access to a large stock of parts, our clinic resolves problems as quickly as possible.'}</p>
        <p>{$locale === 'hr' ? 'Termini se prilagođavaju strankama i mogućnostima klinike, a svi popravci obavljaju se uz najviše standarde kvalitete i originalne dijelove.' : 'Appointments are adapted to our customers and the clinic’s availability, while every repair is carried out to the highest quality standards using original parts.'}</p>
      </div>
      <a href="/kontakt" class="btn btn-primary mt-7 inline-flex px-6 py-3">{$locale === 'hr' ? 'Kontaktirajte nas' : 'Contact us'}</a>
    </div>
  </div>
</section>
