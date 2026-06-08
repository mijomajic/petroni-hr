<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import type { Product } from '$lib/supabase';
  import { addToCart } from '$lib/stores/cart';
  import { locale } from '$lib/stores/locale';

  let product: Product | null = $state(null);
  let loading = $state(true);
  let qty = $state(1);
  let added = $state(false);
  let activeImg = $state(0);

  const name = $derived(product ? ($locale === 'hr' ? product.name_hr : (product.name_en || product.name_hr)) : '');
  const desc = $derived(product ? ($locale === 'hr' ? product.description_hr : (product.description_en || product.description_hr)) : '');

  function handleAdd() {
    if (!product) return;
    addToCart({ id: product.id, slug: product.slug, name_hr: product.name_hr, name_en: product.name_en ?? undefined, price: product.price, images: product.images }, qty);
    added = true;
    setTimeout(() => added = false, 2000);
  }

  onMount(async () => {
    const { data } = await supabase.from('products').select('*').eq('slug', $page.params.slug).single();
    product = data;
    loading = false;
  });
</script>

<svelte:head><title>{name || 'Proizvod'} — Shop — Petroni</title></svelte:head>

<div class="min-h-[100dvh] pt-28 pb-20" style="background: #0a0a0a">
  <div class="max-w-7xl mx-auto px-4 md:px-6">
    {#if loading}
      <div class="h-96 flex items-center justify-center">
        <div class="w-8 h-8 rounded-full border-2 animate-spin" style="border-color: #F5C518; border-top-color: transparent"></div>
      </div>
    {:else if product}
      <nav class="flex items-center gap-2 text-xs mb-8" style="color: #9ca3af">
        <a href="/" class="hover:text-white">Naslovnica</a><span>/</span>
        <a href="/shop" class="hover:text-white">Shop</a><span>/</span>
        <span class="text-white">{name}</span>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Gallery -->
        <div>
          <div class="rounded-[2rem] overflow-hidden aspect-square mb-3" style="border: 1px solid #2a2a2a; background: #111">
            {#if product.images?.[activeImg]}
              <img src={product.images[activeImg]} alt={name} class="w-full h-full object-contain p-4" />
            {:else}
              <div class="w-full h-full flex items-center justify-center" style="color: #2a2a2a">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
            {/if}
          </div>
          {#if product.images?.length > 1}
            <div class="flex gap-3">
              {#each product.images as img, i}
                <button onclick={() => activeImg = i} class="w-16 h-16 rounded-xl overflow-hidden" style="border: 2px solid {activeImg === i ? '#F5C518' : 'transparent'}; background: #111">
                  <img src={img} alt="" class="w-full h-full object-contain p-1" />
                </button>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Info -->
        <div>
          {#if product.sku}
            <p class="text-xs mb-2 font-mono" style="color: #9ca3af">SKU: {product.sku}</p>
          {/if}
          <h1 class="text-3xl font-black text-white mb-4 leading-tight">{name}</h1>
          <div class="text-4xl font-black text-white mb-6">€{product.price.toFixed(2)}</div>

          <div class="mb-6">
            <span
              class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]"
              style="{product.stock > 0 ? 'background: rgba(22,163,74,0.15); color: #16a34a; border: 1px solid rgba(22,163,74,0.3)' : 'background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2)'}"
            >
              {product.stock > 0 ? `Na zalihi (${product.stock})` : 'Nema na zalihi'}
            </span>
          </div>

          {#if desc}
            <p class="text-sm leading-relaxed mb-8" style="color: #9ca3af">{desc}</p>
          {/if}

          <!-- Qty + Add -->
          <div class="flex items-center gap-4 mb-6">
            <div class="flex items-center rounded-2xl overflow-hidden" style="background: #1a1a1a; border: 1px solid #2a2a2a">
              <button onclick={() => qty = Math.max(1, qty - 1)} class="px-4 py-3 font-bold transition-colors hover:bg-white/10 text-white">-</button>
              <span class="px-4 font-bold text-white w-12 text-center">{qty}</span>
              <button onclick={() => qty = qty + 1} class="px-4 py-3 font-bold transition-colors hover:bg-white/10 text-white">+</button>
            </div>
            <button
              onclick={handleAdd}
              disabled={product.stock === 0}
              class="flex-1 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-40"
              style="background: {added ? '#16a34a' : '#F5C518'}; color: black"
            >
              {added ? '✓ Dodano u košaricu' : 'Dodaj u košaricu'}
            </button>
          </div>
        </div>
      </div>
    {:else}
      <div class="text-center py-20" style="color: #9ca3af">
        <p>Proizvod nije pronađen.</p>
        <a href="/shop" class="mt-4 inline-block text-sm underline" style="color: #F5C518">Natrag na shop</a>
      </div>
    {/if}
  </div>
</div>
