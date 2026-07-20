<script lang="ts">
  import { onMount } from 'svelte';
  import VehicleCard from '$lib/components/ui/VehicleCard.svelte';
  import { localizedText, type SitePageContent, type SitePageSection } from '$lib/site-page-content';
  import { locale } from '$lib/stores/locale';
  import type { Vehicle } from '$lib/supabase';

  type Props = { content: SitePageContent; rentalVehicles: Vehicle[]; saleVehicles: Vehicle[] };
  let { content, rentalVehicles, saleVehicles }: Props = $props();
  let counts = $state<Record<string, number>>({});
  let statsStarted = $state(false);
  const visibleSections = $derived(content.sections.filter((section) => section.visible));

  const tx = (value: { hr: string; en: string } | undefined) => localizedText(value, $locale);

  function animateCounters(section: SitePageSection) {
    const targets = section.items ?? [];
    const duration = 1800;
    const steps = 60;
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      const eased = 1 - Math.pow(1 - step / steps, 3);
      counts = Object.fromEntries(targets.map((item) => [item.id, Math.floor(eased * Number(item.value ?? 0))]));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
  }

  onMount(() => {
    const statsSection = visibleSections.find((section) => section.type === 'stats');
    const statsElement = document.getElementById('stats');
    if (!statsSection || !statsElement) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting) && !statsStarted) {
        statsStarted = true;
        animateCounters(statsSection);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(statsElement);
    return () => observer.disconnect();
  });
</script>

{#each visibleSections as section (section.id)}
  {#if section.type === 'hero'}
    <section class="relative flex min-h-[68vh] max-h-[760px] items-center overflow-hidden md:min-h-[78vh]">
      <div class="absolute inset-0">
        {#if section.image}<img src={section.image} alt={tx(section.imageAlt)} class="h-full w-full object-cover" fetchpriority="high" />{/if}
        <div class="absolute inset-0" style="background:linear-gradient(to left, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.38) 36%, rgba(0,0,0,0.08) 76%, rgba(0,0,0,0.02) 100%)"></div>
        <div class="absolute inset-0 bg-[rgba(39,42,47,0.08)]"></div>
      </div>
      <div class="container-x relative w-full">
        <div class="ml-auto max-w-xl text-center md:text-right">
          <h1 class="mb-5 text-[28px] font-extrabold uppercase leading-[1.1] tracking-tight text-white sm:text-[36px] md:text-[2.35rem]" style="text-shadow:0 2px 14px rgba(0,0,0,0.78), 0 0 30px rgba(0,0,0,0.42)">
            {#each tx(section.title).split('\n') as line, index}<span class="block" style:color={index > 0 ? '#f5c518' : '#ffffff'}>{line}</span>{/each}
          </h1>
          {#if tx(section.body)}<p class="mb-8 text-[14px] text-white/95 md:ml-auto md:max-w-lg md:text-base" style="text-shadow:0 1px 10px rgba(0,0,0,0.55)">{tx(section.body)}</p>{/if}
          {#if section.ctaHref && tx(section.ctaLabel)}<a href={section.ctaHref} class="btn btn-primary px-8 py-4">{tx(section.ctaLabel)}</a>{/if}
        </div>
      </div>
    </section>
  {:else if section.type === 'vehicle_grid'}
    {@const vehicles = section.variant === 'sale' ? saleVehicles : rentalVehicles}
    <section class="section">
      <div class="container-x">
        <div class="mb-12 text-center reveal">{#if tx(section.eyebrow)}<span class="eyebrow mb-3">{tx(section.eyebrow)}</span>{/if}<h2 class="section-title">{tx(section.title)}</h2></div>
        <div class="grid grid-cols-1 gap-7 md:grid-cols-3 reveal">{#each vehicles.slice(0, 3) as vehicle}<VehicleCard {vehicle} />{/each}</div>
        {#if section.ctaHref && tx(section.ctaLabel)}<p class="mt-10 text-center text-[14px] text-[#7a7f86] reveal">{tx(section.body)} <a href={section.ctaHref} class="font-semibold text-[#b5890a] hover:underline">{tx(section.ctaLabel)}</a></p>{/if}
      </div>
    </section>
  {:else if section.type === 'logo_grid'}
    <section class="bg-[#f6f7f9] py-10">
      <div class="container-x"><div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {#each section.items ?? [] as item}
          <a href={item.href || '#'} target="_blank" rel="noreferrer" class="flex h-28 flex-col items-center justify-center gap-2 rounded-lg border border-[#ededf0] bg-white px-4 text-center transition hover:-translate-y-0.5 hover:border-[#f5c518]" aria-label={tx(item.title)}>
            {#if item.image}<img src={item.image} alt={tx(item.title)} loading="lazy" class="max-h-12 max-w-[150px] object-contain" style:filter={item.filter || undefined} />{/if}
            <span class="text-[10px] font-bold uppercase text-[#8b9099]">{tx(item.title)}</span>
          </a>
        {/each}
      </div></div>
    </section>
  {:else if section.type === 'feature_grid'}
    <section class="section bg-[#fafbfc]">
      <div class="container-x">
        <div class="mb-16 text-center reveal">{#if tx(section.eyebrow)}<span class="eyebrow mb-3">{tx(section.eyebrow)}</span>{/if}<h2 class="section-title">{tx(section.title)}</h2></div>
        <div class="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {#each section.items ?? [] as item}
            <div class="px-4 text-center reveal">
              <div class="mb-5 flex items-center justify-center text-[#f5c518]">
                {#if item.icon === 'card'}<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                {:else if item.icon === 'pin'}<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {:else}<svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>{/if}
              </div>
              <h3 class="mb-3 text-[20px] font-bold text-[#2b2b2b]">{tx(item.title)}</h3><p class="mx-auto max-w-xs text-[14px] leading-relaxed text-[#7a7f86]">{tx(item.body)}</p>
            </div>
          {/each}
        </div>
      </div>
    </section>
  {:else if section.type === 'image_strip'}
    <section class="overflow-hidden py-4"><div class="marquee"><div class="marquee-track gap-2">
      {#each [...(section.items ?? []), ...(section.items ?? [])] as item}
        <div class="h-[200px] w-[280px] flex-shrink-0 overflow-hidden bg-[#f3f4f6]">{#if item.image}<img src={item.image} alt={tx(item.alt)} loading="lazy" class="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />{/if}</div>
      {/each}
    </div></div></section>
  {:else if section.type === 'stats'}
    <section id="stats" class="bg-[#2b2b2b] py-16"><div class="container-x"><div class="grid grid-cols-1 gap-10 text-center md:grid-cols-3">
      {#each section.items ?? [] as item}<div><div class="mb-3 text-6xl font-extrabold leading-none text-white md:text-7xl">{counts[item.id] ?? 0}{item.suffix ?? ''}</div><div class="text-[12px] font-bold uppercase tracking-[0.16em] text-[#f5c518]">{tx(item.title)}</div></div>{/each}
    </div></div></section>
  {:else if section.type === 'logo_marquee'}
    <section class="overflow-hidden bg-[#fafbfc] py-12"><div class="marquee"><div class="marquee-track gap-4">
      {#each [...(section.items ?? []), ...(section.items ?? [])] as item}
        <a href={item.href || '#'} target="_blank" rel="noreferrer" class="flex h-[110px] w-[200px] flex-shrink-0 flex-col items-center justify-center gap-2 rounded-lg border border-[#ededf0] bg-white px-6 text-center transition hover:border-[#f5c518]" aria-label={tx(item.title)}>
          {#if item.image}<img src={item.image} alt={tx(item.title)} loading="lazy" class="max-h-10 max-w-full object-contain" style:filter={item.filter || undefined} />{/if}<span class="text-[10px] font-bold uppercase text-[#8b9099]">{tx(item.title)}</span>
        </a>
      {/each}
    </div></div></section>
  {/if}
{/each}
