<script lang="ts">
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { supabase } from '$lib/supabase';
  import type { Vehicle } from '$lib/supabase';
  import VehicleCard from '$lib/components/ui/VehicleCard.svelte';

  let rentalVehicles: Vehicle[] = $state([]);
  let saleVehicles: Vehicle[] = $state([]);
  let statsVisible = $state(false);

  // Seed vehicles for display when DB is empty
  const seedRental: Vehicle[] = [
    {
      id: '1', slug: 'weinsberg-caraone-550qdk', name: 'Weinsberg CaraOne 550QDK',
      type: 'rental', category: 'COMFORT', seats: 4, bags: 4,
      price_per_day: 120, sale_price: null,
      description_hr: 'Udoban obiteljski karavan s prostornim rasporedom.',
      description_en: 'Comfortable family caravan with spacious layout.',
      images: ['https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg'],
      specs: { length: '8.5m', beds: 4 }, is_available: true, created_at: ''
    },
    {
      id: '2', slug: 'weinsberg-caraone-550uk', name: 'Weinsberg CaraOne 550UK',
      type: 'rental', category: 'ECO', seats: 4, bags: 3,
      price_per_day: 95, sale_price: null,
      description_hr: 'Kompaktan i ekonomičan karavan za dva putnika.',
      description_en: null, images: ['https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg'],
      specs: { length: '7.9m', beds: 2 }, is_available: true, created_at: ''
    },
    {
      id: '3', slug: 'caratour-ford-600mq', name: 'CaraTour Ford 600MQ',
      type: 'rental', category: 'ELITE', seats: 6, bags: 5,
      price_per_day: 180, sale_price: null,
      description_hr: 'Luksuzni motorhome za nezaboravna putovanja.',
      description_en: null, images: ['https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp'],
      specs: { length: '9.2m', beds: 6 }, is_available: true, created_at: ''
    },
  ];

  const galleryImages = [
    'https://www.petroni.hr/wp-content/uploads/2024/03/DSC_0001-768x512.jpg',
    'https://www.petroni.hr/wp-content/uploads/2024/03/DSC_0002-768x512.jpg',
    'https://www.petroni.hr/wp-content/uploads/2024/03/DSC_0003-768x512.jpg',
    'https://www.petroni.hr/wp-content/uploads/2024/03/DSC_0004-768x512.jpg',
    'https://www.petroni.hr/wp-content/uploads/2024/03/DSC_0005-768x512.jpg',
    'https://www.petroni.hr/wp-content/uploads/2024/03/DSC_0006-768x512.jpg',
  ];

  const partners = [
    { name: 'Udruga kampista', url: 'https://www.udrugakampista.hr', img: 'https://www.udrugakampista.hr/wp-content/uploads/2021/02/logo-udruga-kampista.png' },
    { name: 'Camping Polidor', url: 'https://www.campingpolidor.com', img: 'https://www.campingpolidor.com/wp-content/themes/polidor/images/logo.png' },
    { name: 'Camp Čikat', url: 'https://www.camp-cikat.com', img: 'https://www.camp-cikat.com/wp-content/themes/cikat/images/logo.svg' },
    { name: 'Camping Plitvice', url: 'https://www.campingplitvice.hr', img: 'https://www.campingplitvice.hr/wp-content/uploads/2020/01/logo-camping-plitvice.png' },
    { name: 'Camping.hr', url: 'https://www.camping.hr', img: 'https://www.camping.hr/images/logo.png' },
  ];

  const brands = [
    { name: 'Rimor', img: 'https://www.petroni.hr/wp-content/uploads/2024/03/rimor-logo.png' },
    { name: 'Caravans International', img: 'https://www.petroni.hr/wp-content/uploads/2024/03/caravans-international-logo.png' },
    { name: 'Mega Mobil', img: 'https://www.petroni.hr/wp-content/uploads/2024/03/mega-mobil-logo.png' },
    { name: 'Thetford', img: 'https://www.petroni.hr/wp-content/uploads/2024/03/thetford-logo.png' },
    { name: 'Knaus', img: 'https://www.petroni.hr/wp-content/uploads/2024/03/knaus-logo.png' },
    { name: 'Roller Team', img: 'https://www.petroni.hr/wp-content/uploads/2024/03/roller-team-logo.png' },
    { name: 'Truma', img: 'https://www.petroni.hr/wp-content/uploads/2024/03/truma-logo.png' },
    { name: 'Weinsberg', img: 'https://www.petroni.hr/wp-content/uploads/2024/03/weinsberg-logo.png' },
  ];

  // Animated counter
  let counts = $state({ users: 0, years: 0, vehicles: 0 });
  const targets = { users: 546, years: 19, vehicles: 20 };

  function animateCounters() {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      counts = {
        users: Math.floor(eased * targets.users),
        years: Math.floor(eased * targets.years),
        vehicles: Math.floor(eased * targets.vehicles),
      };
      if (step >= steps) clearInterval(timer);
    }, interval);
  }

  onMount(async () => {
    // Load vehicles from Supabase, fall back to seed data
    const { data: rentals } = await supabase
      .from('vehicles')
      .select('*')
      .eq('type', 'rental')
      .eq('is_available', true)
      .limit(6);
    rentalVehicles = rentals?.length ? rentals : seedRental;

    const { data: sales } = await supabase
      .from('vehicles')
      .select('*')
      .eq('type', 'sale')
      .limit(6);
    saleVehicles = sales || [];

    // Scroll reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          if (entry.target.id === 'stats-section') {
            if (!statsVisible) { statsVisible = true; animateCounters(); }
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  });
</script>

<svelte:head>
  <title>Petroni — Najam i prodaja kampera i karavana</title>
  <meta name="description" content="Petroni – najam i prodaja vrhunskih kampera i karavana. 19 godina iskustva, 20+ vozila, lokacije diljem Hrvatske i Europe." />
</svelte:head>

<!-- ═══════════════════════════════════ HERO ═══════════════════════════════════ -->
<section class="relative min-h-[100dvh] flex items-end overflow-hidden">
  <!-- Background image -->
  <div class="absolute inset-0">
    <img
      src="https://www.petroni.hr/wp-content/uploads/2025/02/hero-image-petroni-camping-and-caravaning-rental10-1.jpg"
      alt="Petroni hero"
      class="w-full h-full object-cover"
    />
    <!-- Gradient overlay -->
    <div class="absolute inset-0" style="background: linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.5) 50%, rgba(10,10,10,0.1) 100%)"></div>
  </div>

  <!-- Content -->
  <div class="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 pb-20 md:pb-28">
    <div class="max-w-3xl">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6" style="background: rgba(245,197,24,0.15); color: #F5C518; border: 1px solid rgba(245,197,24,0.3)">
        Kamping & Karavaning
      </span>
      <h1 class="text-4xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.9] tracking-tight text-white mb-6">
        PUTUJTE BEZ GRANICA,<br />
        <span style="color: #F5C518">ŽIVITE BEZ</span><br />
        OGRANIČENJA
      </h1>
      <p class="text-base md:text-lg mb-10 max-w-xl leading-relaxed" style="color: rgba(255,255,255,0.7)">
        Otkrijte slobodu ceste s vrhunskim kamperima i karavanima. Vaša avantura počinje ovdje.
      </p>
      <div class="flex flex-wrap gap-4">
        <a
          href="/rezerviraj"
          class="group flex items-center gap-3 px-7 py-4 rounded-full font-black text-sm uppercase tracking-widest text-black transition-all duration-500 hover:brightness-110 active:scale-95 hover:shadow-2xl"
          style="background: #F5C518; box-shadow: 0 8px 40px rgba(245,197,24,0.3)"
        >
          REZERVIRAJ SADA
          <span class="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
        </a>
        <a
          href="/vozila"
          class="flex items-center gap-2 px-7 py-4 rounded-full font-bold text-sm uppercase tracking-widest text-white transition-all duration-300 hover:bg-white/10"
          style="border: 1px solid rgba(255,255,255,0.2)"
        >
          Pogledaj vozila
        </a>
      </div>
    </div>
  </div>

  <!-- Scroll indicator -->
  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
    <span class="text-[10px] uppercase tracking-[0.3em] text-white">Scroll</span>
    <div class="w-px h-12 origin-top" style="background: linear-gradient(to bottom, white, transparent); animation: scaleY 1.5s ease-in-out infinite alternate"></div>
  </div>
</section>

<!-- ══════════════════════════ OUR VEHICLES ══════════════════════════ -->
<section class="py-24 md:py-32 reveal" id="nasavozila">
  <div class="max-w-7xl mx-auto px-4 md:px-6">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
      <div>
        <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style="background: rgba(245,197,24,0.1); color: #F5C518; border: 1px solid rgba(245,197,24,0.2)">
          Najam kampera
        </span>
        <h2 class="text-4xl md:text-5xl font-black uppercase leading-tight tracking-tight text-white">
          NAŠA<br />VOZILA
        </h2>
        <p class="mt-3 text-sm uppercase tracking-[0.15em] font-medium" style="color: #9ca3af">
          Prihvatite izazov, doživite avanturu
        </p>
      </div>
      <a href="/vozila/najam-kampera" class="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors duration-200" style="color: #F5C518">
        Pogledajte sva vozila
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="transition-transform duration-300 group-hover:translate-x-1">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each rentalVehicles.slice(0, 3) as vehicle}
        <VehicleCard {vehicle} />
      {/each}
    </div>
  </div>
</section>

<!-- ══════════════════════════ PARTNER LOGOS ══════════════════════════ -->
<div class="py-12 reveal" style="border-top: 1px solid #1a1a1a; border-bottom: 1px solid #1a1a1a">
  <div class="max-w-7xl mx-auto px-4 md:px-6">
    <p class="text-center text-[10px] uppercase tracking-[0.3em] mb-8" style="color: #9ca3af">Naši partneri</p>
    <div class="flex items-center justify-center gap-8 md:gap-16 flex-wrap">
      {#each partners as partner}
        <a href={partner.url} target="_blank" rel="noopener" class="opacity-40 hover:opacity-80 transition-opacity duration-300 grayscale hover:grayscale-0">
          <span class="text-sm font-bold uppercase tracking-widest" style="color: white">{partner.name}</span>
        </a>
      {/each}
    </div>
  </div>
</div>

<!-- ══════════════════════════ VEHICLES FOR SALE ══════════════════════════ -->
<section class="py-24 md:py-32 reveal">
  <div class="max-w-7xl mx-auto px-4 md:px-6">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
      <div>
        <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style="background: rgba(245,197,24,0.1); color: #F5C518; border: 1px solid rgba(245,197,24,0.2)">
          Prodaja
        </span>
        <h2 class="text-4xl md:text-5xl font-black uppercase leading-tight tracking-tight text-white">
          VOZILA ZA<br />PRODAJU
        </h2>
        <p class="mt-3 text-sm uppercase tracking-[0.15em] font-medium" style="color: #9ca3af">
          Pronađite savršeno vozilo za sebe
        </p>
      </div>
      <a href="/vozila/vozila-za-prodaju" class="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors duration-200" style="color: #F5C518">
        Sva vozila za prodaju
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="transition-transform duration-300 group-hover:translate-x-1">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </a>
    </div>

    {#if saleVehicles.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each saleVehicles.slice(0, 3) as vehicle}
          <VehicleCard {vehicle} />
        {/each}
      </div>
    {:else}
      <div class="rounded-[2rem] p-12 text-center" style="background: #111; border: 1px solid #1a1a1a">
        <p class="text-sm" style="color: #9ca3af">Trenutno nema vozila za prodaju. Provjerite uskoro.</p>
      </div>
    {/if}
  </div>
</section>

<!-- ══════════════════════════ WHY US ══════════════════════════ -->
<section class="py-24 md:py-32 reveal" style="background: #080808">
  <div class="max-w-7xl mx-auto px-4 md:px-6">
    <div class="text-center mb-16">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-5" style="background: rgba(245,197,24,0.1); color: #F5C518; border: 1px solid rgba(245,197,24,0.2)">
        Zašto Petroni
      </span>
      <h2 class="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">ZAŠTO PETRONI?</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each [
        { icon: '💰', title: 'Bez skrivenih troškova', desc: 'Transparentne cijene, bez iznenađenja. Sve je uključeno u cijenu najma bez naknadnih troškova.' },
        { icon: '🗺️', title: 'Diljem Hrvatske i Europe', desc: 'Preuzimanje i povrat na 11+ lokacija uključujući Zagreb, Split, Dubrovnik, Pulu i europske destinacije.' },
        { icon: '⭐', title: '100% zadovoljstvo', desc: '19 godina iskustva i stotine zadovoljnih klijenata svake sezone. Vaše zadovoljstvo je naša misija.' },
      ] as item, i}
        <div class="p-2 rounded-[2rem]" style="background: rgba(255,255,255,0.03); border: 1px solid #2a2a2a">
          <div class="p-8 rounded-[calc(2rem-0.5rem)]" style="background: #111; box-shadow: inset 0 1px 1px rgba(255,255,255,0.05)">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6" style="background: rgba(245,197,24,0.1)">
              {item.icon}
            </div>
            <h3 class="text-xl font-bold text-white mb-3">{item.title}</h3>
            <p class="text-sm leading-relaxed" style="color: #9ca3af">{item.desc}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ══════════════════════════ GALLERY ══════════════════════════ -->
<section class="py-24 md:py-32 reveal overflow-hidden">
  <div class="max-w-7xl mx-auto px-4 md:px-6 mb-12">
    <div class="text-center">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-5" style="background: rgba(245,197,24,0.1); color: #F5C518; border: 1px solid rgba(245,197,24,0.2)">
        Galerija
      </span>
      <h2 class="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">NAŠE PUSTOLOVINE</h2>
    </div>
  </div>

  <!-- Auto-scroll gallery -->
  <div class="relative">
    <div class="flex gap-4 overflow-hidden">
      <div class="flex gap-4 animate-[scroll_30s_linear_infinite] min-w-max">
        {#each [...galleryImages, ...galleryImages] as img, i}
          <div class="w-72 h-52 rounded-2xl overflow-hidden flex-shrink-0" style="border: 1px solid #2a2a2a">
            <img
              src={img}
              alt="Petroni gallery {i + 1}"
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              loading="lazy"
              onerror={(e) => { const el = e.currentTarget as HTMLImageElement; el.style.display='none'; if(el.parentElement) el.parentElement.style.background='#1a1a1a'; }}
            />
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>

<!-- ══════════════════════════ SERVICES / SHOP ══════════════════════════ -->
<section class="py-24 md:py-32 reveal" style="background: #080808">
  <div class="max-w-7xl mx-auto px-4 md:px-6">
    <div class="p-2 rounded-[2.5rem]" style="background: rgba(245,197,24,0.05); border: 1px solid rgba(245,197,24,0.15)">
      <div class="p-10 md:p-16 rounded-[2rem] flex flex-col md:flex-row items-center gap-10" style="background: #111; box-shadow: inset 0 1px 1px rgba(255,255,255,0.05)">
        <div class="flex-1">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-5" style="background: rgba(245,197,24,0.1); color: #F5C518; border: 1px solid rgba(245,197,24,0.2)">
            Oprema
          </span>
          <h2 class="text-3xl md:text-5xl font-black uppercase leading-tight tracking-tight text-white mb-5">
            SVE ZA<br />BEZBRIŽAN<br />ODMOR
          </h2>
          <p class="text-sm leading-relaxed mb-8 max-w-md" style="color: #9ca3af">
            Kompletna oprema i pribor za kamping i karavaning. Od elektrike do sanitarija — sve što trebate za savršeno putovanje.
          </p>
          <a
            href="/shop"
            class="group inline-flex items-center gap-3 px-7 py-4 rounded-full font-black text-sm uppercase tracking-widest text-black transition-all duration-500 hover:brightness-110 active:scale-95"
            style="background: #F5C518"
          >
            Posjetite shop
            <span class="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </a>
        </div>
        <div class="w-full md:w-80 grid grid-cols-2 gap-3">
          {#each ['Elektrika', 'Grijanje', 'Sanitarije', 'Kamping namještaj', 'Plinska oprema', 'Sigurnost'] as cat}
            <div class="p-4 rounded-2xl flex items-center gap-3 transition-colors duration-200 hover:bg-white/5" style="background: rgba(255,255,255,0.03); border: 1px solid #2a2a2a">
              <div class="w-2 h-2 rounded-full flex-shrink-0" style="background: #F5C518"></div>
              <span class="text-xs font-medium text-white">{cat}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ══════════════════════════ STATS ══════════════════════════ -->
<section class="py-24 md:py-32 reveal" id="stats-section">
  <div class="max-w-7xl mx-auto px-4 md:px-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
      {#each [
        { count: counts.users, suffix: '+', label: 'ZADOVOLJNIH KORISNIKA' },
        { count: counts.years, suffix: '', label: 'GODINA PUTOVANJA' },
        { count: counts.vehicles, suffix: '+', label: 'RASPOLOŽIVIH VOZILA' },
      ] as stat}
        <div class="p-10">
          <div class="text-6xl md:text-7xl font-black mb-4" style="color: #F5C518">
            {stat.count}{stat.suffix}
          </div>
          <div class="text-xs font-bold uppercase tracking-[0.2em]" style="color: #9ca3af">{stat.label}</div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ══════════════════════════ BRAND LOGOS ══════════════════════════ -->
<div class="py-14 reveal" style="border-top: 1px solid #1a1a1a">
  <div class="max-w-7xl mx-auto px-4 md:px-6">
    <p class="text-center text-[10px] uppercase tracking-[0.3em] mb-8" style="color: #9ca3af">Brandovi koje zastupamo</p>
    <div class="flex items-center justify-center gap-6 md:gap-12 flex-wrap">
      {#each brands as brand}
        <div class="opacity-30 hover:opacity-70 transition-opacity duration-300">
          <span class="text-xs font-bold uppercase tracking-[0.2em] text-white">{brand.name}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<!-- ══════════════════════════ BOOKING CTA BANNER ══════════════════════════ -->
<section class="py-24 md:py-32 reveal">
  <div class="max-w-7xl mx-auto px-4 md:px-6">
    <div class="relative overflow-hidden rounded-[2.5rem] p-12 md:p-20 text-center" style="background: linear-gradient(135deg, #F5C518 0%, #e5a800 100%)">
      <!-- Background pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute -top-20 -right-20 w-80 h-80 rounded-full" style="background: rgba(0,0,0,0.2)"></div>
        <div class="absolute -bottom-20 -left-20 w-64 h-64 rounded-full" style="background: rgba(0,0,0,0.2)"></div>
      </div>
      <div class="relative z-10">
        <h2 class="text-3xl md:text-5xl font-black uppercase tracking-tight text-black mb-5">
          REZERVIRAJTE VAŠE<br />PUTOVANJE DANAS
        </h2>
        <p class="text-sm md:text-base text-black/70 mb-10 max-w-lg mx-auto">
          Slobodna mjesta se brzo popunjavaju. Osigurajte svoje vozilo i krenite na avanturu.
        </p>
        <a
          href="/rezerviraj"
          class="inline-flex items-center gap-3 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest text-white transition-all duration-300 hover:scale-105 active:scale-95"
          style="background: #0a0a0a"
        >
          REZERVIRAJ SADA
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    </div>
  </div>
</section>

<style>
  @keyframes scroll {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  @keyframes scaleY {
    from { transform: scaleY(0.5); opacity: 0.3; }
    to { transform: scaleY(1); opacity: 1; }
  }
</style>
