<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { Product } from '$lib/supabase';
  import ProductCard from '$lib/components/ui/ProductCard.svelte';
  import { locale } from '$lib/stores/locale';

  const allCategories = [
    { slug: 'elektrika', name_hr: 'Elektrika', name_en: 'Electrical' },
    { slug: 'gume-i-oprema', name_hr: 'Gume i oprema', name_en: 'Tires & Equipment' },
    { slug: 'hladenje-grijanje', name_hr: 'Hlađenje / Grijanje', name_en: 'Cooling / Heating' },
    { slug: 'kamping-namjestaj', name_hr: 'Kamping namještaj', name_en: 'Camping Furniture' },
    { slug: 'karavan-tehnologija', name_hr: 'Karavan tehnologija', name_en: 'Caravan Tech' },
    { slug: 'kemikalije', name_hr: 'Kemikalije i sredstva', name_en: 'Chemicals' },
    { slug: 'kucanstvo-kuhinja', name_hr: 'Kućanstvo / kuhinja', name_en: 'Household / Kitchen' },
    { slug: 'motorhome-tehnologija', name_hr: 'Motorhome tehnologija', name_en: 'Motorhome Tech' },
    { slug: 'multimedija', name_hr: 'Multimedija', name_en: 'Multimedia' },
    { slug: 'oprema-za-van', name_hr: 'Oprema za van', name_en: 'Outdoor Equipment' },
    { slug: 'plinska-tehnologija', name_hr: 'Plinska tehnologija', name_en: 'Gas Technology' },
    { slug: 'prozori', name_hr: 'Prozori', name_en: 'Windows' },
    { slug: 'sigurnost', name_hr: 'Sigurnost', name_en: 'Security' },
    { slug: 'tende-i-dodaci', name_hr: 'Tende i dodaci', name_en: 'Awnings' },
    { slug: 'voda-sanitarije', name_hr: 'Voda / Sanitarije', name_en: 'Water / Sanitary' },
  ];

  let products: Product[] = $state([]);
  let loading = $state(true);
  let sort = $state('newest');
  let search = $state('');
  let minPrice = $state($page.url.searchParams.get('min') ?? '');
  let maxPrice = $state($page.url.searchParams.get('max') ?? '');

  const sorted = $derived([...products]
    .filter(p => !search || (p.name_hr + (p.name_en ?? '')).toLowerCase().includes(search.toLowerCase()))
    .filter(p => minPrice === '' || p.price >= Number(minPrice))
    .filter(p => maxPrice === '' || p.price <= Number(maxPrice))
    .sort((a, b) => {
      if (sort === 'price_asc') return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
  );

  function updatePriceParams() {
    const params = new URLSearchParams($page.url.searchParams);
    if (minPrice) params.set('min', minPrice); else params.delete('min');
    if (maxPrice) params.set('max', maxPrice); else params.delete('max');
    goto(`?${params.toString()}`, { keepFocus: true, noScroll: true, replaceState: true });
  }

  function resetFilters() {
    minPrice = '';
    maxPrice = '';
    search = '';
    sort = 'newest';
    goto($page.url.pathname, { keepFocus: true, noScroll: true, replaceState: true });
  }

  onMount(() => {
    supabase.from('products').select('*').eq('is_active', true)
      .then(({ data }) => { products = data ?? []; loading = false; });
    setTimeout(() => { loading = false; }, 1500);
  });
</script>

<svelte:head><title>Shop — Petroni</title></svelte:head>

<!-- Hero banner -->
<section class="relative h-[220px] md:h-[280px] flex items-center overflow-hidden">
  <img src="https://www.petroni.hr/wp-content/uploads/2025/05/CO550QDK-2-768x576.jpg" alt="" class="absolute inset-0 w-full h-full object-cover" />
  <div class="absolute inset-0" style="background:linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.18) 100%)"></div>
  <div class="container-x relative z-10">
    <span class="block text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style="color:#f5c518">{$locale === 'hr' ? 'Kamping oprema' : 'Camping equipment'}</span>
    <h1 class="text-[32px] md:text-[46px] font-extrabold uppercase tracking-tight" style="color:#ffffff; text-shadow:0 2px 20px rgba(0,0,0,0.8)">Shop</h1>
    <p class="mt-2 text-[14px]" style="color:rgba(255,255,255,0.82)">{$locale === 'hr' ? 'Sve što trebate za savršeno kamping iskustvo' : 'Everything you need for the perfect camping experience'}</p>
  </div>
</section>

<!-- Info strip -->
<div class="border-b border-[#ededf0]" style="background:#fafbfc">
  <div class="container-x py-4">
    <div class="flex flex-wrap gap-6 items-center text-[12px] text-[#6b7178]">
      <span class="flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        {$locale === 'hr' ? 'Dostava unutar EU' : 'Delivery across EU'}
      </span>
      <span class="flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        {$locale === 'hr' ? 'Sigurno plaćanje' : 'Secure payment'}
      </span>
      <span class="flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        {$locale === 'hr' ? 'Povrat u 14 dana' : '14-day returns'}
      </span>
    </div>
  </div>
</div>

<div class="section">
  <div class="container-x">
    <!-- Title + sort row -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
      <h1 class="text-[26px] md:text-[32px] font-bold text-[#2b2b2b] uppercase">Shop</h1>
      <select class="field max-w-[220px]" bind:value={sort}>
        <option value="newest">{$locale === 'hr' ? 'Zadano sortiranje' : 'Default sorting'}</option>
        <option value="price_asc">{$locale === 'hr' ? 'Cijena: niža → viša' : 'Price: low → high'}</option>
        <option value="price_desc">{$locale === 'hr' ? 'Cijena: viša → niža' : 'Price: high → low'}</option>
      </select>
    </div>

    {#if !loading}
      <p class="text-[12px] text-[#9aa0a8] mb-8 uppercase tracking-wide">
        {$locale === 'hr' ? `Prikazujemo ${sorted.length} ${sorted.length === 1 ? 'rezultat' : 'rezultata'}` : `Showing ${sorted.length} ${sorted.length === 1 ? 'result' : 'results'}`}
      </p>
    {/if}

    <!-- Main layout: products + sidebar -->
    <div class="flex flex-col lg:flex-row gap-10">

      <!-- Products -->
      <div class="flex-1">
        {#if loading}
          <div class="grid grid-cols-2 md:grid-cols-3 gap-5">
            {#each Array(9) as _}<div class="rounded-lg aspect-square animate-pulse bg-[#f1f2f4]"></div>{/each}
          </div>
        {:else if sorted.length === 0}
          <div class="py-20 text-center card">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" class="mx-auto mb-5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <p class="font-semibold text-[#5b6168] mb-2">{$locale === 'hr' ? 'Nema proizvoda' : 'No products'}</p>
            <p class="text-[13px] text-[#9aa0a8] mb-6">{$locale === 'hr' ? 'Proizvodi se dodaju — provjerite uskoro.' : 'Products are being added — check back soon.'}</p>
          </div>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {#each sorted as product}<ProductCard {product} />{/each}
          </div>
        {/if}
      </div>

      <!-- Sidebar -->
      <aside class="lg:w-72 flex-shrink-0 space-y-5">

        <!-- Shipping info -->
        <div class="card p-5">
          <p class="text-[11px] font-bold uppercase tracking-widest text-[#b5890a] mb-3">{$locale === 'hr' ? 'Dostava' : 'Shipping'}</p>
          <p class="text-[12px] text-[#6b7178] leading-relaxed mb-1">{$locale === 'hr' ? 'Dostava samo unutar EU.' : 'Delivery within EU only.'}</p>
          <p class="text-[12px] text-[#6b7178] leading-relaxed mb-1">{$locale === 'hr' ? 'Dostava izvan HR: na upit.' : 'Delivery outside HR: on request.'}</p>
          <p class="text-[12px] text-[#6b7178] leading-relaxed">{$locale === 'hr' ? 'Cijena dostave samo za HR.' : 'Shipping price for HR only.'}</p>
        </div>

        <!-- Search -->
        <div class="card p-5">
          <p class="text-[11px] font-bold uppercase tracking-widest text-[#b5890a] mb-3">{$locale === 'hr' ? 'Pretraži' : 'Search'}</p>
          <div class="relative">
            <input type="text" placeholder={$locale === 'hr' ? 'Pretraži proizvode…' : 'Search products…'} bind:value={search}
              class="field pr-10 text-[13px]" />
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9aa0a8" stroke-width="2" class="absolute right-3 top-1/2 -translate-y-1/2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </div>
        </div>

        <!-- Categories -->
        <div class="card p-5">
          <p class="text-[11px] font-bold uppercase tracking-widest text-[#b5890a] mb-3">{$locale === 'hr' ? 'Kategorije' : 'Categories'}</p>
          <div class="space-y-0.5">
            {#each allCategories as cat}
              <a href="/shop/{cat.slug}"
                class="flex items-center justify-between py-2 px-2 rounded text-[13px] transition-colors hover:bg-[#fafbfc]"
                style="color:#5b6168">
                <span>{$locale === 'hr' ? cat.name_hr : cat.name_en}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </a>
            {/each}
          </div>
        </div>

        <!-- Price range -->
        <div class="card p-5">
          <p class="text-[11px] font-bold uppercase tracking-widest text-[#b5890a] mb-3">{$locale === 'hr' ? 'Cijena' : 'Price'}</p>
          <div class="flex items-center gap-2 mb-3">
            <input type="number" min="0" placeholder={$locale === 'hr' ? 'Min' : 'Min'} bind:value={minPrice} onchange={updatePriceParams}
              class="field text-[13px]" />
            <span class="text-[#9aa0a8]">–</span>
            <input type="number" min="0" placeholder={$locale === 'hr' ? 'Max' : 'Max'} bind:value={maxPrice} onchange={updatePriceParams}
              class="field text-[13px]" />
          </div>
          <button onclick={resetFilters} class="text-[12px] underline" style="color:#b5890a">{$locale === 'hr' ? 'Resetiraj filtere' : 'Reset filters'}</button>
        </div>

      </aside>
    </div>
  </div>
</div>
