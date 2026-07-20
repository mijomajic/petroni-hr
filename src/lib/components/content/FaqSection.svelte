<script lang="ts">
  import { localizedText, type SitePageSection } from '$lib/site-page-content';
  import { locale } from '$lib/stores/locale';

  let { section, primaryHeading = false }: { section: SitePageSection; primaryHeading?: boolean } = $props();
  let openIndex = $state<number | null>(0);
  const tx = (value: { hr: string; en: string } | undefined) => localizedText(value, $locale);
</script>

<section class="section">
  <div class="container-x mx-auto max-w-3xl">
    <div class="mb-8 text-center">
      {#if tx(section.eyebrow)}<span class="eyebrow mb-3">{tx(section.eyebrow)}</span>{/if}
      {#if tx(section.title)}
        {#if primaryHeading}
          <h1 class="section-title">{tx(section.title)}</h1>
        {:else}
          <h2 class="section-title">{tx(section.title)}</h2>
        {/if}
      {/if}
    </div>
    {#if (section.items ?? []).length === 0}
      <div class="border-y border-[#e7e8eb] py-12 text-center text-sm text-[#8b9099]">{$locale === 'hr' ? 'Pitanja se trenutačno uređuju.' : 'Questions are currently being updated.'}</div>
    {:else}
      <div class="space-y-3">
        {#each section.items ?? [] as item, index (item.id)}
          <div class="card overflow-hidden">
            <button type="button" onclick={() => openIndex = openIndex === index ? null : index} class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left active:-translate-y-px" aria-expanded={openIndex === index}>
              <span class="text-[15px] font-medium text-[#2b2b2b]">{tx(item.title)}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b9099" stroke-width="2.5" class="flex-shrink-0 transition-transform" style:transform={`rotate(${openIndex === index ? 180 : 0}deg)`}><path d="M6 9l6 6 6-6"/></svg>
            </button>
            {#if openIndex === index}<p class="px-5 pb-5 text-[14px] leading-relaxed text-[#6b7178]">{tx(item.body)}</p>{/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</section>
