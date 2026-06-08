<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { ProductCategory } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';

  let categories: ProductCategory[] = $state([]);
  let loading = $state(true);

  const seedCategories: ProductCategory[] = [
    { id: '1', slug: 'elektrika', name_hr: 'Elektrika', name_en: 'Electrical', parent_id: null, sort_order: 1 },
    { id: '2', slug: 'gume-i-oprema', name_hr: 'Gume i oprema', name_en: 'Tires & Equipment', parent_id: null, sort_order: 2 },
    { id: '3', slug: 'hladenje-grijanje', name_hr: 'Hlađenje/Grijanje', name_en: 'Cooling/Heating', parent_id: null, sort_order: 3 },
    { id: '4', slug: 'kamping-namjestaj', name_hr: 'Kamping namještaj/dijelovi', name_en: 'Camping Furniture', parent_id: null, sort_order: 4 },
    { id: '5', slug: 'karavan-tehnologija', name_hr: 'Karavan tehnologija i oprema', name_en: 'Caravan Technology', parent_id: null, sort_order: 5 },
    { id: '6', slug: 'kemikalije', name_hr: 'Kemikalije i sredstva', name_en: 'Chemicals', parent_id: null, sort_order: 6 },
    { id: '7', slug: 'kucanstvo-kuhinja', name_hr: 'Kućanstvo/kuhinja', name_en: 'Household/Kitchen', parent_id: null, sort_order: 7 },
    { id: '8', slug: 'motorhome-tehnologija', name_hr: 'Motorhome tehnologija i oprema', name_en: 'Motorhome Technology', parent_id: null, sort_order: 8 },
    { id: '9', slug: 'multimedija', name_hr: 'Multimedija', name_en: 'Multimedia', parent_id: null, sort_order: 9 },
    { id: '10', slug: 'oprema-za-van', name_hr: 'Oprema za van', name_en: 'Outdoor Equipment', parent_id: null, sort_order: 10 },
    { id: '11', slug: 'plinska-tehnologija', name_hr: 'Plinska tehnologija i oprema', name_en: 'Gas Technology', parent_id: null, sort_order: 11 },
    { id: '12', slug: 'prozori', name_hr: 'Prozori', name_en: 'Windows', parent_id: null, sort_order: 12 },
    { id: '13', slug: 'sigurnost', name_hr: 'Sigurnost', name_en: 'Security', parent_id: null, sort_order: 13 },
    { id: '14', slug: 'tende-i-dodaci', name_hr: 'Tende i dodaci', name_en: 'Awnings & Accessories', parent_id: null, sort_order: 14 },
    { id: '15', slug: 'voda-sanitarije', name_hr: 'Voda/Sanitarije', name_en: 'Water/Sanitary', parent_id: null, sort_order: 15 },
  ];

  const catIcons: Record<string, string> = {
    'elektrika': '⚡', 'gume-i-oprema': '🔧', 'hladenje-grijanje': '❄️',
    'kamping-namjestaj': '🛋️', 'karavan-tehnologija': '🚐', 'kemikalije': '🧴',
    'kucanstvo-kuhinja': '🍳', 'motorhome-tehnologija': '🚌', 'multimedija': '📺',
    'oprema-za-van': '⛺', 'plinska-tehnologija': '🔥', 'prozori': '🪟',
    'sigurnost': '🔒', 'tende-i-dodaci': '🏕️', 'voda-sanitarije': '💧',
  };

  onMount(async () => {
    const { data } = await supabase
      .from('product_categories')
      .select('*')
      .is('parent_id', null)
      .order('sort_order');
    categories = data?.length ? data : seedCategories;
    loading = false;
  });
</script>

<svelte:head><title>Shop — Petroni</title></svelte:head>

<div class="min-h-[100dvh] pt-28 pb-20" style="background: #0a0a0a">
  <div class="max-w-7xl mx-auto px-4 md:px-6">
    <div class="text-center mb-16">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-5" style="background: rgba(245,197,24,0.1); color: #F5C518; border: 1px solid rgba(245,197,24,0.2)">
        Kamping oprema
      </span>
      <h1 class="text-5xl md:text-6xl font-black uppercase tracking-tight text-white mb-4">SHOP</h1>
      <p class="text-sm" style="color: #9ca3af">Sve što trebate za savršeno kamping iskustvo</p>
    </div>

    {#if loading}
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {#each Array(15) as _}
          <div class="rounded-2xl aspect-square animate-pulse" style="background: #1a1a1a"></div>
        {/each}
      </div>
    {:else}
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {#each categories as cat}
          <a
            href="/shop/{cat.slug}"
            class="group p-2 rounded-2xl transition-all duration-500 hover:scale-[1.03]"
            style="background: #1a1a1a; border: 1px solid #2a2a2a"
          >
            <div class="p-6 rounded-xl" style="background: #111">
              <div class="text-3xl mb-4">{catIcons[cat.slug] || '📦'}</div>
              <h3 class="font-bold text-white text-sm leading-tight mb-1">
                {$locale === 'hr' ? cat.name_hr : (cat.name_en || cat.name_hr)}
              </h3>
              <div class="flex items-center gap-1 mt-2" style="color: #F5C518">
                <span class="text-[10px] font-bold uppercase tracking-widest">Pogledaj</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="transition-transform group-hover:translate-x-1"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </div>
</div>
