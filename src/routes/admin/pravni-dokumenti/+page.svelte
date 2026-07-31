<script lang="ts">
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
</script>

<svelte:head><title>Pravni dokumenti — Admin — Petroni</title></svelte:head>

<div class="max-w-6xl">
  <div class="mb-8">
    <p class="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7600]">Dokumenti</p>
    <h1 class="mt-2 text-3xl font-black uppercase tracking-tight">Pravni dokumenti</h1>
    <p class="mt-2 max-w-3xl text-sm leading-6 text-[#7a7f86]">HR i EN tekstovi imaju odvojeni nacrt, objavljenu verziju, datum početka primjene i potpunu povijest. Vraćanje stare verzije stvara novi nacrt i nikada ne briše dokazni trag.</p>
  </div>

  <div class="mb-7 rounded-xl border border-[#f0d87a] bg-[#fffaf0] p-4 text-sm leading-6 text-[#6f5600]">
    Sustav tehnički vodi sadržaj i povijest. Petroni i pravni savjetnik odgovorni su za konačnu provjeru i odobrenje teksta prije objave.
  </div>

  <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    {#each data.documents as document}
      <a href={`/admin/pravni-dokumenti/${document.key}`} class="rounded-2xl border border-[#e7e8eb] bg-white p-6 transition hover:border-[#f0d87a] hover:shadow-sm">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-[#9a7600]">{document.route}</p>
            <h2 class="mt-2 text-lg font-black text-[#2b2b2b]">{document.label}</h2>
          </div>
          <span class="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase {document.draft ? 'bg-[#fff1bd] text-[#6f5600]' : 'bg-[#edf8f0] text-[#26713d]'}">{document.draft ? 'Nacrt' : 'Objavljeno'}</span>
        </div>
        <dl class="mt-5 grid gap-2 text-xs text-[#7a7f86]">
          <div class="flex justify-between gap-4"><dt>Objavljena verzija</dt><dd class="font-bold text-[#43484e]">v{document.published.version_number} · {document.published.version_label}</dd></div>
          <div class="flex justify-between gap-4"><dt>Primjenjuje se od</dt><dd class="font-bold text-[#43484e]">{document.published.effective_date}</dd></div>
          <div class="flex justify-between gap-4"><dt>Povijest</dt><dd class="font-bold text-[#43484e]">{document.versions.length} verzija</dd></div>
        </dl>
        {#if document.uses_fallback}<p class="mt-4 rounded-lg bg-[#fff6f5] p-3 text-xs text-[#9f1f18]">Migracija 0038 još nije primijenjena; javna stranica koristi sigurni ugrađeni početni tekst.</p>{/if}
      </a>
    {/each}
  </div>
</div>
