<script lang="ts">
  import type { ProductCategory } from '$lib/supabase';
  import { locale } from '$lib/stores/locale';
  import { page } from '$app/stores';

  let {
    categories,
    currentSlug = null
  }: {
    categories: ProductCategory[];
    currentSlug?: string | null;
  } = $props();

  const roots = $derived(categories.filter((category) => !category.parent_id));

  function childrenOf(parentId: string) {
    return categories.filter((category) => category.parent_id === parentId);
  }

  function label(category: ProductCategory) {
    return $locale === 'hr' ? category.name_hr : (category.name_en || category.name_hr);
  }

  function branchIsCurrent(category: ProductCategory) {
    return category.slug === currentSlug || childrenOf(category.id).some((child) => child.slug === currentSlug);
  }

  function categoryHref(slug: string) {
    const params = new URLSearchParams($page.url.searchParams);
    params.delete('page');
    const query = params.toString();
    return `/shop/${slug}${query ? `?${query}` : ''}`;
  }
</script>

<nav aria-label={$locale === 'hr' ? 'Kategorije proizvoda' : 'Product categories'}>
  <ul class="space-y-1">
    {#each roots as category}
      {@const children = childrenOf(category.id)}
      <li class="border-b border-[#f0f1f3] pb-2 last:border-0 last:pb-0">
        {#if children.length > 0}
          <details open={branchIsCurrent(category)} class="group">
            <summary class="flex cursor-pointer list-none items-center justify-between rounded-md px-2 py-2 text-[13px] font-bold uppercase leading-snug text-[#454a50] transition-colors hover:bg-[#fafbfc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5C518]">
              <span class:text-[#b5890a]={branchIsCurrent(category)} class="pr-2">{label(category)}</span>
              <svg class="shrink-0 transition-transform group-open:rotate-90" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
            </summary>
            <ul class="ml-2 border-l border-[#e4e6e9] pl-3">
              <li>
                <a
                  href={categoryHref(category.slug)}
                  aria-current={category.slug === currentSlug ? 'page' : undefined}
                  class="block rounded-md px-2 py-1.5 text-[12px] font-bold leading-snug transition-colors hover:bg-[#fafbfc] hover:text-[#b5890a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5C518]"
                  class:text-[#b5890a]={category.slug === currentSlug}
                  class:text-[#545a61]={category.slug !== currentSlug}
                >{$locale === 'hr' ? 'Svi proizvodi' : 'All products'}</a>
              </li>
              {#each children as child}
                <li>
                  <a
                    href={categoryHref(child.slug)}
                    aria-current={child.slug === currentSlug ? 'page' : undefined}
                    class="block rounded-md px-2 py-1.5 text-[12px] leading-snug transition-colors hover:bg-[#fafbfc] hover:text-[#b5890a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5C518]"
                    class:font-bold={child.slug === currentSlug}
                    class:text-[#b5890a]={child.slug === currentSlug}
                    class:text-[#6b7178]={child.slug !== currentSlug}
                  >{label(child)}</a>
                </li>
              {/each}
            </ul>
          </details>
        {:else}
          <a
            href={categoryHref(category.slug)}
            aria-current={category.slug === currentSlug ? 'page' : undefined}
            class="flex items-center justify-between rounded-md px-2 py-2 text-[13px] font-bold uppercase leading-snug transition-colors hover:bg-[#fafbfc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5C518]"
            class:text-[#b5890a]={category.slug === currentSlug}
            class:text-[#454a50]={category.slug !== currentSlug}
          >
            <span>{label(category)}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
          </a>
        {/if}
      </li>
    {/each}
  </ul>
</nav>
