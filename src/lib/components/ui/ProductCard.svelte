<script lang="ts">
  import type { Product } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';
  import { addToCart } from '$lib/stores/cart';

  type Props = { product: Product };
  let { product }: Props = $props();

  const name = $derived($locale === 'hr' ? product.name_hr : (product.name_en || product.name_hr));
  const img = $derived(product.images?.[0] || '');

  let added = $state(false);

  function handleAdd() {
    addToCart({
      id: product.id,
      slug: product.slug,
      name_hr: product.name_hr,
      name_en: product.name_en ?? undefined,
      price: product.price,
      images: product.images,
    });
    added = true;
    setTimeout(() => added = false, 1500);
  }
</script>

<div class="group rounded-[1.5rem] overflow-hidden transition-all duration-500 hover:scale-[1.02]"
     style="background: #1a1a1a; border: 1px solid #2a2a2a">
  <a href="/product/{product.slug}" class="block">
    <div class="p-2">
      <div class="relative overflow-hidden rounded-xl aspect-square">
        {#if img}
          <img src={img} alt={name} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
        {:else}
          <div class="w-full h-full flex items-center justify-center" style="background: #111">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="color: #2a2a2a">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        {/if}
      </div>
    </div>
    <div class="px-4 pb-2">
      <p class="text-xs mb-1" style="color: #9ca3af">{product.sku || ''}</p>
      <h3 class="font-semibold text-sm text-white leading-tight line-clamp-2 mb-2">{name}</h3>
    </div>
  </a>

  <div class="px-4 pb-4 flex items-center justify-between">
    <span class="text-lg font-bold text-white">€{product.price.toFixed(2)}</span>
    <button
      onclick={handleAdd}
      disabled={product.stock === 0}
      class="flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
      style="background: {added ? '#16a34a' : '#F5C518'}; color: black"
    >
      {#if added}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Dodano
      {:else}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Dodaj
      {/if}
    </button>
  </div>
</div>
