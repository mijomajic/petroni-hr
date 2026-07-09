<script lang="ts">
  import type { Vehicle } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';
  import VehicleCard from '$lib/components/ui/VehicleCard.svelte';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const vehicles: Vehicle[] = $derived(data.vehicles as Vehicle[]);
</script>

<svelte:head>
  <title>Vozila za prodaju — Petroni</title>
  <meta name="description" content="Petroni vozila za prodaju s fotografijama, specifikacijama i ključnim informacijama za odabir kampera ili karavana." />
  <meta property="og:title" content="Vozila za prodaju — Petroni" />
  <meta property="og:description" content="Petroni vozila za prodaju s fotografijama, specifikacijama i ključnim informacijama za odabir kampera ili karavana." />
</svelte:head>

<div class="section">
  <div class="container-x">
    <div class="text-center mb-10">
      <h1 class="section-title">{$locale === 'hr' ? 'Vozila za prodaju' : 'Vehicles for sale'}</h1>
      <p class="lead mt-4 max-w-3xl mx-auto">
        {$locale === 'hr'
          ? 'U ponudi Petroni vozila za prodaju nalazi se proširen izbor vozila opremljenih za sve — uz detaljne specifikacije, fotografije i ključne informacije za svaki model. Pronađite savršeno vozilo za sebe.'
          : 'The Petroni for-sale offer features a wide selection of vehicles for everyone — with detailed specifications, photos and key info for every model. Find the perfect vehicle for you.'}
      </p>
    </div>

    {#if vehicles.length === 0}
      <div class="text-center py-20 card">
        <p class="text-sm mb-4 text-[#7a7f86]">{$locale === 'hr' ? 'Trenutno nema vozila za prodaju.' : 'No vehicles for sale at the moment.'}</p>
        <a href="/kontakt" class="text-sm font-bold underline" style="color:#b5890a">{$locale === 'hr' ? 'Kontaktirajte nas za više informacija' : 'Contact us for more information'}</a>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {#each vehicles as vehicle}
          <VehicleCard {vehicle} detailHref={`/vozila/najam-kampera/${vehicle.slug}`} />
        {/each}
      </div>
    {/if}

    <p class="text-center text-[14px] text-[#7a7f86] mt-10">
      {$locale === 'hr' ? 'Zanima Vas više?' : 'Want to see more?'}
      <a href="/vozila/vozila-za-prodaju" class="font-semibold" style="color:#f5c518">{$locale === 'hr' ? 'Pogledajte sva vozila za prodaju' : 'See all vehicles for sale'}</a>
      {$locale === 'hr' ? 'ili posjetite naš' : 'or visit our'}
      <a href="https://www.njuskalo.hr" target="_blank" rel="noopener" class="font-semibold" style="color:#f5c518">Njuškalo profil</a>!
    </p>
  </div>
</div>
