<script lang="ts">
  import { localizedText, type SitePageContent } from '$lib/site-page-content';
  import { locale } from '$lib/stores/locale';

  let { content }: { content: SitePageContent } = $props();
  const visibleSections = $derived(content.sections.filter((section) => section.visible));
  const tx = (value: { hr: string; en: string } | undefined) => localizedText(value, $locale);
</script>

{#each visibleSections as section (section.id)}
  {#if section.type === 'hero'}
    <section class="relative flex h-[320px] items-center justify-center overflow-hidden md:h-[400px]">
      {#if section.image}<img src={section.image} alt={tx(section.imageAlt)} class="absolute inset-0 h-full w-full object-cover object-center" />{/if}
      <div class="absolute inset-0 bg-[rgba(39,42,47,0.68)]"></div>
      <div class="relative px-4 text-center">
        {#if tx(section.eyebrow)}<span class="mb-4 block text-[11px] font-bold uppercase tracking-[0.22em] text-[#f5c518]">{tx(section.eyebrow)}</span>{/if}
        <h1 class="text-4xl font-extrabold uppercase tracking-wide text-white md:text-6xl" style="text-shadow:0 2px 20px rgba(0,0,0,0.9), 0 0 60px rgba(0,0,0,0.5)">{tx(section.title)}</h1>
      </div>
    </section>
  {:else if section.type === 'split_content'}
    <section class="section">
      <div class="container-x grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div class:lg:order-2={section.variant === 'image-left'}>
          {#if tx(section.eyebrow)}<span class="eyebrow mb-3">{tx(section.eyebrow)}</span>{/if}
          <h2 class="mb-4 text-[28px] font-bold text-[#2b2b2b]">{tx(section.title)}</h2>
          <div class="space-y-4">{#each tx(section.body).split('\n\n') as paragraph}<p class="text-[14px] leading-relaxed text-[#6b7178]">{paragraph}</p>{/each}</div>
        </div>
        <div class="card card-static aspect-[4/3] overflow-hidden" class:lg:order-1={section.variant === 'image-left'}>{#if section.image}<img src={section.image} alt={tx(section.imageAlt)} loading="lazy" class="h-full w-full object-cover" />{/if}</div>
      </div>
    </section>
  {:else if section.type === 'testimonials'}
    <section class="section bg-[#fafbfc]">
      <div class="container-x">
        <div class="mb-12 text-center">{#if tx(section.eyebrow)}<span class="eyebrow mb-3">{tx(section.eyebrow)}</span>{/if}<h2 class="section-title">{tx(section.title)}</h2></div>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">{#each section.items ?? [] as item}<div class="card card-static p-7"><svg width="32" height="32" viewBox="0 0 24 24" fill="#f5c518" class="mb-4"><path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"/></svg><p class="text-[14px] italic leading-relaxed text-[#5b6168]">“{tx(item.body)}”</p></div>{/each}</div>
      </div>
    </section>
  {:else if section.type === 'split_cta'}
    <section class="section"><div class="container-x grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
      <div class="card card-static aspect-[4/3] overflow-hidden">{#if section.image}<img src={section.image} alt={tx(section.imageAlt)} loading="lazy" class="h-full w-full object-cover" />{/if}</div>
      <div><h2 class="section-title mb-4">{tx(section.title)}</h2><p class="mb-6 text-[14px] leading-relaxed text-[#6b7178]">{tx(section.body)}</p>{#if section.ctaHref && tx(section.ctaLabel)}<a href={section.ctaHref} class="btn btn-primary px-8 py-3.5">{tx(section.ctaLabel)}</a>{/if}</div>
    </div></section>
  {/if}
{/each}
