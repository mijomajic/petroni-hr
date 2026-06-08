<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { Vehicle } from '$lib/supabase';

  let vehicle: Vehicle | null = $state(null);
  let loading = $state(true);
  let activeImage = $state(0);

  const seed: Record<string, Vehicle> = {
    'weinsberg-caraone-550qdk': { id: '1', slug: 'weinsberg-caraone-550qdk', name: 'Weinsberg CaraOne 550QDK', type: 'rental', category: 'COMFORT', seats: 4, bags: 4, price_per_day: 120, sale_price: null, description_hr: 'Udoban obiteljski karavan idealan za ljetna putovanja. Prostrani interijer s modernom opremom, klima uređaj, potpuno opremljena kuhinja i udobne ležaljke.', description_en: null, images: ['https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg'], specs: { Duljina: '8.5m', Težina: '1800kg', 'Ležajeva': 4, 'Sjedala': 4, 'Motor': 'Ford Transit 2.0 TDCI' }, is_available: true, created_at: '' },
    'weinsberg-caraone-550uk': { id: '2', slug: 'weinsberg-caraone-550uk', name: 'Weinsberg CaraOne 550UK', type: 'rental', category: 'ECO', seats: 4, bags: 3, price_per_day: 95, sale_price: null, description_hr: 'Kompaktan i ekonomičan karavan za par ili manju obitelj. Idealan za brze vikend izlete i dulja putovanja.', description_en: null, images: ['https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg'], specs: { Duljina: '7.9m', Težina: '1500kg', 'Ležajeva': 2, 'Sjedala': 4 }, is_available: true, created_at: '' },
    'caratour-ford-600mq': { id: '3', slug: 'caratour-ford-600mq', name: 'CaraTour Ford 600MQ', type: 'rental', category: 'ELITE', seats: 6, bags: 5, price_per_day: 180, sale_price: null, description_hr: 'Luksuzni motorhome za zahtjevne putnike. Panoramski prozori, premium materijali, potpuno opremljena kupaonica i kuhinja za nezaboravna putovanja.', description_en: null, images: ['https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp'], specs: { Duljina: '9.2m', Težina: '3500kg', 'Ležajeva': 6, 'Sjedala': 6, 'Motor': 'Ford Transit 2.0 TDCI 170KS' }, is_available: true, created_at: '' },
  };

  onMount(async () => {
    const slug = $page.params.slug;
    const { data } = await supabase.from('vehicles').select('*').eq('slug', slug).single();
    vehicle = data || seed[slug] || null;
    loading = false;
  });
</script>

<svelte:head>
  <title>{vehicle?.name ?? 'Vozilo'} — Petroni</title>
</svelte:head>

<div class="min-h-[100dvh] pt-24 pb-20" style="background: #0a0a0a">
  {#if loading}
    <div class="flex items-center justify-center h-96">
      <div class="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style="border-color: #F5C518; border-top-color: transparent"></div>
    </div>
  {:else if vehicle}
    <div class="max-w-7xl mx-auto px-4 md:px-6">
      <nav class="flex items-center gap-2 text-xs mb-8" style="color: #9ca3af">
        <a href="/" class="hover:text-white">Naslovnica</a><span>/</span>
        <a href="/vozila/najam-kampera" class="hover:text-white">Najam kampera</a><span>/</span>
        <span class="text-white">{vehicle.name}</span>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Gallery -->
        <div>
          <div class="rounded-[2rem] overflow-hidden aspect-video mb-3" style="border: 1px solid #2a2a2a">
            <img src={vehicle.images[activeImage]} alt={vehicle.name} class="w-full h-full object-cover" />
          </div>
          {#if vehicle.images.length > 1}
            <div class="flex gap-3">
              {#each vehicle.images as img, i}
                <button
                  onclick={() => activeImage = i}
                  class="w-20 h-14 rounded-xl overflow-hidden transition-all duration-200"
                  style="border: 2px solid {activeImage === i ? '#F5C518' : 'transparent'}"
                >
                  <img src={img} alt="" class="w-full h-full object-cover" />
                </button>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Details -->
        <div>
          {#if vehicle.category}
            <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-black" style="background: #F5C518">{vehicle.category}</span>
          {/if}
          <h1 class="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-4">{vehicle.name}</h1>

          <div class="text-3xl font-black text-white mb-8">
            €{vehicle.price_per_day}
            <span class="text-sm font-normal ml-1" style="color: #9ca3af">/ dan</span>
          </div>

          {#if vehicle.description_hr}
            <p class="text-sm leading-relaxed mb-8" style="color: #9ca3af">{vehicle.description_hr}</p>
          {/if}

          <!-- Specs -->
          {#if vehicle.specs}
            <div class="mb-8">
              <h3 class="text-xs font-bold uppercase tracking-[0.2em] mb-4" style="color: #F5C518">Specifikacije</h3>
              <div class="grid grid-cols-2 gap-3">
                {#each Object.entries(vehicle.specs) as [key, val]}
                  <div class="flex items-center justify-between p-3 rounded-xl" style="background: #111; border: 1px solid #1a1a1a">
                    <span class="text-xs" style="color: #9ca3af">{key}</span>
                    <span class="text-sm font-bold text-white">{val as string}</span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <a
            href="/rezerviraj"
            class="group flex items-center justify-center gap-3 w-full py-5 rounded-full font-black text-sm uppercase tracking-widest text-black transition-all duration-300 hover:brightness-110 active:scale-95"
            style="background: #F5C518"
          >
            REZERVIRAJ OVO VOZILO
            <span class="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center transition-transform group-hover:translate-x-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </a>
        </div>
      </div>
    </div>
  {:else}
    <div class="text-center py-20" style="color: #9ca3af">
      <p>Vozilo nije pronađeno.</p>
      <a href="/vozila/najam-kampera" class="mt-4 inline-block text-sm underline" style="color: #F5C518">Natrag na listu</a>
    </div>
  {/if}
</div>
