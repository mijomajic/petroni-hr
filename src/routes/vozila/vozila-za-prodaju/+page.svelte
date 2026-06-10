<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { Vehicle } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';
  import VehicleCard from '$lib/components/ui/VehicleCard.svelte';

  const seed: Vehicle[] = [
    { id: 'p1', slug: 'caratour-ford-600mq', name: 'CaraTour Ford 600MQ', type: 'sale', category: null, seats: 6, bags: 5, price_per_day: null, sale_price: 61625, description_hr: 'Weinsberg CaraTour Ford 600 MQ – kompaktan kamper za udobna putovanja Weinsberg…', description_en: 'Compact motorhome for comfortable travel.', images: ['https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp'], specs: {}, is_available: true, created_at: '' },
    { id: 'p2', slug: 'budgetvan-55', name: 'BudgetVan 55', type: 'sale', category: null, seats: 4, bags: 3, price_per_day: null, sale_price: null, description_hr: 'BudgetVan 55. Pristupačan kamper za sve. Predstavljamo BudgetVan 55, naš novi proizvod…', description_en: 'An affordable camper for everyone.', images: ['https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg'], specs: {}, is_available: true, created_at: '' },
    { id: 'p3', slug: 'mclouis-mc4-873', name: 'McLouis MC4 873', type: 'sale', category: null, seats: 6, bags: 4, price_per_day: null, sale_price: null, description_hr: 'Mc Louis MC4 873 – luksuz na četiri kotača. Predstavljamo Mc Lou…', description_en: 'Luxury on four wheels.', images: ['https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg'], specs: {}, is_available: true, created_at: '' },
    { id: 'p4', slug: 'caravans-international-horon-79m', name: 'CARAVANS INTERNATIONAL Horon 79M', type: 'sale', category: null, seats: 6, bags: 4, price_per_day: null, sale_price: 81625, description_hr: 'Caravans International Horon 79M TIM stvara san stvarnošću. CI International HORON 79M…', description_en: 'CI International HORON 79M.', images: ['https://www.petroni.hr/wp-content/uploads/2025/02/2-caratour-768x533.webp'], specs: {}, is_available: true, created_at: '' },
    { id: 'p5', slug: 'tegljac-lamboo-iveco-daily', name: 'Tegljač Lamboo Iveco Daily 35C18 8+E kat', type: 'sale', category: null, seats: 3, bags: 2, price_per_day: null, sale_price: null, description_hr: '150 000 km, u kvalitetnoj dobrom stanju. Služio kao pokretna ordinacija…', description_en: 'In good condition.', images: ['https://www.petroni.hr/wp-content/uploads/2024/06/CO550UK-4-768x576.jpg'], specs: {}, is_available: true, created_at: '' },
    { id: 'p6', slug: 'weinsberg-caracompact-suite-640meq', name: 'WEINSBERG CaraCompact Suite 640MEQ EDITION (PEPPER)', type: 'sale', category: null, seats: 4, bags: 4, price_per_day: null, sale_price: null, description_hr: 'Ovaj iznimno bogato opremljen kamper temelji se na bazi Mercedes Sprinter 315…', description_en: 'Richly equipped camper on a Mercedes Sprinter 315.', images: ['https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg'], specs: {}, is_available: true, created_at: '' },
  ];

  let vehicles: Vehicle[] = $state(seed);

  onMount(() => {
    supabase.from('vehicles').select('*').eq('type', 'sale').order('created_at', { ascending: false })
      .then(({ data }) => { if (data?.length) vehicles = data; });
  });
</script>

<svelte:head><title>Vozila za prodaju — Petroni</title></svelte:head>

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
