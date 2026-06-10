<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { Vehicle } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';
  import VehicleCard from '$lib/components/ui/VehicleCard.svelte';

  const seed: Vehicle[] = [
    { id: '1', slug: 'weinsberg-caraone-550qdk', name: 'Weinsberg CaraOne 550QDK', type: 'rental', category: 'COMFORT', seats: 4, bags: 4, price_per_day: 120, sale_price: null, description_hr: 'Udoban obiteljski karavan s prostranim rasporedom i potpunom opremom za ljetna putovanja.', description_en: 'Comfortable family caravan with a spacious layout.', images: ['https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg'], specs: { length: '8.5m', beds: 4 }, is_available: true, created_at: '' },
    { id: '2', slug: 'weinsberg-caraone-550uk', name: 'Weinsberg CaraOne 550UK', type: 'rental', category: 'ECO', seats: 4, bags: 3, price_per_day: 95, sale_price: null, description_hr: 'Kompaktan i ekonomičan karavan za par ili manju obitelj.', description_en: 'Compact and economical caravan.', images: ['https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg'], specs: { length: '7.9m', beds: 2 }, is_available: true, created_at: '' },
    { id: '3', slug: 'caratour-ford-600mq', name: 'CaraTour Ford 600MQ', type: 'rental', category: 'ELITE', seats: 6, bags: 5, price_per_day: 180, sale_price: null, description_hr: 'Kompaktan kamper za udobna putovanja, vrhunska oprema i prostran interijer.', description_en: 'Compact motorhome for comfortable travel.', images: ['https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp'], specs: { length: '9.2m', beds: 6 }, is_available: true, created_at: '' },
  ];

  let vehicles: Vehicle[] = $state(seed);
  let filterCategory = $state('');
  let filterSeats = $state(0);

  const filtered = $derived(vehicles.filter(v => {
    if (filterCategory && v.category !== filterCategory) return false;
    if (filterSeats && (v.seats ?? 0) < filterSeats) return false;
    return true;
  }));

  onMount(() => {
    supabase.from('vehicles').select('*').eq('type', 'rental').order('created_at', { ascending: false })
      .then(({ data }) => { if (data?.length) vehicles = data; });
  });
</script>

<svelte:head><title>Najam kampera — Petroni</title></svelte:head>

<div class="section">
  <div class="container-x">
    <nav class="flex items-center gap-2 text-xs mb-5 text-[#9aa0a8]">
      <a href="/" class="hover:text-[#b5890a]">{$locale === 'hr' ? 'Naslovnica' : 'Home'}</a><span>/</span>
      <a href="/vozila" class="hover:text-[#b5890a]">{$locale === 'hr' ? 'Vozila' : 'Vehicles'}</a><span>/</span>
      <span class="text-[#2b2b2b]">{$locale === 'hr' ? 'Najam kampera' : 'Camper rental'}</span>
    </nav>
    <h1 class="section-title mb-2">{$locale === 'hr' ? 'Najam kampera' : 'Camper rental'}</h1>
    <p class="lead mb-10">{$locale === 'hr' ? 'Odaberite idealno vozilo za vaše putovanje' : 'Choose the ideal vehicle for your journey'}</p>

    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Filters -->
      <aside class="lg:w-64 flex-shrink-0 space-y-6">
        <div class="card p-6">
          <h3 class="text-[12px] font-bold uppercase tracking-wide mb-4" style="color:#b5890a">{$locale === 'hr' ? 'Filteri' : 'Filters'}</h3>
          <div class="space-y-5">
            <div>
              <span class="field-label">{$locale === 'hr' ? 'Kategorija' : 'Category'}</span>
              <select class="field" bind:value={filterCategory}>
                <option value="">{$locale === 'hr' ? 'Sve kategorije' : 'All categories'}</option>
                <option value="COMFORT">COMFORT</option>
                <option value="ECO">ECO</option>
                <option value="ELITE">ELITE</option>
                <option value="DUO 4x4">DUO 4x4</option>
              </select>
            </div>
            <div>
              <span class="field-label">{$locale === 'hr' ? 'Min. sjedala' : 'Min. seats'}</span>
              <input type="range" min="0" max="8" step="1" class="w-full accent-[#f5c518]" bind:value={filterSeats} />
              <p class="text-xs mt-1 text-[#8b9099]">{filterSeats > 0 ? `${filterSeats}+` : ($locale === 'hr' ? 'Sve' : 'All')}</p>
            </div>
            {#if filterCategory || filterSeats > 0}
              <button onclick={() => { filterCategory = ''; filterSeats = 0; }} class="text-xs font-medium underline text-[#8b9099] hover:text-[#2b2b2b]">{$locale === 'hr' ? 'Poništi filtere' : 'Reset filters'}</button>
            {/if}
          </div>
        </div>
        <a href="/rezerviraj" class="block card p-6 text-center hover:border-[#f5c518]" style="background:#fffaf0">
          <p class="font-bold text-[#2b2b2b] text-sm uppercase tracking-wide">{$locale === 'hr' ? 'Rezerviraj' : 'Book now'}</p>
          <p class="text-xs text-[#8b9099] mt-1">{$locale === 'hr' ? 'Brza rezervacija' : 'Quick booking'}</p>
        </a>
      </aside>

      <!-- Grid -->
      <div class="flex-1">
        {#if filtered.length === 0}
          <div class="text-center py-20 text-[#8b9099]"><p>{$locale === 'hr' ? 'Nema vozila za odabrane filtere.' : 'No vehicles match the selected filters.'}</p></div>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-7">
            {#each filtered as vehicle}
              <VehicleCard {vehicle} />
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
