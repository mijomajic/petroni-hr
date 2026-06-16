<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { Product } from '$lib/supabase';
  import { addToCart } from '$lib/stores/cart';
  import { locale } from '$lib/stores/locale';
  import ProductCard from '$lib/components/ui/ProductCard.svelte';

  let product: Product | null = $state(null);
  let loading = $state(true);
  let qty = $state(1);
  let added = $state(false);
  let activeImg = $state(0);
  let relatedProducts: Product[] = $state([]);

  const name = $derived(product ? ($locale === 'hr' ? product.name_hr : (product.name_en || product.name_hr)) : '');
  const desc = $derived(product ? ($locale === 'hr' ? product.description_hr : (product.description_en || product.description_hr)) : '');

  function handleAdd() {
    if (!product) return;
    addToCart({ id: product.id, slug: product.slug, name_hr: product.name_hr, name_en: product.name_en ?? undefined, price: product.price, images: product.images }, qty);
    added = true;
    setTimeout(() => added = false, 2000);
  }

  onMount(() => {
    supabase.from('products').select('*').eq('slug', $page.params.slug).single()
      .then(async ({ data }) => {
        product = data;
        loading = false;
        if (data?.category_id) {
          const { data: related } = await supabase.from('products').select('*')
            .eq('category_id', data.category_id).eq('is_active', true)
            .neq('id', data.id).order('created_at', { ascending: false }).limit(4);
          relatedProducts = related ?? [];
        }
      });
    setTimeout(() => { loading = false; }, 1500);
  });
</script>

<svelte:head><title>{name || 'Proizvod'} — Shop — Petroni</title></svelte:head>

<div class="section">
  <div class="container-x">
    {#if loading}
      <div class="h-96 flex items-center justify-center">
        <div class="w-8 h-8 rounded-full border-2 animate-spin" style="border-color:#f5c518;border-top-color:transparent"></div>
      </div>
    {:else if product}
      <nav class="flex items-center gap-2 text-xs mb-8 text-[#9aa0a8] uppercase flex-wrap">
        <a href="/" class="hover:text-[#b5890a]">{$locale === 'hr' ? 'Početna stranica' : 'Home'}</a><span>/</span>
        <a href="/shop" class="hover:text-[#b5890a]">Shop</a><span>/</span>
        <span class="text-[#2b2b2b]">{name}</span>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Gallery -->
        <div>
          <div class="card overflow-hidden aspect-square mb-3 flex items-center justify-center p-6 bg-white">
            {#if product.images?.[activeImg]}
              <img src={product.images[activeImg]} alt={name} class="max-w-full max-h-full object-contain" />
            {:else}
              <div class="text-[#dfe1e5]"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
            {/if}
          </div>
          {#if product.images?.length > 1}
            <div class="flex gap-3">
              {#each product.images as img, i}
                <button onclick={() => activeImg = i} class="w-16 h-16 rounded-md overflow-hidden border-2 bg-white p-1" style="border-color:{activeImg === i ? '#f5c518' : '#ededf0'}">
                  <img src={img} alt="" class="w-full h-full object-contain" />
                </button>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Info -->
        <div>
          <h1 class="text-[28px] font-bold text-[#2b2b2b] mb-3 leading-tight">{name}</h1>
          <div class="text-[26px] font-semibold text-[#2b2b2b] mb-6">{product.price.toFixed(2)} €</div>

          <div class="flex items-center gap-4 mb-6">
            <div class="flex items-center rounded-md overflow-hidden border border-[#e2e4e8]">
              <button onclick={() => qty = Math.max(1, qty - 1)} class="px-4 py-3 font-bold text-[#2b2b2b] hover:bg-[#f6f7f9]">−</button>
              <span class="px-4 font-semibold text-[#2b2b2b] w-12 text-center">{qty}</span>
              <button onclick={() => qty = qty + 1} class="px-4 py-3 font-bold text-[#2b2b2b] hover:bg-[#f6f7f9]">+</button>
            </div>
            <button onclick={handleAdd} disabled={product.stock === 0}
              class="btn flex-1 py-3.5 disabled:opacity-50" style="background:{added ? '#16a34a' : '#f5c518'};color:#fff">
              {added ? ($locale === 'hr' ? 'Dodano u košaricu ✓' : 'Added ✓') : (product.stock === 0 ? ($locale === 'hr' ? 'Nedostupno' : 'Out of stock') : ($locale === 'hr' ? 'Dodaj u košaricu' : 'Add to cart'))}
            </button>
          </div>

          <div class="text-[13px] text-[#7a7f86] space-y-1 mb-6">
            {#if product.sku}<p><span class="font-semibold text-[#2b2b2b]">SKU:</span> {product.sku}</p>{/if}
            <p>
              <span class="font-semibold text-[#2b2b2b]">{$locale === 'hr' ? 'Stanje' : 'Status'}:</span>
              <span style="color:{product.stock > 0 ? '#16a34a' : '#e11d48'}">{product.stock > 0 ? ($locale === 'hr' ? `Na zalihi (${product.stock})` : `In stock (${product.stock})`) : ($locale === 'hr' ? 'Nema na zalihi' : 'Out of stock')}</span>
            </p>
          </div>

          <div class="border-t border-[#ededf0] pt-6">
            <h3 class="text-[13px] font-bold uppercase tracking-wide text-[#2b2b2b] mb-3">{$locale === 'hr' ? 'Opis' : 'Description'}</h3>
            {#if desc}
              <p class="text-[14px] leading-relaxed text-[#6b7178]">{desc}</p>
            {:else}
              <p class="text-[14px] text-[#9aa0a8]">{$locale === 'hr' ? 'Opis proizvoda uskoro.' : 'Product description coming soon.'}</p>
            {/if}
          </div>
        </div>
      </div>

      {#if relatedProducts.length > 0}
        <div class="mt-16 pt-10 border-t border-[#ededf0]">
          <h2 class="text-[20px] font-bold text-[#2b2b2b] uppercase mb-6">{$locale === 'hr' ? 'Povezani proizvodi' : 'Related products'}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {#each relatedProducts as rp}<ProductCard product={rp} />{/each}
          </div>
        </div>
      {/if}
    {:else}
      <div class="text-center py-20 text-[#8b9099]">
        <p>{$locale === 'hr' ? 'Proizvod nije pronađen.' : 'Product not found.'}</p>
        <a href="/shop" class="mt-4 inline-block text-sm underline" style="color:#b5890a">{$locale === 'hr' ? 'Natrag na shop' : 'Back to shop'}</a>
      </div>
    {/if}
  </div>
</div>
