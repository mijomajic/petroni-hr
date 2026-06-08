<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { Vehicle } from '$lib/supabase';
  import VehicleCard from '$lib/components/ui/VehicleCard.svelte';

  let vehicles: Vehicle[] = $state([]);
  let loading = $state(true);

  onMount(async () => {
    const { data } = await supabase.from('vehicles').select('*').eq('type', 'film').order('created_at', { ascending: false });
    vehicles = data ?? [];
    loading = false;
  });
</script>

<svelte:head><title>Vozila za filmske produkcije — Petroni</title></svelte:head>

<div class="min-h-[100dvh] pt-28 pb-20" style="background: #0a0a0a">
  <div class="max-w-7xl mx-auto px-4 md:px-6">
    <div class="mb-12">
      <nav class="flex items-center gap-2 text-xs mb-6" style="color: #9ca3af">
        <a href="/" class="hover:text-white">Naslovnica</a><span>/</span>
        <a href="/vozila" class="hover:text-white">Vozila</a><span>/</span>
        <span class="text-white">Filmske produkcije</span>
      </nav>
      <h1 class="text-5xl font-black uppercase tracking-tight text-white mb-3">VOZILA ZA FILMSKE PRODUKCIJE</h1>
      <p class="text-sm" style="color: #9ca3af">Posebno opremljena vozila za filmske i TV produkcije</p>
    </div>

    <!-- Hero description -->
    <div class="p-2 rounded-[2rem] mb-12" style="border: 1px solid #2a2a2a; background: rgba(255,255,255,0.02)">
      <div class="p-10 rounded-[1.5rem]" style="background: #111">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 class="text-2xl font-black uppercase tracking-tight text-white mb-4">Za vaš projekt</h2>
            <p class="text-sm leading-relaxed" style="color: #9ca3af">Nudimo posebno opremljena vozila za filmske i TV produkcije, reklame i photo shoot-ove. Fleksibilni uvjeti najma, brza dostava i stručna podrška tokom cijelog projekta.</p>
          </div>
          <div class="grid grid-cols-2 gap-3">
            {#each ['Garderoba', 'Šminkanje', 'Odmor ekipe', 'Catering', 'Oprema', 'Uređivanje'] as feature}
              <div class="flex items-center gap-2 p-3 rounded-xl" style="background: #1a1a1a; border: 1px solid #2a2a2a">
                <div class="w-2 h-2 rounded-full" style="background: #F5C518"></div>
                <span class="text-xs text-white">{feature}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>

    {#if loading}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {#each [1,2,3] as _}<div class="rounded-[2rem] aspect-[4/3] animate-pulse" style="background: #1a1a1a"></div>{/each}
      </div>
    {:else if vehicles.length === 0}
      <div class="text-center py-20 rounded-[2rem]" style="background: #111; border: 1px solid #1a1a1a">
        <p class="text-sm mb-4" style="color: #9ca3af">Za dostupnost vozila za filmske produkcije, molimo kontaktirajte nas direktno.</p>
        <a href="/kontakt" class="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest text-black" style="background: #F5C518">
          Kontaktirajte nas
        </a>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each vehicles as vehicle}
          <VehicleCard {vehicle} />
        {/each}
      </div>
    {/if}
  </div>
</div>
