<script lang="ts">
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  function dateTime(value: string | null) {
    return value
      ? new Intl.DateTimeFormat('hr-HR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
      : 'Još nije spremljeno kroz CMS';
  }
</script>

<svelte:head><title>Javne stranice — Admin — Petroni</title></svelte:head>

<div class="max-w-6xl">
  <header class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <p class="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7600]">Sadržaj</p>
      <h1 class="mt-2 text-3xl font-black uppercase tracking-tight text-[#2b2b2b]">Javne stranice</h1>
      <p class="mt-2 max-w-3xl text-sm leading-6 text-[#7a7f86]">Uredite hrvatski i engleski tekst, slike, stavke, vidljivost i redoslijed sekcija. Vozila, shop, objave, dostava i uvjeti ostaju u svojim specijaliziranim admin modulima.</p>
    </div>
  </header>

  <div class="divide-y divide-[#e7e8eb] border-y border-[#e7e8eb] bg-white">
    {#each data.pages as page}
      <article class="grid gap-4 px-5 py-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <div class="flex flex-wrap items-center gap-3">
            <h2 class="text-lg font-black text-[#2b2b2b]">{page.label}</h2>
            {#if page.uses_fallback}<span class="rounded bg-[#fff7d6] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#725700]">Početni sadržaj</span>{/if}
          </div>
          <p class="mt-1 font-mono text-xs text-[#8b9099]">{page.route}</p>
          <p class="mt-2 text-xs text-[#7a7f86]">{page.content.sections.length} sekcija · {dateTime(page.updated_at)}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <a href={page.route} target="_blank" rel="noreferrer" class="rounded-md border border-[#dfe1e5] px-4 py-2.5 text-xs font-bold text-[#5b6168] hover:border-[#aeb2b8] active:-translate-y-px">Pregledaj</a>
          <a href="/admin/stranice/{page.key}" class="rounded-md bg-[#f5c518] px-4 py-2.5 text-xs font-black text-[#2b2b2b] hover:bg-[#e8b900] active:-translate-y-px">Uredi stranicu</a>
        </div>
      </article>
    {/each}
  </div>

  <div class="mt-8 border-l-2 border-[#f5c518] bg-[#fffdf5] px-5 py-4 text-sm leading-6 text-[#6f5600]">
    Promjene su javne odmah nakon spremanja. Funkcionalni elementi poput kontakt obrasca, popisa vozila i obračuna cijena nisu slobodno brisivi sadržaj; editor mijenja njihov naslov, opis, položaj i vidljivost.
  </div>
</div>
