<script lang="ts">
  import type { Vehicle } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';

  type Props = {
    vehicle: Vehicle;
    showBook?: boolean;
  };
  let { vehicle, showBook = true }: Props = $props();

  const img = $derived(vehicle.images?.[0] || 'https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg');
  const name = $derived(vehicle.name);
  const price = $derived(vehicle.type === 'rental' ? vehicle.price_per_day : vehicle.sale_price);
</script>

<div class="group relative rounded-[2rem] overflow-hidden transition-all duration-700 hover:scale-[1.02]"
     style="background: #1a1a1a; border: 1px solid #2a2a2a">
  <!-- Outer shell (double-bezel) -->
  <div class="p-2 rounded-[2rem]">
    <!-- Image container -->
    <div class="relative overflow-hidden rounded-[1.5rem] aspect-video">
      <img
        src={img}
        alt={name}
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      {#if vehicle.category}
        <div class="absolute top-3 left-3">
          <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-black" style="background: #F5C518">
            {vehicle.category}
          </span>
        </div>
      {/if}
      <div class="absolute top-3 right-3">
        <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-white" style="background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.1)">
          {vehicle.is_available ? 'Dostupno' : 'Nije dostupno'}
        </span>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="px-5 pb-5 pt-1">
    <h3 class="font-bold text-lg tracking-tight text-white mb-3 truncate">{name}</h3>

    <!-- Specs row -->
    <div class="flex items-center gap-4 mb-4">
      {#if vehicle.seats}
        <div class="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: #9ca3af">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span class="text-xs" style="color: #9ca3af">{vehicle.seats}</span>
        </div>
      {/if}
      {#if vehicle.bags}
        <div class="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: #9ca3af">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
          </svg>
          <span class="text-xs" style="color: #9ca3af">{vehicle.bags}</span>
        </div>
      {/if}
      {#if vehicle.specs?.length}
        <div class="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: #9ca3af">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
          <span class="text-xs" style="color: #9ca3af">{vehicle.specs.length as string}</span>
        </div>
      {/if}
    </div>

    <!-- Price + CTA -->
    <div class="flex items-center justify-between">
      {#if price}
        <div>
          <span class="text-2xl font-bold text-white">€{price}</span>
          {#if vehicle.type === 'rental'}
            <span class="text-xs ml-1" style="color: #9ca3af">/ dan</span>
          {/if}
        </div>
      {/if}

      {#if showBook}
        {#if vehicle.type === 'rental'}
          <a
            href="/rezerviraj"
            class="group/btn flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest text-black transition-all duration-500 active:scale-95 hover:shadow-lg"
            style="background: #F5C518"
          >
            Rezerviraj
            <span class="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-300 group-hover/btn:translate-x-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </a>
        {:else}
          <a
            href="/vozila/vozila-za-prodaju/{vehicle.slug}"
            class="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-500 hover:bg-white/10"
            style="color: #F5C518; border: 1px solid #F5C518"
          >
            Detalji
          </a>
        {/if}
      {/if}
    </div>
  </div>
</div>
