<script lang="ts">
  import { cloneSitePageContent, type SitePageItem, type SitePageSection } from '$lib/site-page-content';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
  function initialDraft() { return cloneSitePageContent(data.page.content); }
  let draft = $state(initialDraft());

  function moveSection(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= draft.sections.length) return;
    const sections = [...draft.sections];
    [sections[index], sections[next]] = [sections[next], sections[index]];
    draft.sections = sections;
  }

  function moveItem(section: SitePageSection, index: number, direction: -1 | 1) {
    const items = [...(section.items ?? [])];
    const next = index + direction;
    if (next < 0 || next >= items.length) return;
    [items[index], items[next]] = [items[next], items[index]];
    section.items = items;
  }

  function canAddItems(section: SitePageSection) {
    return ['logo_grid', 'feature_grid', 'image_strip', 'stats', 'logo_marquee', 'testimonials', 'faq'].includes(section.type);
  }

  function newItem(section: SitePageSection): SitePageItem {
    const id = `${section.type}-${crypto.randomUUID()}`;
    if (section.type === 'image_strip') return { id, image: '', alt: { hr: '', en: '' } };
    if (section.type === 'stats') return { id, value: 0, suffix: '', title: { hr: 'Nova brojka', en: 'New statistic' } };
    if (section.type === 'feature_grid') return { id, icon: 'star', title: { hr: 'Nova prednost', en: 'New advantage' }, body: { hr: '', en: '' } };
    if (section.type === 'testimonials') return { id, body: { hr: 'Novo mišljenje', en: 'New testimonial' } };
    if (section.type === 'faq') return { id, title: { hr: 'Novo pitanje', en: 'New question' }, body: { hr: '', en: '' } };
    return { id, title: { hr: 'Novi partner', en: 'New partner' }, image: '', href: '' };
  }

  function addItem(section: SitePageSection) {
    section.items = [...(section.items ?? []), newItem(section)];
  }

  function removeItem(section: SitePageSection, index: number) {
    section.items = (section.items ?? []).filter((_, itemIndex) => itemIndex !== index);
  }
</script>

<svelte:head><title>{data.page.label} — Javne stranice — Admin — Petroni</title></svelte:head>

<div class="max-w-6xl pb-28">
  <header class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <a href="/admin/stranice" class="text-xs font-bold uppercase tracking-[0.14em] text-[#8b9099] hover:text-[#806300]">← Javne stranice</a>
      <h1 class="mt-3 text-3xl font-black uppercase tracking-tight text-[#2b2b2b]">{data.page.label}</h1>
      <p class="mt-2 max-w-3xl text-sm leading-6 text-[#7a7f86]">Promjene su javne odmah nakon spremanja. Englesko polje može ostati prazno; tada se prikazuje hrvatski sadržaj.</p>
    </div>
    <a href={data.page.route} target="_blank" rel="noreferrer" class="w-fit rounded-md border border-[#dfe1e5] bg-white px-4 py-2.5 text-xs font-bold text-[#5b6168] hover:border-[#aeb2b8] active:-translate-y-px">Otvori javnu stranicu</a>
  </header>

  {#if form?.message}
    <div class="mb-6 rounded-md border border-[#eadfba] bg-[#fffdf5] p-4 text-sm text-[#6f5600]" role="status">{form.message}</div>
  {/if}

  <form method="POST" action="?/save">
    <input type="hidden" name="content_json" value={JSON.stringify(draft)} />

    <section class="mb-8 border-y border-[#e2e4e8] bg-white px-5 py-6">
      <p class="mb-5 text-xs font-black uppercase tracking-[0.15em] text-[#9a7600]">SEO i naslov kartice preglednika</p>
      <div class="grid gap-5 md:grid-cols-2">
        <label><span class="field-label">Naslov — HR</span><input class="field" bind:value={draft.title.hr} maxlength="240" /></label>
        <label><span class="field-label">Title — EN</span><input class="field" bind:value={draft.title.en} maxlength="240" /></label>
        <label><span class="field-label">Meta opis — HR</span><textarea class="field" rows="4" bind:value={draft.seoDescription.hr} maxlength="500"></textarea></label>
        <label><span class="field-label">Meta description — EN</span><textarea class="field" rows="4" bind:value={draft.seoDescription.en} maxlength="500"></textarea></label>
      </div>
    </section>

    <div class="space-y-5">
      {#each draft.sections as section, sectionIndex (section.id)}
        <section class="overflow-hidden border border-[#dfe1e5] bg-white">
          <header class="flex flex-wrap items-center justify-between gap-4 border-b border-[#e7e8eb] bg-[#fafbfc] px-5 py-4">
            <div class="flex items-center gap-3">
              <span class="font-mono text-xs text-[#9a7600]">{String(sectionIndex + 1).padStart(2, '0')}</span>
              <div><h2 class="font-black text-[#2b2b2b]">{section.label}</h2><p class="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-[#9aa0a8]">{section.type}</p></div>
            </div>
            <div class="flex items-center gap-2">
              <label class="mr-2 flex items-center gap-2 text-xs font-bold text-[#5b6168]"><input type="checkbox" bind:checked={section.visible} class="h-4 w-4 accent-[#f5c518]" /> Vidljiva</label>
              <button type="button" aria-label="Pomakni sekciju gore" disabled={sectionIndex === 0} onclick={() => moveSection(sectionIndex, -1)} class="h-9 w-9 border border-[#dfe1e5] bg-white text-[#5b6168] disabled:opacity-30 active:-translate-y-px">↑</button>
              <button type="button" aria-label="Pomakni sekciju dolje" disabled={sectionIndex === draft.sections.length - 1} onclick={() => moveSection(sectionIndex, 1)} class="h-9 w-9 border border-[#dfe1e5] bg-white text-[#5b6168] disabled:opacity-30 active:-translate-y-px">↓</button>
            </div>
          </header>

          <div class="space-y-6 px-5 py-6">
            {#if section.eyebrow}
              <div class="grid gap-5 md:grid-cols-2"><label><span class="field-label">Nadnaslov — HR</span><input class="field" bind:value={section.eyebrow.hr} /></label><label><span class="field-label">Eyebrow — EN</span><input class="field" bind:value={section.eyebrow.en} /></label></div>
            {/if}
            {#if section.title}
              <div class="grid gap-5 md:grid-cols-2"><label><span class="field-label">Naslov — HR</span><textarea class="field" rows="2" bind:value={section.title.hr}></textarea></label><label><span class="field-label">Title — EN</span><textarea class="field" rows="2" bind:value={section.title.en}></textarea></label></div>
            {/if}
            {#if section.body}
              <div class="grid gap-5 md:grid-cols-2"><label><span class="field-label">Tekst — HR</span><textarea class="field" rows="5" bind:value={section.body.hr}></textarea></label><label><span class="field-label">Text — EN</span><textarea class="field" rows="5" bind:value={section.body.en}></textarea></label></div>
            {/if}
            {#if section.image !== undefined}
              <div class="grid gap-5 md:grid-cols-[1fr_180px] md:items-end">
                <label><span class="field-label">URL slike</span><input class="field" bind:value={section.image} placeholder="/images/... ili https://..." /></label>
                <div class="flex h-28 items-center justify-center overflow-hidden border border-[#e2e4e8] bg-[#f6f7f9]">{#if section.image}<img src={section.image} alt="" class="h-full w-full object-cover" />{:else}<span class="text-xs text-[#9aa0a8]">Nema slike</span>{/if}</div>
              </div>
            {/if}
            {#if section.imageAlt}
              <div class="grid gap-5 md:grid-cols-2"><label><span class="field-label">Opis slike — HR</span><input class="field" bind:value={section.imageAlt.hr} /></label><label><span class="field-label">Image alt — EN</span><input class="field" bind:value={section.imageAlt.en} /></label></div>
            {/if}
            {#if section.ctaLabel}
              <div class="grid gap-5 md:grid-cols-3"><label><span class="field-label">Gumb — HR</span><input class="field" bind:value={section.ctaLabel.hr} /></label><label><span class="field-label">Button — EN</span><input class="field" bind:value={section.ctaLabel.en} /></label><label><span class="field-label">Odredište gumba</span><input class="field" bind:value={section.ctaHref} /></label></div>
            {/if}

            {#if section.items}
              <div class="border-t border-[#e7e8eb] pt-6">
                <div class="mb-4 flex items-center justify-between gap-4"><h3 class="text-xs font-black uppercase tracking-[0.14em] text-[#5b6168]">Stavke ({section.items.length})</h3>{#if canAddItems(section)}<button type="button" onclick={() => addItem(section)} class="rounded-md border border-[#d9dce1] px-3 py-2 text-xs font-bold text-[#454a50] hover:border-[#f5c518] active:-translate-y-px">Dodaj stavku</button>{/if}</div>
                <div class="space-y-4">
                  {#each section.items as item, itemIndex (item.id)}
                    <div class="border-l-2 border-[#e0e2e6] bg-[#fafbfc] px-4 py-4">
                      <div class="mb-4 flex items-center justify-between gap-3">
                        <span class="font-mono text-[11px] text-[#8b9099]">{item.id}</span>
                        <div class="flex gap-2">
                          <button type="button" aria-label="Pomakni stavku gore" disabled={itemIndex === 0} onclick={() => moveItem(section, itemIndex, -1)} class="h-8 w-8 border border-[#dfe1e5] bg-white text-xs disabled:opacity-30">↑</button>
                          <button type="button" aria-label="Pomakni stavku dolje" disabled={itemIndex === section.items!.length - 1} onclick={() => moveItem(section, itemIndex, 1)} class="h-8 w-8 border border-[#dfe1e5] bg-white text-xs disabled:opacity-30">↓</button>
                          {#if canAddItems(section)}<button type="button" aria-label="Ukloni stavku" onclick={() => removeItem(section, itemIndex)} class="h-8 border border-[#efc5c2] bg-white px-2 text-[11px] font-bold text-[#9f1f18]">Ukloni</button>{/if}
                        </div>
                      </div>
                      <div class="grid gap-4 md:grid-cols-2">
                        {#if item.title}<label><span class="field-label">Naziv/pitanje — HR</span><input class="field" bind:value={item.title.hr} /></label><label><span class="field-label">Name/question — EN</span><input class="field" bind:value={item.title.en} /></label>{/if}
                        {#if item.body}<label><span class="field-label">Opis/odgovor — HR</span><textarea class="field" rows="3" bind:value={item.body.hr}></textarea></label><label><span class="field-label">Description/answer — EN</span><textarea class="field" rows="3" bind:value={item.body.en}></textarea></label>{/if}
                        {#if item.image !== undefined}<label><span class="field-label">URL slike/logotipa</span><input class="field" bind:value={item.image} /></label>{/if}
                        {#if item.alt}<label><span class="field-label">Opis slike — HR</span><input class="field" bind:value={item.alt.hr} /></label><label><span class="field-label">Image alt — EN</span><input class="field" bind:value={item.alt.en} /></label>{/if}
                        {#if item.href !== undefined}<label><span class="field-label">Poveznica</span><input class="field" bind:value={item.href} /></label>{/if}
                        {#if item.value !== undefined}<label><span class="field-label">Broj</span><input type="number" min="0" class="field" bind:value={item.value} /></label>{/if}
                        {#if item.suffix !== undefined}<label><span class="field-label">Oznaka iza broja</span><input class="field" bind:value={item.suffix} maxlength="12" /></label>{/if}
                        {#if item.icon}<label><span class="field-label">Ikona</span><select class="field" bind:value={item.icon}><option value="card">Kartica</option><option value="pin">Lokacija</option><option value="star">Zvijezda</option></select></label>{/if}
                        {#if item.filter !== undefined}<label><span class="field-label">CSS filter logotipa</span><input class="field" bind:value={item.filter} /></label>{/if}
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        </section>
      {/each}
    </div>

    <div class="fixed bottom-0 left-64 right-0 border-t border-[#dfe1e5] bg-white/95 px-8 py-4 shadow-[0_-10px_30px_rgba(39,42,47,0.06)] backdrop-blur-sm">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <p class="text-xs text-[#7a7f86]">Spremanje objavljuje cijelu stranicu odmah.</p>
        <button class="rounded-md bg-[#f5c518] px-6 py-3 text-xs font-black uppercase tracking-wide text-[#2b2b2b] hover:bg-[#e8b900] active:-translate-y-px">Spremi i objavi</button>
      </div>
    </div>
  </form>
</div>
