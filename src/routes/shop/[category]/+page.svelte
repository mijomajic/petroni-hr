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

  const sorted = $derived([...products].sort((a, b) => {
    if (sort === 'price_asc') return a.price - b.price;
    if (sort === 'price_desc') return b.price - a.price;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }));

  onMount(async () => {
    const slug = $page.params.category;
    const { data: cat } = await supabase.from('product_categories').select('*').eq('slug', slug).single();
    category = cat;

    if (cat) {
      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', cat.id)
        .eq('is_active', true);
      products = prods ?? [];
    }
    loading = false;
  });
</script>

<svelte:head><title>{category?.name_hr ?? 'Kategorija'} — Shop — Petroni</title></svelte:head>

<div class="min-h-[100dvh] pt-28 pb-20" style="background: #0a0a0a">
  <div class="max-w-7xl mx-auto px-4 md:px-6">
    <nav class="flex items-center gap-2 text-xs mb-8" style="color: #9ca3af">
      <a href="/" class="hover:text-white">Naslovnica</a><span>/</span>
      <a href="/shop" class="hover:text-white">Shop</a><span>/</span>
      <span class="text-white">{category?.name_hr ?? $page.params.category}</span>
    </nav>

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
      <h1 class="text-4xl font-black uppercase tracking-tight text-white">
        {$locale === 'hr' ? (category?.name_hr ?? '') : ((category?.name_en ?? category?.name_hr) ?? '')}
      </h1>
      <select
        class="px-4 py-2 rounded-xl text-sm text-white focus:outline-none"
        style="background: #1a1a1a; border: 1px solid #2a2a2a"
        bind:value={sort}
      >
        <option value="newest">Najnovije</option>
        <option value="price_asc">Cijena: niža → viša</option>
        <option value="price_desc">Cijena: viša → niža</option>
      </select>
    </div>

    {#if loading}
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {#each Array(8) as _}
          <div class="rounded-2xl aspect-square animate-pulse" style="background: #1a1a1a"></div>
        {/each}
      </div>
    {:else if sorted.length === 0}
      <div class="text-center py-20" style="color: #9ca3af">
        <p>Nema proizvoda u ovoj kategoriji.</p>
      </div>
    {:else}
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {#each sorted as product}
          <ProductCard {product} />
        {/each}
      </div>
    {/if}
  </div>
</div>
