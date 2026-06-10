<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { ProductCategory } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';

  const seedCategories: ProductCategory[] = [
    { id: '1', slug: 'elektrika', name_hr: 'Elektrika', name_en: 'Electrical', parent_id: null, sort_order: 1 },
    { id: '2', slug: 'gume-i-oprema', name_hr: 'Gume i oprema', name_en: 'Tires & Equipment', parent_id: null, sort_order: 2 },
    { id: '3', slug: 'hladenje-grijanje', name_hr: 'Hlađenje / Grijanje', name_en: 'Cooling / Heating', parent_id: null, sort_order: 3 },
    { id: '4', slug: 'kamping-namjestaj', name_hr: 'Kamping namještaj / dijelovi', name_en: 'Camping Furniture', parent_id: null, sort_order: 4 },
    { id: '5', slug: 'karavan-tehnologija', name_hr: 'Karavan tehnologija i oprema', name_en: 'Caravan Technology', parent_id: null, sort_order: 5 },
    { id: '6', slug: 'kemikalije', name_hr: 'Kemikalije i sredstva', name_en: 'Chemicals', parent_id: null, sort_order: 6 },
    { id: '7', slug: 'kucanstvo-kuhinja', name_hr: 'Kućanstvo / kuhinja', name_en: 'Household / Kitchen', parent_id: null, sort_order: 7 },
    { id: '8', slug: 'motorhome-tehnologija', name_hr: 'Motorhome tehnologija i oprema', name_en: 'Motorhome Technology', parent_id: null, sort_order: 8 },
    { id: '9', slug: 'multimedija', name_hr: 'Multimedija', name_en: 'Multimedia', parent_id: null, sort_order: 9 },
    { id: '10', slug: 'oprema-za-van', name_hr: 'Oprema za van', name_en: 'Outdoor Equipment', parent_id: null, sort_order: 10 },
    { id: '11', slug: 'plinska-tehnologija', name_hr: 'Plinska tehnologija i oprema', name_en: 'Gas Technology', parent_id: null, sort_order: 11 },
    { id: '12', slug: 'prozori', name_hr: 'Prozori', name_en: 'Windows', parent_id: null, sort_order: 12 },
    { id: '13', slug: 'sigurnost', name_hr: 'Sigurnost', name_en: 'Security', parent_id: null, sort_order: 13 },
    { id: '14', slug: 'tende-i-dodaci', name_hr: 'Tende i dodaci', name_en: 'Awnings & Accessories', parent_id: null, sort_order: 14 },
    { id: '15', slug: 'voda-sanitarije', name_hr: 'Voda / Sanitarije', name_en: 'Water / Sanitary', parent_id: null, sort_order: 15 },
  ];

  let categories: ProductCategory[] = $state(seedCategories);

  onMount(() => {
    supabase.from('product_categories').select('*').is('parent_id', null).order('sort_order')
      .then(({ data }) => { if (data?.length) categories = data; });
  });
</script>

<svelte:head><title>Shop — Petroni</title></svelte:head>

<div class="section">
  <div class="container-x">
    <div class="text-center mb-12">
      <span class="eyebrow mb-3">{$locale === 'hr' ? 'Kamping oprema' : 'Camping equipment'}</span>
      <h1 class="section-title">Shop</h1>
      <p class="lead mt-3">{$locale === 'hr' ? 'Sve što trebate za savršeno kamping iskustvo' : 'Everything you need for the perfect camping experience'}</p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {#each categories as cat}
        <a href="/shop/{cat.slug}" class="card group flex items-center justify-between gap-3 p-5 hover:border-[#f5c518]">
          <span class="text-[14px] font-semibold text-[#3a3f45] leading-snug">{$locale === 'hr' ? cat.name_hr : (cat.name_en || cat.name_hr)}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5c518" stroke-width="2.5" class="flex-shrink-0 transition-transform group-hover:translate-x-1"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      {/each}
    </div>
  </div>
</div>
