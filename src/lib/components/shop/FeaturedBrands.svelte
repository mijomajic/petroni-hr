<script lang="ts">
  import { page } from '$app/stores';
  import { locale } from '$lib/stores/locale';

  type Props = {
    brands: string[];
    activeBrand?: string;
  };

  let { brands, activeBrand = '' }: Props = $props();

  function brandHref(nextBrand: string) {
    const params = new URLSearchParams($page.url.searchParams);
    if (nextBrand) params.set('brand', nextBrand);
    else params.delete('brand');
    params.delete('page');
    const query = params.toString();
    return `${$page.url.pathname}${query ? `?${query}` : ''}`;
  }
</script>

{#if brands.length > 0}
  <section data-testid="featured-brands" class="mb-8 border-y border-[#e7e8eb] py-5" aria-labelledby="featured-brands-title">
    <div class="mb-3 flex items-center justify-between gap-4">
      <h2 id="featured-brands-title" class="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b7178]">
        {$locale === 'hr' ? 'Istaknuti brendovi' : 'Featured brands'}
      </h2>
      {#if activeBrand}
        <a href={brandHref('')} class="text-[11px] font-bold text-[#806300] underline-offset-4 hover:underline">
          {$locale === 'hr' ? 'Prikaži sve' : 'Show all'}
        </a>
      {/if}
    </div>
    <div class="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" style="scrollbar-width:thin">
      {#each brands as productBrand}
        <a
          href={brandHref(productBrand)}
          aria-current={activeBrand.toLocaleLowerCase('hr') === productBrand.toLocaleLowerCase('hr') ? 'true' : undefined}
          class="shrink-0 rounded-md border px-4 py-2.5 text-xs font-black uppercase tracking-[0.06em] transition duration-200 active:translate-y-px {activeBrand.toLocaleLowerCase('hr') === productBrand.toLocaleLowerCase('hr') ? 'border-[#f5c518] bg-[#fff7d6] text-[#725700]' : 'border-[#dfe1e5] bg-white text-[#3f444a] hover:border-[#aeb2b8]'}"
        >
          {productBrand}
        </a>
      {/each}
    </div>
  </section>
{/if}
