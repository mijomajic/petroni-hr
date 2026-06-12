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
  let filterBeds = $state(0);
  let filterMaxPrice = $state(300);
  let filterAvailable = $state('');

  const hasActiveFilter = $derived(!!filterCategory || filterSeats > 0 || filterBeds > 0 || filterMaxPrice < 300 || !!filterAvailable);

  const filtered = $derived(vehicles.filter(v => {
    if (filterCategory && v.category !== filterCategory) return false;
    if (filterSeats && (v.seats ?? 0) < filterSeats) return false;
    if (filterBeds && ((v.specs as any)?.beds ?? 0) < filterBeds) return false;
    if (filterMaxPrice < 300 && (v.price_per_day ?? 0) > filterMaxPrice) return false;
    if (filterAvailable === 'yes' && !v.is_available) return false;
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
      <aside class="lg:w-[380px] flex-shrink-0 space-y-5">
        <div class="card p-7">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-[13px] font-bold uppercase tracking-widest" style="color:#b5890a">{$locale === 'hr' ? 'Filteri' : 'Filters'}</h3>
            {#if hasActiveFilter}
              <button onclick={() => { filterCategory = ''; filterSeats = 0; filterBeds = 0; filterMaxPrice = 300; filterAvailable = ''; }}
                class="text-[11px] font-semibold px-3 py-1 rounded border border-[#e2e4e8] text-[#8b9099] hover:border-[#f5c518] hover:text-[#2b2b2b] transition-colors">
                {$locale === 'hr' ? 'Poništi' : 'Reset'}
              </button>
            {/if}
          </div>
          <div class="space-y-7">
            <!-- Category -->
            <div>
              <span class="field-label">{$locale === 'hr' ? 'Kategorija vozila' : 'Vehicle category'}</span>
              <select class="field" bind:value={filterCategory}>
                <option value="">{$locale === 'hr' ? 'Sve kategorije' : 'All categories'}</option>
                <option value="COMFORT">COMFORT — obiteljski</option>
                <option value="ECO">ECO — ekonomičan</option>
                <option value="ELITE">ELITE — premium</option>
                <option value="DUO 4x4">DUO 4×4 — terenski</option>
              </select>
            </div>

            <!-- Min seats -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="field-label mb-0">{$locale === 'hr' ? 'Min. sjedala' : 'Min. seats'}</span>
                <span class="text-[13px] font-bold" style="color:#2b2b2b">{filterSeats > 0 ? `${filterSeats}+` : ($locale === 'hr' ? 'Sve' : 'All')}</span>
              </div>
              <input type="range" min="0" max="8" step="1" class="w-full accent-[#f5c518] h-2" bind:value={filterSeats} />
              <div class="flex justify-between text-[11px] text-[#c0c4cb] mt-1"><span>0</span><span>2</span><span>4</span><span>6</span><span>8</span></div>
            </div>

            <!-- Min beds -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="field-label mb-0">{$locale === 'hr' ? 'Min. ležajeva' : 'Min. beds'}</span>
                <span class="text-[13px] font-bold" style="color:#2b2b2b">{filterBeds > 0 ? `${filterBeds}+` : ($locale === 'hr' ? 'Sve' : 'All')}</span>
              </div>
              <input type="range" min="0" max="8" step="1" class="w-full accent-[#f5c518] h-2" bind:value={filterBeds} />
              <div class="flex justify-between text-[11px] text-[#c0c4cb] mt-1"><span>0</span><span>2</span><span>4</span><span>6</span><span>8</span></div>
            </div>

            <!-- Max price -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="field-label mb-0">{$locale === 'hr' ? 'Max. cijena / dan' : 'Max. price / day'}</span>
                <span class="text-[13px] font-bold" style="color:#2b2b2b">{filterMaxPrice < 300 ? `${filterMaxPrice} €` : ($locale === 'hr' ? 'Sve' : 'All')}</span>
              </div>
              <input type="range" min="50" max="300" step="10" class="w-full accent-[#f5c518] h-2" bind:value={filterMaxPrice} />
              <div class="flex justify-between text-[11px] text-[#c0c4cb] mt-1"><span>50 €</span><span>150 €</span><span>300+ €</span></div>
            </div>

            <!-- Availability -->
            <div>
              <span class="field-label">{$locale === 'hr' ? 'Dostupnost' : 'Availability'}</span>
              <select class="field" bind:value={filterAvailable}>
                <option value="">{$locale === 'hr' ? 'Sva vozila' : 'All vehicles'}</option>
                <option value="yes">{$locale === 'hr' ? 'Samo dostupna' : 'Available only'}</option>
              </select>
            </div>

            <!-- Quick tags -->
            <div>
              <span class="field-label mb-3 block">{$locale === 'hr' ? 'Brzi odabir' : 'Quick select'}</span>
              <div class="flex flex-wrap gap-2">
                {#each [['ECO', $locale === 'hr' ? 'Ekonomičan' : 'Budget'], ['COMFORT', $locale === 'hr' ? 'Obitelj' : 'Family'], ['ELITE', $locale === 'hr' ? 'Premium' : 'Premium']] as [val, label]}
                  <button onclick={() => filterCategory = filterCategory === val ? '' : val}
                    class="text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all"
                    style="border-color:{filterCategory === val ? '#f5c518' : '#e2e4e8'};background:{filterCategory === val ? '#fffbea' : '#fff'};color:{filterCategory === val ? '#b5890a' : '#6b7178'}">
                    {label}
                  </button>
                {/each}
              </div>
            </div>
          </div>
        </div>

        <a href="/rezerviraj" class="block card p-6 hover:border-[#f5c518] group" style="background:linear-gradient(135deg,#fffbea,#fff8d6)">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style="background:#f5c518">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <p class="font-bold text-[#2b2b2b] text-sm uppercase tracking-wide">{$locale === 'hr' ? 'Rezerviraj odmah' : 'Book now'}</p>
          </div>
          <p class="text-xs text-[#8b9099]">{$locale === 'hr' ? 'Brza i jednostavna rezervacija u nekoliko koraka' : 'Fast and easy booking in a few steps'}</p>
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
