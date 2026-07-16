<script lang="ts">
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { locale } from '$lib/stores/locale';
  import type { Vehicle } from '$lib/supabase';
  import { DEFAULT_IMAGE, graphSchema, jsonLd, organizationSchema, websiteSchema } from '$lib/seo';
  import VehicleCard from '$lib/components/ui/VehicleCard.svelte';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const rentalVehicles: Vehicle[] = $derived(data.rentalVehicles as Vehicle[]);
  const saleVehicles: Vehicle[] = $derived(data.saleVehicles as Vehicle[]);
  let statsStarted = $state(false);

  const galleryImages = [
    'https://www.petroni.hr/wp-content/uploads/2025/02/hero-image-petroni-camping-and-caravaning-rental10-1.jpg',
    '/images/vehicles/ci-horon-79m/01-horon-79-1.webp',
    '/images/vehicles/roller-team-kronos-277m/01-izvana.webp',
    '/images/vehicles/rimor-evo-sound/01-rimor-evo-1.webp',
    'https://www.petroni.hr/wp-content/uploads/2025/02/DSC_1792.jpg',
    'https://www.petroni.hr/wp-content/uploads/2025/02/DSC_1684.jpg',
  ];

  const partners = [
    {
      name: 'Udruga Kampista Hrvatske',
      src: '/partners/logos/udruga-kampista.png',
      href: 'https://udrugakampista.hr/'
    },
    {
      name: 'Polidor Camping Resort',
      src: '/partners/logos/polidor.png',
      href: 'https://www.campingpolidor.com/'
    },
    {
      name: 'Camping Adriatic / Valamar',
      src: '/partners/logos/valamar-camping.svg',
      href: 'https://www.valamarcamping.com/camping-adriatic',
      filter: 'invert(1)'
    },
    {
      name: 'Plitvice Holiday Resort',
      src: '/partners/logos/plitvice.svg',
      href: 'https://www.plitvice.com/'
    },
    {
      name: 'Kamping udruženje Hrvatske',
      src: '/partners/logos/kamping-udruzenje.jpg',
      href: 'https://www.camping.hr/hr'
    }
  ];
  const brands = [
    { name: 'RIMOR', src: '/partners/logos/rimor.svg', href: 'https://www.rimor.it/it/en' },
    { name: 'CARAVANS INT.', src: '/partners/logos/caravans-international.svg', href: 'https://www.caravansinternational.it/fr/' },
    { name: 'MEGA MOBIL', src: '/partners/logos/mega-mobil.png', href: 'https://megamobil.si/en/' },
    { name: 'THETFORD', src: '/partners/logos/thetford.png', href: 'https://www.thetford.com/' },
    { name: 'KNAUS', src: '/partners/logos/knaus.png', href: 'https://www.knaus.com/en-int/' },
    { name: 'ROLLER TEAM', src: '/partners/logos/roller-team.svg', href: 'https://www.rollerteam.it/' },
    { name: 'TRUMA', src: '/partners/logos/truma.svg', href: 'https://www.truma.com/', filter: 'invert(1)' },
    { name: 'WEINSBERG', src: '/partners/logos/weinsberg.png', href: 'https://weinsberg.com/en-int/' }
  ];

  const advantages = $derived([
    {
      title: $locale === 'hr' ? 'Bez skrivenih troškova' : 'No hidden costs',
      desc: $locale === 'hr' ? 'Kod nas uvijek unaprijed znate konačnu cijenu usluge, bez neugodnih iznenađenja i dodatnih naknada.' : 'You always know the final price upfront — no surprises or extra fees.',
      icon: 'card'
    },
    {
      title: $locale === 'hr' ? 'Diljem Hrvatske i Europe' : 'Across Croatia & Europe',
      desc: $locale === 'hr' ? 'Vozilo možete preuzeti ili vratiti na više unaprijed dogovorenih lokacija diljem čitave Hrvatske i Europe.' : 'Pick up or return your vehicle at agreed locations across Croatia and Europe.',
      icon: 'pin'
    },
    {
      title: $locale === 'hr' ? '100% zadovoljstvo' : '100% satisfaction',
      desc: $locale === 'hr' ? 'Naš je cilj da svako Vaše putovanje protekne sigurno i ugodno, uz potpunu podršku našeg tima.' : 'Our goal is for every trip to be safe and pleasant, with full support from our team.',
      icon: 'star'
    },
  ]);

  // Animated counters
  let counts = $state({ users: 0, years: 0, vehicles: 0 });
  const targets = { users: 546, years: 19, vehicles: 20 };
  const description = 'Petroni – najam i prodaja vrhunskih kampera i karavana. 19 godina iskustva, 20+ vozila, lokacije diljem Hrvatske i Europe.';
  const homeSchema = graphSchema([organizationSchema(), websiteSchema()]);

  function animateCounters() {
    const duration = 1800, steps = 60, interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const eased = 1 - Math.pow(1 - step / steps, 3);
      counts = {
        users: Math.floor(eased * targets.users),
        years: Math.floor(eased * targets.years),
        vehicles: Math.floor(eased * targets.vehicles),
      };
      if (step >= steps) clearInterval(timer);
    }, interval);
  }

  onMount(async () => {
    const statsEl = document.getElementById('stats');
    if (statsEl) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !statsStarted) { statsStarted = true; animateCounters(); obs.disconnect(); }
        });
      }, { threshold: 0.3 });
      obs.observe(statsEl);
    }
  });
</script>

<svelte:head>
  <title>Petroni — Najam i prodaja kampera i karavana</title>
  <meta name="description" content={description} />
  <meta property="og:title" content="Petroni — Najam i prodaja kampera i karavana" />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
  <meta property="og:image" content={DEFAULT_IMAGE} />
  {@html `<script type="application/ld+json">${jsonLd(homeSchema)}</script>`}
</svelte:head>

<!-- ═══════════════════════ HERO ═══════════════════════ -->
<section class="relative min-h-[68vh] md:min-h-[78vh] max-h-[760px] flex items-center overflow-hidden">
  <div class="absolute inset-0">
    <img src="https://www.petroni.hr/wp-content/uploads/2025/02/hero-image-petroni-camping-and-caravaning-rental10-1.jpg" alt="" class="w-full h-full object-cover" fetchpriority="high" />
    <div class="absolute inset-0" style="background:linear-gradient(to left, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.38) 36%, rgba(0,0,0,0.08) 76%, rgba(0,0,0,0.02) 100%)"></div>
    <div class="absolute inset-0" style="background:rgba(0,0,0,0.08)"></div>
  </div>

  <div class="container-x relative z-10 w-full flex justify-center md:justify-end">
    <div class="max-w-xl md:max-w-none text-center md:text-right">
      <h1 class="text-[28px] sm:text-[36px] md:text-4xl lg:text-[2.35rem] xl:text-[2.35rem] font-extrabold uppercase leading-[1.1] tracking-tight mb-5"
          style="color:#ffffff; text-shadow:0 2px 14px rgba(0,0,0,0.78), 0 0 30px rgba(0,0,0,0.42)">
        <span class="block">Putujte bez granica,</span>
        <span class="block" style="color:#f5c518">živite bez ograničenja.</span>
      </h1>
      <p class="text-[14px] md:text-base mb-8 md:ml-auto max-w-lg" style="color:rgba(255,255,255,0.94); text-shadow:0 1px 10px rgba(0,0,0,0.55)">
        {$_('hero.subtext')}
      </p>
      <a href="/rezerviraj" class="btn btn-primary px-8 py-4">{$_('nav.book')}</a>
    </div>
  </div>
</section>

<!-- ═══════════════════════ NAŠA VOZILA ═══════════════════════ -->
<section class="section">
  <div class="container-x">
    <div class="text-center mb-12 reveal">
      <span class="eyebrow mb-3">{$_('vehicles.subtitle')}</span>
      <h2 class="section-title">{$_('vehicles.title')}</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-7 reveal">
      {#each rentalVehicles.slice(0, 3) as vehicle}
        <VehicleCard {vehicle} />
      {/each}
    </div>

    <p class="text-center text-[14px] text-[#7a7f86] mt-10 reveal">
      {$locale === 'hr' ? 'Zanima Vas više?' : 'Want to see more?'}
      <a href="/vozila/najam-kampera" class="font-semibold hover:underline" style="color:#f5c518">{$locale === 'hr' ? 'Pogledajte sva vozila u našoj ponudi.' : 'Browse all vehicles in our offer.'}</a>
    </p>
  </div>
</section>

<!-- ═══════════════════════ PARTNERS ═══════════════════════ -->
<div class="py-10" style="background:#f6f7f9">
  <div class="container-x">
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {#each partners as partner}
        <a
          href={partner.href}
          target="_blank"
          rel="noreferrer"
          class="bg-white rounded-lg border border-[#ededf0] h-28 flex flex-col items-center justify-center gap-2 px-4 text-center transition-all hover:border-[#f5c518] hover:-translate-y-0.5"
          aria-label={partner.name}
        >
          <img
            src={partner.src}
            alt={partner.name}
            loading="lazy"
            class="max-h-12 max-w-[150px] object-contain"
            style={partner.filter ? `filter:${partner.filter}` : undefined}
          />
          <span class="text-[10px] font-bold uppercase text-[#9aa0a8]">{partner.name}</span>
        </a>
      {/each}
    </div>
  </div>
</div>

<!-- ═══════════════════════ VOZILA ZA PRODAJU ═══════════════════════ -->
<section class="section">
  <div class="container-x">
    <div class="text-center mb-12 reveal">
      <span class="eyebrow mb-3">{$locale === 'hr' ? 'Tražite vlastitog ljubimca na 4 kotača?' : 'Looking for your own home on wheels?'}</span>
      <h2 class="section-title">{$_('sale.title')}</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-7 reveal">
      {#each saleVehicles.slice(0, 3) as vehicle}
        <VehicleCard {vehicle} detailHref={`/vozila/najam-kampera/${vehicle.slug}`} />
      {/each}
    </div>

    <p class="text-center text-[14px] text-[#7a7f86] mt-10 reveal">
      {$locale === 'hr' ? 'Zanima Vas više?' : 'Want to see more?'}
      <a href="/vozila/vozila-za-prodaju" class="font-semibold hover:underline" style="color:#f5c518">{$locale === 'hr' ? 'Pogledajte sva vozila za prodaju.' : 'See all vehicles for sale.'}</a>
    </p>
  </div>
</section>

<!-- ═══════════════════════ GLAVNE PREDNOSTI ═══════════════════════ -->
<section class="section" style="background:#fafbfc">
  <div class="container-x">
    <div class="text-center mb-16 reveal">
      <span class="eyebrow mb-3">{$locale === 'hr' ? 'Putujte s nama' : 'Travel with us'}</span>
      <h2 class="section-title">{$locale === 'hr' ? 'Glavne prednosti' : 'Key advantages'}</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
      {#each advantages as item}
        <div class="text-center reveal px-4">
          <div class="flex items-center justify-center mb-5" style="color:#f5c518">
            {#if item.icon === 'card'}
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            {:else if item.icon === 'pin'}
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {:else}
              <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            {/if}
          </div>
          <h3 class="text-[20px] font-bold text-[#2b2b2b] mb-3">{item.title}</h3>
          <p class="text-[14px] leading-relaxed text-[#7a7f86] max-w-xs mx-auto">{item.desc}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ═══════════════════════ GALLERY ═══════════════════════ -->
<section class="py-4 overflow-hidden">
  <div class="marquee">
    <div class="marquee-track gap-2">
      {#each [...galleryImages, ...galleryImages] as img}
        <div class="w-[280px] h-[200px] flex-shrink-0 overflow-hidden bg-[#f3f4f6]">
          <img src={img} alt="" loading="lazy" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
               onerror={(e) => { (e.currentTarget as HTMLImageElement).style.opacity='0'; }} />
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ═══════════════════════ STATS ═══════════════════════ -->
<section id="stats" class="py-16" style="background:#2b2b2b">
  <div class="container-x">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
      {#each [
        { count: counts.users, suffix: '', label: $_('stats.users') },
        { count: counts.years, suffix: '', label: $_('stats.years') },
        { count: counts.vehicles, suffix: '+', label: $_('stats.vehicles') },
      ] as stat}
        <div>
          <div class="text-6xl md:text-7xl font-extrabold text-white mb-3 leading-none">{stat.count}{stat.suffix}</div>
          <div class="text-[12px] font-bold uppercase tracking-[0.16em]" style="color:#f5c518">{stat.label}</div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ═══════════════════════ BRANDS ═══════════════════════ -->
<div class="py-12 overflow-hidden" style="background:#fafbfc">
  <div class="marquee">
    <div class="marquee-track gap-4">
      {#each [...brands, ...brands] as brand}
        <a
          href={brand.href}
          target="_blank"
          rel="noreferrer"
          class="w-[200px] h-[110px] flex-shrink-0 bg-white rounded-lg border border-[#ededf0] flex flex-col items-center justify-center gap-2 px-6 text-center transition-all hover:border-[#f5c518]"
          aria-label={brand.name}
        >
          <img
            src={brand.src}
            alt={brand.name}
            loading="lazy"
            class="max-h-10 max-w-full object-contain"
            style={brand.filter ? `filter:${brand.filter}` : undefined}
          />
          <span class="text-[10px] font-bold uppercase text-[#9aa0a8]">{brand.name}</span>
        </a>
      {/each}
    </div>
  </div>
</div>
