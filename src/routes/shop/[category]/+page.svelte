<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { Product, ProductCategory } from '$lib/supabase';
  import ProductCard from '$lib/components/ui/ProductCard.svelte';
  import { locale } from '$lib/stores/locale';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const allCategories: ProductCategory[] = $derived(data.categories as ProductCategory[]);
  const category: ProductCategory = $derived(data.category as ProductCategory);
  const products: Product[] = $derived(data.products as Product[]);
  const loading = false;
  const total = $derived(data.total as number);
  const pageNumber = $derived(data.page as number);
  const pageSize = $derived(data.pageSize as number);
  const totalPages = $derived(Math.max(1, Math.ceil(total / pageSize)));
  let sort = $state('newest');
  let search = $state('');
  let minPrice = $state('');
  let maxPrice = $state('');
  const slug = $derived($page.params.category);

  $effect(() => {
    $page.url.href;
    sort = data.sort as string;
    search = data.query as string;
    minPrice = data.minPrice as string;
    maxPrice = data.maxPrice as string;
  });

  function applyFilters(nextPage = 1) {
    const params = new URLSearchParams($page.url.searchParams);
    if (search.trim()) params.set('q', search.trim()); else params.delete('q');
    if (sort && sort !== 'newest') params.set('sort', sort); else params.delete('sort');
    if (minPrice) params.set('min', minPrice); else params.delete('min');
    if (maxPrice) params.set('max', maxPrice); else params.delete('max');
    if (nextPage > 1) params.set('page', String(nextPage)); else params.delete('page');
    goto(`?${params.toString()}`, { keepFocus: true, noScroll: true, replaceState: true });
  }

  function resetFilters() {
    minPrice = '';
    maxPrice = '';
    search = '';
    sort = 'newest';
    goto($page.url.pathname, { keepFocus: true, noScroll: true, replaceState: true });
  }

  const title = $derived($locale === 'hr' ? category.name_hr : (category.name_en || category.name_hr));
  const currentCat = $derived(allCategories.find(c => c.slug === slug));
</script>

<svelte:head><title>{title} — Shop — Petroni</title></svelte:head>

<div class="section">
  <div class="container-x">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-xs mb-6 text-[#9aa0a8]">
      <a href="/" class="hover:text-[#b5890a]">{$locale === 'hr' ? 'Naslovnica' : 'Home'}</a><span>/</span>
      <a href="/shop" class="hover:text-[#b5890a]">Shop</a><span>/</span>
      <span class="text-[#2b2b2b]">{title}</span>
    </nav>

    <!-- Title + sort row -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
      <h1 class="text-[26px] md:text-[32px] font-bold text-[#2b2b2b] uppercase">{title}</h1>
      <select class="field max-w-[220px]" bind:value={sort} onchange={() => applyFilters(1)}>
        <option value="newest">{$locale === 'hr' ? 'Zadano sortiranje' : 'Default sorting'}</option>
        <option value="price_asc">{$locale === 'hr' ? 'Cijena: niža → viša' : 'Price: low → high'}</option>
        <option value="price_desc">{$locale === 'hr' ? 'Cijena: viša → niža' : 'Price: high → low'}</option>
      </select>
    </div>

    {#if !loading}
      <p class="text-[12px] text-[#9aa0a8] mb-8 uppercase tracking-wide">
        {$locale === 'hr'
          ? `Prikazujemo ${products.length} od ${total} ${total === 1 ? 'rezultata' : 'rezultata'}`
          : `Showing ${products.length} of ${total} ${total === 1 ? 'result' : 'results'}`}
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
        {:else if products.length === 0}
          <div class="py-20 text-center card">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" class="mx-auto mb-5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <p class="font-semibold text-[#5b6168] mb-2">{$locale === 'hr' ? 'Nema proizvoda u ovoj kategoriji' : 'No products in this category'}</p>
            <p class="text-[13px] text-[#9aa0a8] mb-6">{$locale === 'hr' ? 'Proizvodi se dodaju — provjerite uskoro ili pregledajte drugu kategoriju.' : 'Products are being added — check back soon or browse another category.'}</p>
            <a href="/shop" class="btn btn-primary px-6 py-3">{$locale === 'hr' ? 'Sve kategorije' : 'All categories'}</a>
          </div>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {#each products as product}<ProductCard {product} />{/each}
          </div>

          {#if totalPages > 1}
            <div class="flex flex-wrap items-center justify-center gap-2 mt-10">
              <button class="btn btn-ghost px-4 py-2 disabled:opacity-40" disabled={pageNumber <= 1} onclick={() => applyFilters(pageNumber - 1)}>
                {$locale === 'hr' ? 'Prethodna' : 'Previous'}
              </button>
              <span class="text-[13px] font-semibold text-[#5b6168] px-3">
                {pageNumber} / {totalPages}
              </span>
              <button class="btn btn-ghost px-4 py-2 disabled:opacity-40" disabled={pageNumber >= totalPages} onclick={() => applyFilters(pageNumber + 1)}>
                {$locale === 'hr' ? 'Sljedeća' : 'Next'}
              </button>
            </div>
          {/if}
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
              class="field pr-10 text-[13px]" onkeydown={(event) => { if (event.key === 'Enter') applyFilters(1); }} />
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9aa0a8" stroke-width="2" class="absolute right-3 top-1/2 -translate-y-1/2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </div>
          <button onclick={() => applyFilters(1)} class="btn btn-primary w-full mt-3 py-2.5 text-[11px]">
            {$locale === 'hr' ? 'Pretraži' : 'Search'}
          </button>
        </div>

        <!-- Categories -->
        <div class="card p-5">
          <p class="text-[11px] font-bold uppercase tracking-widest text-[#b5890a] mb-3">{$locale === 'hr' ? 'Kategorije' : 'Categories'}</p>
          <div class="space-y-0.5">
            {#each allCategories as cat}
              <a href="/shop/{cat.slug}"
                class="flex items-center justify-between py-2 px-2 rounded text-[13px] transition-colors hover:bg-[#fafbfc]"
                style="color:{cat.slug === slug ? '#f5c518' : '#5b6168'}; font-weight:{cat.slug === slug ? '700' : '400'}">
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
            <input type="number" min="0" placeholder={$locale === 'hr' ? 'Min' : 'Min'} bind:value={minPrice} onchange={() => applyFilters(1)}
              class="field text-[13px]" />
            <span class="text-[#9aa0a8]">–</span>
            <input type="number" min="0" placeholder={$locale === 'hr' ? 'Max' : 'Max'} bind:value={maxPrice} onchange={() => applyFilters(1)}
              class="field text-[13px]" />
          </div>
          <button onclick={resetFilters} class="text-[12px] underline" style="color:#b5890a">{$locale === 'hr' ? 'Resetiraj filtere' : 'Reset filters'}</button>
        </div>

      </aside>
    </div>
  </div>
</div>
