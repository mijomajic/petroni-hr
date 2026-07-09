<script lang="ts">
  import type { Product } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';
  import { addToCart } from '$lib/stores/cart';

  type Props = { product: Product };
  let { product }: Props = $props();

  const name = $derived($locale === 'hr' ? product.name_hr : (product.name_en || product.name_hr));
  const img = $derived(product.images?.[0] || '');
  const addLabel = $derived($locale === 'hr' ? 'Dodaj u košaricu' : 'Add to cart');

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

<div class="card flex flex-col overflow-hidden h-full text-center">
  <a href="/product/{product.slug}" class="block group">
    <div class="aspect-square p-4 flex items-center justify-center bg-white overflow-hidden">
      {#if img}
        <img src={img} alt={name} width="600" height="600" loading="lazy" class="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105" />
      {:else}
        <div class="w-full h-full flex items-center justify-center text-[#dfe1e5]">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
      {/if}
    </div>
  </a>

  <div class="px-3 pb-4 flex flex-col flex-1">
    <a href="/product/{product.slug}">
      <h3 class="text-[13px] font-medium text-[#3a3f45] leading-snug line-clamp-2 min-h-[2.4em] mb-2 hover:text-[#b5890a] transition-colors">{name}</h3>
    </a>
    <p class="text-[15px] font-semibold text-[#2b2b2b] mb-3">{product.price.toFixed(2)} €</p>
    <button
      onclick={handleAdd}
      disabled={product.stock === 0}
      class="btn w-full mt-auto text-[11px] py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
      style="background:{added ? '#16a34a' : '#f5c518'};color:#fff"
    >
      {#if added}
        {$locale === 'hr' ? 'Dodano ✓' : 'Added ✓'}
      {:else if product.stock === 0}
        {$locale === 'hr' ? 'Nedostupno' : 'Out of stock'}
      {:else}
        {addLabel}
      {/if}
    </button>
  </div>
</div>
