<script lang="ts">
  import { tick } from 'svelte';
  import { renderTermsMarkup } from '$lib/terms-markup';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
  let loadedVersionId = $state<string | null | undefined>(undefined);
  let versionLabel = $state('');
  let effectiveDate = $state('');
  let titleHr = $state('');
  let titleEn = $state('');
  let summaryHr = $state('');
  let summaryEn = $state('');
  let contentHr = $state('');
  let contentEn = $state('');
  let activeEditor = $state<'hr' | 'en'>('hr');
  let hrTextarea: HTMLTextAreaElement;
  let enTextarea: HTMLTextAreaElement;

  $effect(() => {
    const source = data.document.draft ?? data.document.published;
    if (source.id !== loadedVersionId) {
      loadedVersionId = source.id;
      versionLabel = data.document.draft ? source.version_label : `${source.version_label}-rev`;
      effectiveDate = source.effective_date;
      titleHr = source.title_hr;
      titleEn = source.title_en;
      summaryHr = source.summary_hr;
      summaryEn = source.summary_en;
      contentHr = source.content_hr;
      contentEn = source.content_en;
    }
  });

  function currentTextarea() { return activeEditor === 'hr' ? hrTextarea : enTextarea; }
  function currentContent() { return activeEditor === 'hr' ? contentHr : contentEn; }
  function setCurrentContent(value: string) { if (activeEditor === 'hr') contentHr = value; else contentEn = value; }

  async function insertBlock(prefix: string, placeholder: string, suffix = '') {
    const textarea = currentTextarea();
    if (!textarea) return;
    const value = currentContent();
    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || placeholder;
    setCurrentContent(`${value.slice(0, start)}${prefix}${selected}${suffix}${value.slice(end)}`);
    await tick();
    textarea.focus();
    textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
  }

  function applyToolbar(value: string) {
    if (value === 'H2') void insertBlock('## ', 'Naslov');
    else if (value === 'H3') void insertBlock('### ', 'Podnaslov');
    else if (value === 'B') void insertBlock('**', 'tekst', '**');
    else if (value === 'I') void insertBlock('*', 'tekst', '*');
    else if (value === '•') void insertBlock('- ', 'Stavka');
    else void insertBlock('1. ', 'Stavka');
  }
</script>

<svelte:head><title>{data.document.label} — Admin — Petroni</title></svelte:head>

<div class="max-w-6xl">
  <a href="/admin/pravni-dokumenti" class="text-xs font-bold uppercase tracking-wide text-[#8b6b00]">← Pravni dokumenti</a>
  <div class="mb-7 mt-4 flex flex-wrap items-end justify-between gap-4">
    <div>
      <p class="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7600]">{data.document.route}</p>
      <h1 class="mt-2 text-3xl font-black uppercase tracking-tight">{data.document.label}</h1>
      <p class="mt-2 text-sm text-[#7a7f86]">Objavljeno: v{data.document.published.version_number} · {data.document.published.version_label} · od {data.document.published.effective_date}</p>
    </div>
    <a href={data.document.route} target="_blank" rel="noreferrer" class="btn btn-ghost">Otvori javnu stranicu</a>
  </div>

  {#if form?.message}<div class="mb-6 rounded-xl border border-[#eed68a] bg-[#fffaf0] p-4 text-sm text-[#6f5600]">{form.message}</div>{/if}
  {#if data.document.uses_fallback}<div class="mb-6 rounded-xl border border-[#f2b8b5] bg-[#fff6f5] p-4 text-sm text-[#9f1f18]">Migracija 0038 još nije primijenjena. Uređivanje i objava postaju dostupni nakon primjene migracije.</div>{/if}

  <form method="POST" action="?/saveDraft" class="rounded-2xl border border-[#e7e8eb] bg-white p-6 md:p-8">
    <div class="mb-6 grid gap-5 md:grid-cols-2">
      <label><span class="field-label">Oznaka verzije</span><input name="version_label" class="field" required bind:value={versionLabel} placeholder="2026-08-pravni-pregled" /></label>
      <label><span class="field-label">Datum početka primjene</span><input name="effective_date" type="date" class="field" required bind:value={effectiveDate} /></label>
      <label><span class="field-label">Naslov HR</span><input name="title_hr" class="field" required bind:value={titleHr} /></label>
      <label><span class="field-label">Naslov EN</span><input name="title_en" class="field" required bind:value={titleEn} /></label>
      <label><span class="field-label">Sažetak HR</span><textarea name="summary_hr" rows="3" class="field resize-y" bind:value={summaryHr}></textarea></label>
      <label><span class="field-label">Sažetak EN</span><textarea name="summary_en" rows="3" class="field resize-y" bind:value={summaryEn}></textarea></label>
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-2">
      {#each ['H2', 'H3', 'B', 'I', '•', '1.'] as item}<button type="button" class="h-9 min-w-9 rounded-md border border-[#dfe1e4] bg-white px-3 text-sm font-bold hover:bg-[#f6f7f9]" onclick={() => applyToolbar(item)}>{item}</button>{/each}
      <span class="ml-1 text-xs text-[#8b9099]">Markdown alatna traka uređuje aktivni jezik.</span>
    </div>

    <div class="grid gap-6 xl:grid-cols-2">
      <div class="grid gap-6">
        <label><span class="field-label">Tekst HR</span><textarea name="content_hr" rows="22" class="field min-h-[32rem] resize-y font-mono text-[13px] leading-relaxed" required bind:this={hrTextarea} bind:value={contentHr} onfocus={() => activeEditor = 'hr'}></textarea></label>
        <label><span class="field-label">Tekst EN</span><textarea name="content_en" rows="22" class="field min-h-[32rem] resize-y font-mono text-[13px] leading-relaxed" required bind:this={enTextarea} bind:value={contentEn} onfocus={() => activeEditor = 'en'}></textarea></label>
      </div>
      <div class="max-h-[72rem] overflow-y-auto rounded-xl border border-[#e7e8eb] bg-[#fafbfc] p-5">
        <div class="mb-4 flex items-center justify-between"><h2 class="text-xs font-bold uppercase tracking-wider">Pregled</h2><span class="text-xs text-[#8b9099]">{activeEditor.toUpperCase()}</span></div>
        <div class="terms-document text-sm leading-7 text-[#4c5157]">{@html renderTermsMarkup(currentContent())}</div>
      </div>
    </div>

    <div class="mt-6 rounded-xl border border-[#f0d87a] bg-[#fffaf0] p-4 text-sm leading-6 text-[#6f5600]">Spremanje izrađuje novi nacrt i arhivira prethodni nacrt. Javni dokument ostaje nepromijenjen dok zasebno ne kliknete objavu.</div>
    <button type="submit" class="btn btn-primary mt-6" disabled={data.document.uses_fallback}>Spremi novi nacrt</button>
  </form>

  {#if data.document.draft?.id}
    <section class="mt-7 rounded-2xl border border-[#f0d87a] bg-[#fffaf0] p-6">
      <h2 class="font-black text-[#2b2b2b]">Nacrt v{data.document.draft.version_number} spreman je za objavu</h2>
      <p class="mt-2 text-sm leading-6 text-[#6f5600]">Objava je trenutna i mijenja HR i EN javni tekst. Datum početka primjene bit će {data.document.draft.effective_date}. Prije objave sadržaj mora odobriti ovlaštena osoba Petronija i, prema potrebi, pravni savjetnik.</p>
      <form method="POST" action="?/publish" class="mt-4"><input type="hidden" name="version_id" value={data.document.draft.id} /><button type="submit" class="btn btn-dark">Objavi nacrt</button></form>
    </section>
  {/if}

  <section class="mt-10">
    <h2 class="mb-4 text-sm font-bold uppercase tracking-wider">Povijest verzija</h2>
    <div class="divide-y divide-[#ededf0] rounded-2xl border border-[#e7e8eb] bg-white">
      {#each data.document.versions as version}
        <div class="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <div class="flex flex-wrap items-center gap-2"><p class="font-bold">v{version.version_number} · {version.version_label}</p><span class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase {version.status === 'published' ? 'bg-[#edf8f0] text-[#26713d]' : version.status === 'draft' ? 'bg-[#fff1bd] text-[#6f5600]' : 'bg-[#f0f1f3] text-[#747980]'}">{version.status === 'published' ? 'Objavljena' : version.status === 'draft' ? 'Nacrt' : 'Arhivirana'}</span></div>
            <p class="mt-1 text-xs text-[#8b9099]">Primjena: {version.effective_date}{version.created_at ? ` · izrađeno ${new Date(version.created_at).toLocaleString('hr-HR')}` : ''}{version.restored_from_id ? ' · vraćena iz starije verzije' : ''}</p>
          </div>
          {#if version.id && version.status !== 'draft'}<form method="POST" action="?/restore"><input type="hidden" name="version_id" value={version.id} /><button type="submit" class="btn btn-ghost px-4 py-2 text-[11px]">Vrati kao nacrt</button></form>{/if}
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  :global(.terms-document h2) { margin: 1.4rem 0 .65rem; color: #2b2b2b; font-size: 1.05rem; font-weight: 900; line-height: 1.25; text-transform: uppercase; }
  :global(.terms-document h3) { margin: 1.15rem 0 .45rem; color: #2b2b2b; font-size: .95rem; font-weight: 800; }
  :global(.terms-document p) { margin: 0 0 .65rem; }
  :global(.terms-document ul), :global(.terms-document ol) { margin: .2rem 0 .9rem 1.25rem; padding: 0; }
  :global(.terms-document li) { margin: .28rem 0; padding-left: .2rem; }
</style>
