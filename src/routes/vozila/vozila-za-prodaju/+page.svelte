<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { Vehicle } from '$lib/supabase';
  import VehicleCard from '$lib/components/ui/VehicleCard.svelte';

  let vehicles: Vehicle[] = $state([]);
  let loading = $state(true);

  onMount(async () => {
    const { data } = await supabase.from('vehicles').select('*').eq('type', 'sale').order('created_at', { ascending: false });
    vehicles = data ?? [];
    loading = false;
  });
</script>

<svelte:head><title>Vozila za prodaju — Petroni</title></svelte:head>

<div class="min-h-[100dvh] pt-28 pb-20" style="background: #0a0a0a">
  <div class="max-w-7xl mx-auto px-4 md:px-6">
    <div class="mb-12">
      <nav class="flex items-center gap-2 text-xs mb-6" style="color: #9ca3af">
        <a href="/" class="hover:text-white">Naslovnica</a><span>/</span>
        <a href="/vozila" class="hover:text-white">Vozila</a><span>/</span>
        <span class="text-white">Vozila za prodaju</span>
      </nav>
      <h1 class="text-5xl font-black uppercase tracking-tight text-white mb-3">VOZILA ZA PRODAJU</h1>
      <p class="text-sm" style="color: #9ca3af">Kvalitetni kamperi i karavani po konkurentnim cijenama</p>
    </div>

    {#if loading}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {#each [1,2,3] as _}<div class="rounded-[2rem] aspect-[4/3] animate-pulse" style="background: #1a1a1a"></div>{/each}
      </div>
    {:else if vehicles.length === 0}
      <div class="text-center py-20 rounded-[2rem]" style="background: #111; border: 1px solid #1a1a1a">
        <p class="text-sm mb-4" style="color: #9ca3af">Trenutno nema vozila za prodaju.</p>
        <a href="/kontakt" class="text-sm font-bold underline" style="color: #F5C518">Kontaktirajte nas za više informacija</a>
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
