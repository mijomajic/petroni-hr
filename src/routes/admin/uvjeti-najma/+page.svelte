<script lang="ts">
  import { tick } from 'svelte';
  import { renderTermsMarkup } from '$lib/terms-markup';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
  let contentHr = $state('');
  let contentEn = $state('');
  let loadedTermsId = $state<string | null>(null);
  let activeEditor = $state<'hr' | 'en'>('hr');
  let hrTextarea: HTMLTextAreaElement;
  let enTextarea: HTMLTextAreaElement;

  $effect(() => {
    const activeTermsId = data.activeTerms?.id ?? null;
    if (activeTermsId !== loadedTermsId) {
      loadedTermsId = activeTermsId;
      contentHr = data.activeTerms?.content_hr ?? '';
      contentEn = data.activeTerms?.content_en ?? '';
    }
  });

  function currentTextarea() {
    return activeEditor === 'hr' ? hrTextarea : enTextarea;
  }

  function updateCurrent(value: string) {
    if (activeEditor === 'hr') contentHr = value;
    else contentEn = value;
  }

  async function insertBlock(prefix: string, placeholder: string, suffix = '') {
    const textarea = currentTextarea();
    if (!textarea) return;
    const value = activeEditor === 'hr' ? contentHr : contentEn;
    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || placeholder;
    const insertion = `${prefix}${selected}${suffix}`;
    updateCurrent(`${value.slice(0, start)}${insertion}${value.slice(end)}`);
    await tick();
    textarea.focus();
    textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
  }

  function toolbarButton(label: string, title: string) {
    return { label, title };
  }

  const toolbar = [
    toolbarButton('H2', 'Naslov'),
    toolbarButton('H3', 'Podnaslov'),
    toolbarButton('B', 'Podebljano'),
    toolbarButton('I', 'Kurziv'),
    toolbarButton('•', 'Lista'),
    toolbarButton('1.', 'Numerirana lista')
  ];

  function applyToolbar(label: string) {
    if (label === 'H2') void insertBlock('## ', 'Naslov');
    else if (label === 'H3') void insertBlock('### ', 'Podnaslov');
    else if (label === 'B') void insertBlock('**', 'tekst', '**');
    else if (label === 'I') void insertBlock('*', 'tekst', '*');
    else if (label === '•') void insertBlock('- ', 'Stavka');
    else void insertBlock('1. ', 'Stavka');
  }
</script>

<svelte:head><title>Uvjeti najma — Admin — Petroni</title></svelte:head>

<div class="max-w-5xl">
  <div class="mb-8">
    <p class="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7600]">Dokumenti</p>
    <h1 class="text-3xl font-black uppercase tracking-tight mt-2">Uvjeti najma</h1>
    <p class="text-sm text-[#7a7f86] mt-2 max-w-2xl">Svako spremanje izrađuje novu verziju. Stare verzije ostaju sačuvane uz rezervacije koje su ih prihvatile.</p>
  </div>

  {#if form?.message}
    <div class="mb-6 p-4 rounded-xl bg-[#fff7e0] text-[#6f5600] text-sm">{form.message}</div>
  {/if}

  <form method="POST" action="?/save" class="bg-white border border-[#e7e8eb] rounded-2xl p-6 md:p-8">
    <div class="grid gap-2 mb-6 max-w-sm">
      <label for="terms-version" class="text-xs font-bold uppercase tracking-wider text-[#5b6168]">Nova oznaka verzije</label>
      <input id="terms-version" name="version" class="field" placeholder="npr. 2026-07-01" required />
      <p class="text-xs text-[#8b9099]">Oznaka mora biti jedinstvena.</p>
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-2">
      {#each toolbar as item}
        <button type="button" class="h-9 min-w-9 px-3 rounded-md border border-[#dfe1e4] bg-white text-sm font-bold text-[#2b2b2b] hover:bg-[#f6f7f9] active:scale-[0.97]" title={item.title} onclick={() => applyToolbar(item.label)}>{item.label}</button>
      {/each}
      <p class="text-xs text-[#8b9099] ml-1">Formatiranje se sprema kao Markdown i prikazuje formatirano u rezervaciji.</p>
    </div>

    <div class="grid gap-6 xl:grid-cols-2">
      <div class="grid gap-6">
        <div class="grid gap-2">
          <label for="terms-content" class="text-xs font-bold uppercase tracking-wider text-[#5b6168]">Tekst uvjeta na hrvatskom</label>
          <textarea
            id="terms-content"
            name="content_hr"
            rows="18"
            class="field min-h-[24rem] resize-y leading-relaxed font-mono text-[13px]"
            required
            bind:this={hrTextarea}
            bind:value={contentHr}
            onfocus={() => activeEditor = 'hr'}
          ></textarea>
        </div>
        <div class="grid gap-2">
          <label for="terms-content-en" class="text-xs font-bold uppercase tracking-wider text-[#5b6168]">Tekst uvjeta na engleskom</label>
          <textarea
            id="terms-content-en"
            name="content_en"
            rows="18"
            class="field min-h-[24rem] resize-y leading-relaxed font-mono text-[13px]"
            bind:this={enTextarea}
            bind:value={contentEn}
            onfocus={() => activeEditor = 'en'}
          ></textarea>
          <p class="text-xs text-[#8b9099]">Spremanje odmah postavlja ovu verziju kao aktivnu za nove rezervacije. Engleski tekst je opcionalan, ali se prikazuje gostima koji koriste englesko sučelje.</p>
        </div>
      </div>

      <div class="rounded-xl border border-[#e7e8eb] bg-[#fafbfc] p-5 max-h-[52rem] overflow-y-auto">
        <div class="flex items-center justify-between gap-4 mb-4">
          <h2 class="text-xs font-bold uppercase tracking-wider text-[#5b6168]">Pregled formatiranja</h2>
          <span class="text-xs text-[#8b9099]">{activeEditor === 'hr' ? 'HR' : 'EN'}</span>
        </div>
        <div class="terms-document text-sm leading-7 text-[#4c5157]">
          {@html renderTermsMarkup(activeEditor === 'hr' ? contentHr : contentEn)}
        </div>
      </div>
    </div>

    <div class="mt-6 p-4 rounded-xl border border-[#f0d87a] bg-[#fffaf0] text-sm text-[#6f5600]">
      E-suglasnost je revizijski trag prihvaćanja. Pravnu valjanost i konačni tekst treba potvrditi pravni savjetnik.
    </div>
    <button type="submit" class="btn btn-primary mt-6 active:scale-[0.98]">Spremi kao novu aktivnu verziju</button>
  </form>

  <section class="mt-10">
    <h2 class="text-sm font-bold uppercase tracking-wider mb-4">Povijest verzija</h2>
    <div class="bg-white border border-[#e7e8eb] rounded-2xl divide-y divide-[#ededf0]">
      {#each data.versions as terms}
        <div class="flex items-center justify-between gap-4 px-5 py-4">
          <div><p class="font-bold">{terms.version}</p><p class="text-xs text-[#8b9099]">{new Date(terms.created_at).toLocaleString('hr-HR')}</p></div>
          <span class="text-xs font-bold uppercase {terms.is_active ? 'text-[#7a5b00]' : 'text-[#8b9099]'}">{terms.is_active ? 'Aktivna' : 'Arhivirana'}</span>
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  :global(.terms-document h2) {
    margin: 1.4rem 0 0.65rem;
    color: #2b2b2b;
    font-size: 1.05rem;
    font-weight: 900;
    line-height: 1.25;
    text-transform: uppercase;
  }

  :global(.terms-document h3) {
    margin: 1.15rem 0 0.45rem;
    color: #2b2b2b;
    font-size: 0.95rem;
    font-weight: 800;
    line-height: 1.35;
  }

  :global(.terms-document p) {
    margin: 0 0 0.65rem;
  }

  :global(.terms-document ul),
  :global(.terms-document ol) {
    margin: 0.2rem 0 0.9rem 1.25rem;
    padding: 0;
  }

  :global(.terms-document li) {
    margin: 0.28rem 0;
    padding-left: 0.2rem;
  }
</style>
