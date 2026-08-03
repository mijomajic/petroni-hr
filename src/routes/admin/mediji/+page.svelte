<script lang="ts">
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
  }

  function fileSize(bytes: number) {
    return bytes > 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
  }
</script>

<svelte:head><title>Mediji — Admin — Petroni</title></svelte:head>

<div class="max-w-6xl pb-16">
  <header class="mb-8">
    <p class="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7600]">Sadržaj</p>
    <h1 class="mt-2 text-3xl font-black uppercase tracking-tight text-[#2b2b2b]">Medijska biblioteka</h1>
    <p class="mt-2 max-w-3xl text-sm leading-6 text-[#7a7f86]">Original se sprema privatno, a za javnu stranicu nastaje optimizirana WebP verzija. Uz svaku sliku evidentirajte izvor i pravo korištenja.</p>
  </header>

  {#if form?.message}<div class="mb-6 rounded-md border border-[#eadfba] bg-[#fffdf5] p-4 text-sm text-[#6f5600]" role="status">{form.message}</div>{/if}

  <section class="border border-[#e1e3e6] bg-white p-6">
    <h2 class="text-sm font-black uppercase tracking-[0.14em] text-[#2b2b2b]">Dodaj sliku</h2>
    <form method="POST" action="?/upload" enctype="multipart/form-data" class="mt-5 grid gap-5 md:grid-cols-2">
      <label class="md:col-span-2"><span class="field-label">Slika</span><input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required class="field" /></label>
      <label><span class="field-label">Opis slike — HR</span><input name="alt_hr" class="field" maxlength="240" /></label>
      <label><span class="field-label">Opis slike — EN</span><input name="alt_en" class="field" maxlength="240" /></label>
      <label><span class="field-label">Izvor / porijeklo</span><input name="provenance" class="field" maxlength="500" placeholder="npr. Petroni, fotograf Ime Prezime" /></label>
      <label><span class="field-label">Licenca / napomena</span><input name="license_note" class="field" maxlength="500" placeholder="npr. interno odobreno za web" /></label>
      <div class="md:col-span-2 flex flex-wrap items-center gap-4"><button class="btn btn-primary px-6 py-3">Spremi sliku</button><p class="text-xs text-[#7a7f86]">JPG, PNG, WebP ili AVIF · do 15 MB</p></div>
    </form>
  </section>

  <section class="mt-8">
    <div class="mb-4 flex items-end justify-between gap-4"><div><h2 class="text-xl font-black text-[#2b2b2b]">Spremljeni mediji</h2><p class="mt-1 text-sm text-[#7a7f86]">{data.assets.length} stavki</p></div></div>
    {#if data.assets.length === 0}
      <div class="border border-dashed border-[#d8dce0] bg-white p-10 text-center text-sm text-[#7a7f86]">Još nema prenesenih slika.</div>
    {:else}
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {#each data.assets as asset}
          <article class="overflow-hidden border border-[#e1e3e6] bg-white {asset.status === 'archived' ? 'opacity-60' : ''}">
            <img src={asset.public_url} alt={asset.alt_hr || asset.original_filename} class="aspect-[4/3] w-full bg-[#f4f5f6] object-cover" />
            <div class="p-4">
              <div class="flex items-start justify-between gap-3"><p class="break-all text-sm font-bold text-[#2b2b2b]">{asset.original_filename}</p>{#if asset.status === 'archived'}<span class="shrink-0 rounded bg-[#f1f2f4] px-2 py-1 text-[10px] font-black uppercase text-[#737981]">Arhivirano</span>{/if}</div>
              <p class="mt-2 text-xs text-[#7a7f86]">{asset.width} × {asset.height} · {fileSize(Number(asset.original_bytes))}</p>
              {#if asset.provenance}<p class="mt-2 text-xs leading-5 text-[#5b6168]"><span class="font-bold">Izvor:</span> {asset.provenance}</p>{/if}
              <label class="mt-4 block"><span class="field-label">Javni URL</span><input readonly value={asset.public_url} class="field text-xs" /></label>
              <div class="mt-3 flex flex-wrap gap-2"><button type="button" onclick={() => copyUrl(asset.public_url)} class="rounded-md border border-[#d9dce1] px-3 py-2 text-xs font-bold text-[#454a50] hover:border-[#f5c518]">Kopiraj URL</button>{#if asset.status === 'active'}<form method="POST" action="?/archive" onsubmit={(event) => { if (!confirm('Arhivirati sliku? Neće se obrisati, ali više se ne bi trebala koristiti u novom sadržaju.')) event.preventDefault(); }}><input type="hidden" name="id" value={asset.id} /><button class="rounded-md border border-[#efc5c2] px-3 py-2 text-xs font-bold text-[#9f1f18] hover:bg-red-50">Arhiviraj</button></form>{/if}</div>
            </div>
          </article>
        {/each}
      </div>
    {/if}
  </section>
</div>
