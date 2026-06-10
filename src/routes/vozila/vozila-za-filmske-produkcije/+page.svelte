<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { Vehicle } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';
  import VehicleCard from '$lib/components/ui/VehicleCard.svelte';

  const seed: Vehicle[] = [
    { id: 'f1', slug: 'citroen-unitvan', name: 'Citroën UnitVan', type: 'film', category: null, seats: 3, bags: 2, price_per_day: null, sale_price: null, description_hr: '', description_en: '', images: ['https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg'], specs: {}, is_available: true, created_at: '' },
    { id: 'f2', slug: 'honeywagon-vacum-jet-1', name: 'Honeywagon – prikolica WC Vacum-Jet 1+1', type: 'film', category: null, seats: 0, bags: 0, price_per_day: null, sale_price: null, description_hr: 'Minimalna potrošnja vode i energije. Solarni paneli i baterije 12v osiguravaju…', description_en: 'Minimal water and energy consumption. Solar panels and 12v batteries.', images: ['https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg'], specs: {}, is_available: true, created_at: '' },
    { id: 'f3', slug: 'honeywagon-vacum-jet-2', name: 'Honeywagon – WC prikolica -Vacum Jet – 2+1+1', type: 'film', category: null, seats: 0, bags: 0, price_per_day: null, sale_price: null, description_hr: 'Dimenzije prikolice: 5,2m x 2,5m, odnosno sa ručnim rudom 6,8m x 2,5m…', description_en: 'Trailer dimensions 5.2m x 2.5m.', images: ['https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp'], specs: {}, is_available: true, created_at: '' },
    { id: 'f4', slug: 'kamion-eurocargo-75e15', name: 'Kamion EuroCargo 75E15 – taillift/grip/electric', type: 'film', category: null, seats: 3, bags: 0, price_per_day: null, sale_price: null, description_hr: 'Dimenzije sanduka 7,10m D x 2,4m Š x 2,8m V…', description_en: 'Box dimensions 7.10m x 2.4m x 2.8m.', images: ['https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg'], specs: {}, is_available: true, created_at: '' },
    { id: 'f5', slug: 'make-up-truck-peugeot-boxer', name: 'Make up truck – 2+1 radna mjesta – Peugeot Boxer', type: 'film', category: null, seats: 3, bags: 0, price_per_day: null, sale_price: null, description_hr: 'Ovaj prenamijenjeni kamion za make-up savršeno je rješenje za pružanje usluga uljepšavanja…', description_en: 'A repurposed make-up truck for beauty services.', images: ['https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg'], specs: {}, is_available: true, created_at: '' },
    { id: 'f6', slug: 'costume-truck-renault-master', name: 'Costume truck RENAULT MASTER Box', type: 'film', category: null, seats: 3, bags: 0, price_per_day: null, sale_price: null, description_hr: '', description_en: '', images: ['https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp'], specs: {}, is_available: true, created_at: '' },
  ];

  let vehicles: Vehicle[] = $state(seed);

  onMount(() => {
    supabase.from('vehicles').select('*').eq('type', 'film').order('created_at', { ascending: false })
      .then(({ data }) => { if (data?.length) vehicles = data; });
  });
</script>

<svelte:head><title>Vozila za filmske produkcije — Petroni</title></svelte:head>

<div class="section">
  <div class="container-x">
    <div class="text-center mb-12">
      <h1 class="section-title">{$locale === 'hr' ? 'Vozila za filmske produkcije' : 'Vehicles for film productions'}</h1>
      <p class="lead mt-4 max-w-3xl mx-auto">
        {$locale === 'hr'
          ? 'Nudimo posebno opremljena vozila za filmske i TV produkcije, reklame i fotografiranja. Fleksibilni uvjeti najma, brza dostava i stručna podrška tijekom cijelog projekta.'
          : 'We offer specially equipped vehicles for film and TV productions, commercials and photo shoots. Flexible rental terms, fast delivery and expert support throughout the project.'}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
      {#each vehicles as vehicle}
        <VehicleCard {vehicle} detailHref={`/vozila/najam-kampera/${vehicle.slug}`} />
      {/each}
    </div>
  </div>
</div>
