<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { Product, ProductCategory } from '$lib/supabase';
  import ProductCard from '$lib/components/ui/ProductCard.svelte';
  import { locale } from '$lib/stores/locale';

  let category: ProductCategory | null = $state(null);
  let products: Product[] = $state([]);
  let loading = $state(true);
  let sort = $state('newest');

  const slug = $derived($page.params.category);
  const prettyName = $derived(
    (slug ?? '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  );

  const sorted = $derived([...products].sort((a, b) => {
    if (sort === 'price_asc') return a.price - b.price;
    if (sort === 'price_desc') return b.price - a.price;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }));

  onMount(() => {
    const s = $page.params.category;
    supabase.from('product_categories').select('*').eq('slug', s).single()
      .then(async ({ data: cat }) => {
        category = cat;
        if (cat) {
          const { data: prods } = await supabase.from('products').select('*').eq('category_id', cat.id).eq('is_active', true);
          products = prods ?? [];
        }
        loading = false;
      });
    setTimeout(() => { loading = false; }, 1500);
  });

  const title = $derived(category ? ($locale === 'hr' ? category.name_hr : (category.name_en || category.name_hr)) : prettyName);
</script>

<svelte:head><title>{title} — Shop — Petroni</title></svelte:head>

<div class="section">
  <div class="container-x">
    <nav class="flex items-center gap-2 text-xs mb-6 text-[#9aa0a8]">
      <a href="/" class="hover:text-[#b5890a]">{$locale === 'hr' ? 'Naslovnica' : 'Home'}</a><span>/</span>
      <a href="/shop" class="hover:text-[#b5890a]">Shop</a><span>/</span>
      <span class="text-[#2b2b2b]">{title}</span>
    </nav>

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <h1 class="text-[26px] md:text-[32px] font-bold text-[#2b2b2b] uppercase">{title}</h1>
      <select class="field max-w-[240px]" bind:value={sort}>
        <option value="newest">{$locale === 'hr' ? 'Najnovije' : 'Newest'}</option>
        <option value="price_asc">{$locale === 'hr' ? 'Cijena: niža → viša' : 'Price: low → high'}</option>
        <option value="price_desc">{$locale === 'hr' ? 'Cijena: viša → niža' : 'Price: high → low'}</option>
      </select>
    </div>

    {#if loading}
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {#each Array(8) as _}<div class="rounded-lg aspect-square animate-pulse bg-[#f1f2f4]"></div>{/each}
      </div>
    {:else if sorted.length === 0}
      <div class="text-center py-20 card">
        <p class="text-[#7a7f86] mb-4">{$locale === 'hr' ? 'Nema proizvoda u ovoj kategoriji.' : 'No products in this category.'}</p>
        <a href="/shop" class="text-sm font-bold underline" style="color:#b5890a">{$locale === 'hr' ? 'Natrag na shop' : 'Back to shop'}</a>
      </div>
    {:else}
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {#each sorted as product}<ProductCard {product} />{/each}
      </div>
    {/if}
  </div>
</div>
