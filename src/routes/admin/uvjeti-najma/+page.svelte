<script lang="ts">
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
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
    <div class="grid gap-2">
      <label for="terms-content" class="text-xs font-bold uppercase tracking-wider text-[#5b6168]">Tekst uvjeta na hrvatskom</label>
      <textarea id="terms-content" name="content_hr" rows="22" class="field min-h-[32rem] resize-y leading-relaxed" required>{data.activeTerms?.content_hr ?? ''}</textarea>
      <p class="text-xs text-[#8b9099]">Spremanje odmah postavlja ovu verziju kao aktivnu za nove rezervacije.</p>
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
