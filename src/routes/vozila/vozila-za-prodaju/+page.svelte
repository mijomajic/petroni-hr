<script lang="ts">
  import type { Vehicle } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';
  import VehicleCard from '$lib/components/ui/VehicleCard.svelte';
  import type { PageProps } from './$types';
  import { BUSINESS } from '$lib/config/business';

  let { data }: PageProps = $props();
  const vehicles = $derived.by<Vehicle[]>(() => {
    const unique = new Map<string, Vehicle>();
    for (const vehicle of data.vehicles as Vehicle[]) {
      const key = vehicle.name
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/gi, '')
        .toLocaleLowerCase('hr');
      const existing = unique.get(key);
      // Prefer the rental row when the physical camper is also for sale. It is
      // the canonical record that keeps booking and sale actions together.
      if (!existing || (vehicle.type === 'rental' && existing.type !== 'rental')) unique.set(key, vehicle);
    }
    return [...unique.values()];
  });
</script>

<svelte:head>
  <title>{$locale === 'hr' ? 'Vozila za prodaju' : 'Vehicles for sale'} | {BUSINESS.name}</title>
  <meta name="description" content="Selected ex-rental campers with clear specifications, service history and direct support." />
</svelte:head>

<div class="section">
  <div class="container-x">
    <div class="text-center mb-10">
      <h1 class="section-title">{$locale === 'hr' ? 'Vozila za prodaju' : 'Vehicles for sale'}</h1>
      <p class="lead mt-4 max-w-3xl mx-auto">
        {$locale === 'hr'
          ? 'Povremeno nudimo odabrana vozila iz naše flote, uz jasne specifikacije, povijest održavanja i izravnu podršku našeg tima.'
          : 'We occasionally offer selected vehicles from our fleet, with clear specifications, maintenance history and direct support from our team.'}
      </p>
    </div>

    {#if vehicles.length === 0}
      <div class="text-center py-20 card">
        <p class="text-sm mb-4 text-[#7a7f86]">{$locale === 'hr' ? 'Trenutno nema vozila za prodaju.' : 'No vehicles for sale at the moment.'}</p>
        <a href="/kontakt" class="text-sm font-bold underline" style="color:#9f542e">{$locale === 'hr' ? 'Kontaktirajte nas za više informacija' : 'Contact us for more information'}</a>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {#each vehicles as vehicle}
          <VehicleCard {vehicle} />
        {/each}
      </div>
    {/if}

  </div>
</div>
