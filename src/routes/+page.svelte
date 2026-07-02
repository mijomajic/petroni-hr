<script lang="ts">
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { locale } from '$lib/stores/locale';
  import type { Vehicle, Product } from '$lib/supabase';
  import VehicleCard from '$lib/components/ui/VehicleCard.svelte';
  import ProductCard from '$lib/components/ui/ProductCard.svelte';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const rentalVehicles: Vehicle[] = $derived(data.rentalVehicles as Vehicle[]);
  const saleVehicles: Vehicle[] = $derived(data.saleVehicles as Vehicle[]);
  const products: Product[] = $derived(data.products as Product[]);
  let statsStarted = $state(false);

  const galleryImages = [
    'https://www.petroni.hr/wp-content/uploads/2025/02/hero-image-petroni-camping-and-caravaning-rental10-1.jpg',
    'https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg',
    'https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp',
    'https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg',
    'https://www.petroni.hr/wp-content/uploads/2024/03/DSC_0001-768x512.jpg',
    'https://www.petroni.hr/wp-content/uploads/2024/03/DSC_0003-768x512.jpg',
  ];

  const partners = ['Udruga Kampista', 'Polidor', 'Camping Adriatic', 'Camping Plitvice', 'Kamping Udruženje'];
  const brands = ['RIMOR', 'CARAVANS INT.', 'MEGA MOBIL', 'THETFORD', 'KNAUS', 'ROLLER TEAM', 'TRUMA', 'WEINSBERG'];

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
  <meta name="description" content="Petroni – najam i prodaja vrhunskih kampera i karavana. 19 godina iskustva, 20+ vozila, lokacije diljem Hrvatske i Europe." />
</svelte:head>

<!-- ═══════════════════════ HERO ═══════════════════════ -->
<section class="relative min-h-[68vh] md:min-h-[78vh] max-h-[760px] flex items-center overflow-hidden">
  <div class="absolute inset-0">
    <img src="https://www.petroni.hr/wp-content/uploads/2025/02/hero-image-petroni-camping-and-caravaning-rental10-1.jpg" alt="" class="w-full h-full object-cover" fetchpriority="high" />
    <div class="absolute inset-0" style="background:linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.65) 42%, rgba(0,0,0,0.18) 100%)"></div>
  </div>

  <div class="container-x relative z-10 w-full">
    <div class="max-w-xl">
      <h1 class="text-[28px] sm:text-[36px] md:text-5xl font-extrabold uppercase leading-[1.1] tracking-tight mb-5"
          style="color:#ffffff; text-shadow:0 2px 16px rgba(0,0,0,0.95), 0 0 40px rgba(0,0,0,0.6)">
        Putujte bez granica,<br /><span style="color:#f5c518">živite bez ograničenja.</span>
      </h1>
      <p class="text-[14px] md:text-base mb-8" style="color:rgba(255,255,255,0.92)">
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
      {#each partners as p}
        <div class="bg-white rounded-lg border border-[#ededf0] h-24 flex items-center justify-center px-4 text-center">
          <span class="text-[13px] font-semibold uppercase tracking-wide text-[#9aa0a8]">{p}</span>
        </div>
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

<!-- ═══════════════════════ DODATNE USLUGE I OPREMA ═══════════════════════ -->
<section class="section">
  <div class="container-x">
    <div class="text-center mb-12 reveal">
      <span class="eyebrow mb-3">{$locale === 'hr' ? 'Sve za bezbrižan odmor' : 'Everything for a carefree holiday'}</span>
      <h2 class="section-title">{$locale === 'hr' ? 'Dodatne usluge i oprema' : 'Additional services & equipment'}</h2>
    </div>

    {#if products.length > 0}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-5 reveal">
        {#each products as product}
          <ProductCard {product} />
        {/each}
      </div>
    {:else}
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 reveal">
        {#each [
          { hr: 'Elektrika', en: 'Electrical' },
          { hr: 'Hlađenje / Grijanje', en: 'Cooling / Heating' },
          { hr: 'Plinska oprema', en: 'Gas equipment' },
          { hr: 'Tende i dodaci', en: 'Awnings' },
          { hr: 'Voda / Sanitarije', en: 'Water / Sanitary' },
        ] as cat}
          <a href="/shop" class="card flex items-center justify-center text-center h-28 px-4 hover:border-[#f5c518]">
            <span class="text-[14px] font-semibold text-[#3a3f45]">{$locale === 'hr' ? cat.hr : cat.en}</span>
          </a>
        {/each}
      </div>
    {/if}

    <div class="text-center mt-10 reveal">
      <a href="/shop" class="btn btn-primary px-8 py-3.5">{$locale === 'hr' ? 'Pogledaj ponudu' : 'View the shop'}</a>
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
        <div class="w-[200px] h-[110px] flex-shrink-0 bg-white rounded-lg border border-[#ededf0] flex items-center justify-center">
          <span class="text-[15px] font-extrabold tracking-wide text-[#54585e]">{brand}</span>
        </div>
      {/each}
    </div>
  </div>
</div>
