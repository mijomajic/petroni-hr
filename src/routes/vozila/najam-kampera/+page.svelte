<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { Vehicle } from '$lib/supabase';
  import VehicleCard from '$lib/components/ui/VehicleCard.svelte';

  let vehicles: Vehicle[] = $state([]);
  let loading = $state(true);
  let filterCategory = $state('');
  let filterSeats = $state(0);

  const seed: Vehicle[] = [
    { id: '1', slug: 'weinsberg-caraone-550qdk', name: 'Weinsberg CaraOne 550QDK', type: 'rental', category: 'COMFORT', seats: 4, bags: 4, price_per_day: 120, sale_price: null, description_hr: null, description_en: null, images: ['https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg'], specs: { length: '8.5m', beds: 4 }, is_available: true, created_at: '' },
    { id: '2', slug: 'weinsberg-caraone-550uk', name: 'Weinsberg CaraOne 550UK', type: 'rental', category: 'ECO', seats: 4, bags: 3, price_per_day: 95, sale_price: null, description_hr: null, description_en: null, images: ['https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg'], specs: { length: '7.9m', beds: 2 }, is_available: true, created_at: '' },
    { id: '3', slug: 'caratour-ford-600mq', name: 'CaraTour Ford 600MQ', type: 'rental', category: 'ELITE', seats: 6, bags: 5, price_per_day: 180, sale_price: null, description_hr: null, description_en: null, images: ['https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp'], specs: { length: '9.2m', beds: 6 }, is_available: true, created_at: '' },
  ];

  const filtered = $derived(vehicles.filter(v => {
    if (filterCategory && v.category !== filterCategory) return false;
    if (filterSeats && (v.seats ?? 0) < filterSeats) return false;
    return true;
  }));

  onMount(async () => {
    const { data } = await supabase.from('vehicles').select('*').eq('type', 'rental').order('created_at', { ascending: false });
    vehicles = data?.length ? data : seed;
    loading = false;
  });
</script>

<svelte:head><title>Najam kampera — Petroni</title></svelte:head>

<div class="min-h-[100dvh] pt-28 pb-20" style="background: #0a0a0a">
  <div class="max-w-7xl mx-auto px-4 md:px-6">
    <!-- Header -->
    <div class="mb-12">
      <nav class="flex items-center gap-2 text-xs mb-6" style="color: #9ca3af">
        <a href="/" class="hover:text-white transition-colors">Naslovnica</a>
        <span>/</span>
        <a href="/vozila" class="hover:text-white transition-colors">Vozila</a>
        <span>/</span>
        <span class="text-white">Najam kampera</span>
      </nav>
      <h1 class="text-5xl font-black uppercase tracking-tight text-white mb-3">NAJAM KAMPERA</h1>
      <p class="text-sm" style="color: #9ca3af">Odaberite idealno vozilo za vaše putovanje</p>
    </div>

    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Filters sidebar -->
      <aside class="lg:w-64 space-y-6">
        <div class="p-6 rounded-2xl" style="background: #111; border: 1px solid #1a1a1a">
          <h3 class="text-xs font-bold uppercase tracking-widest mb-4" style="color: #F5C518">Filteri</h3>

          <div class="space-y-4">
            <div>
              <label class="text-xs uppercase tracking-widest font-medium mb-2 block" style="color: #9ca3af">Kategorija</label>
              <select
                class="w-full px-3 py-2 rounded-xl text-sm text-white focus:outline-none"
                style="background: #1a1a1a; border: 1px solid #2a2a2a"
                bind:value={filterCategory}
              >
                <option value="">Sve kategorije</option>
                <option value="COMFORT">COMFORT</option>
                <option value="ECO">ECO</option>
                <option value="ELITE">ELITE</option>
                <option value="DUO 4x4">DUO 4x4</option>
              </select>
            </div>

            <div>
              <label class="text-xs uppercase tracking-widest font-medium mb-2 block" style="color: #9ca3af">Min. sjedala</label>
              <input
                type="range" min="0" max="8" step="1"
                class="w-full accent-yellow-400"
                bind:value={filterSeats}
              />
              <p class="text-xs mt-1" style="color: #9ca3af">{filterSeats > 0 ? `${filterSeats}+` : 'Sve'}</p>
            </div>
          </div>

          {#if filterCategory || filterSeats > 0}
            <button
              onclick={() => { filterCategory = ''; filterSeats = 0; }}
              class="mt-4 text-xs font-medium underline transition-colors hover:text-white"
              style="color: #9ca3af"
            >
              Resetuj filtere
            </button>
          {/if}
        </div>

        <a
          href="/rezerviraj"
          class="block p-6 rounded-2xl text-center transition-all duration-300 hover:brightness-110"
          style="background: #F5C518"
        >
          <p class="font-black text-black text-sm uppercase tracking-widest">Rezerviraj</p>
          <p class="text-xs text-black/70 mt-1">Brza rezervacija</p>
        </a>
      </aside>

      <!-- Vehicles grid -->
      <div class="flex-1">
        {#if loading}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            {#each [1,2,3,4] as _}
              <div class="rounded-[2rem] aspect-[4/3] animate-pulse" style="background: #1a1a1a"></div>
            {/each}
          </div>
        {:else if filtered.length === 0}
          <div class="text-center py-20" style="color: #9ca3af">
            <p>Nema vozila za odabrane filtere.</p>
          </div>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            {#each filtered as vehicle}
              <VehicleCard {vehicle} />
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
