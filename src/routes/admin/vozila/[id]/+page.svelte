<script lang="ts">
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
  const vehicle = $derived(data.vehicle);
</script>

<svelte:head><title>{vehicle.name} — Admin — Petroni</title></svelte:head>

<div class="max-w-6xl">
  <div class="mb-8 flex items-center justify-between gap-4">
    <div class="flex items-center gap-4">
      <a href="/admin/vozila" class="rounded-md border border-[#d9dce1] bg-white px-4 py-2 text-sm font-bold text-[#454a50] hover:bg-[#f6f7f9]">Natrag</a>
      <div>
        <h1 class="text-3xl font-black uppercase tracking-tight text-[#2b2b2b]">{vehicle.name}</h1>
        <p class="mt-1 font-mono text-xs text-[#8b9099]">{vehicle.slug}</p>
      </div>
    </div>
  </div>

  {#if form?.message}
    <div class="mb-6 rounded-xl bg-[#fff7e0] p-4 text-sm text-[#6f5600]">{form.message}</div>
  {/if}

  <div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
    <form method="POST" action="?/save" class="rounded-2xl border border-[#e7e8eb] bg-white p-6">
      <div class="grid gap-5 md:grid-cols-2">
        <label class="block"><span class="field-label">Naziv</span><input name="name" class="field" value={vehicle.name} required /></label>
        <label class="block"><span class="field-label">Slug</span><input name="slug" class="field" value={vehicle.slug} /></label>
        <label class="block">
          <span class="field-label">Tip</span>
          <select name="type" class="field" value={vehicle.type}>
            <option value="rental">Najam</option>
            <option value="sale">Prodaja</option>
            <option value="film">Film</option>
          </select>
        </label>
        <label class="block">
          <span class="field-label">Kategorija</span>
          <select name="category" class="field" value={vehicle.category ?? ''}>
            <option value="">Bez kategorije</option>
            <option value="ELITE">ELITE</option>
            <option value="COMFORT">COMFORT</option>
            <option value="DUO 4x4">DUO 4x4</option>
            <option value="ECO">ECO</option>
            <option value="KAMP PRIKOLICE">KAMP PRIKOLICE</option>
          </select>
        </label>
        <label class="block"><span class="field-label">Sjedala</span><input name="seats" type="number" min="0" class="field" value={vehicle.seats ?? ''} /></label>
        <label class="block"><span class="field-label">Ležajevi</span><input name="beds" type="number" min="0" class="field" value={vehicle.beds ?? ''} /></label>
        <label class="block"><span class="field-label">Torbe</span><input name="bags" type="number" min="0" class="field" value={vehicle.bags ?? ''} /></label>
        <label class="block"><span class="field-label">Sortiranje</span><input name="sort_order" type="number" class="field" value={vehicle.sort_order ?? 0} /></label>
        <label class="block"><span class="field-label">Maks. odraslih</span><input name="max_adults" type="number" min="0" class="field" value={vehicle.max_adults ?? ''} /></label>
        <label class="block"><span class="field-label">Maks. djece</span><input name="max_children" type="number" min="0" class="field" value={vehicle.max_children ?? ''} /></label>
        <label class="block"><span class="field-label">Cijena najma / dan</span><input name="base_price_per_day" type="number" step="0.01" min="0" class="field" value={vehicle.base_price_per_day ?? ''} /></label>
        <label class="block"><span class="field-label">Prodajna cijena</span><input name="sale_price" type="number" step="0.01" min="0" class="field" value={vehicle.sale_price ?? ''} /></label>
      </div>

      <div class="mt-5 grid gap-5 md:grid-cols-2">
        <label class="block"><span class="field-label">Opis HR</span><textarea name="description_hr" rows="7" class="field">{vehicle.description_hr ?? ''}</textarea></label>
        <label class="block"><span class="field-label">Opis EN</span><textarea name="description_en" rows="7" class="field">{vehicle.description_en ?? ''}</textarea></label>
        <label class="block"><span class="field-label">Slike, jedan URL po retku</span><textarea name="images" rows="8" class="field font-mono text-xs">{vehicle.images_text}</textarea></label>
        <label class="block"><span class="field-label">Specifikacije JSON</span><textarea name="specs_json" rows="8" class="field font-mono text-xs">{vehicle.specs_text}</textarea></label>
      </div>

      <label class="mt-5 flex items-center gap-3 text-sm font-bold text-[#2b2b2b]">
        <input name="is_available" type="checkbox" checked={vehicle.is_available} class="h-4 w-4 accent-[#F5C518]" />
        Dostupno na javnim stranicama i u rezervacijama
      </label>

      <button class="btn btn-primary mt-6 text-black">Spremi promjene</button>
    </form>

    <aside class="space-y-6">
      <section class="rounded-2xl border border-[#e7e8eb] bg-white p-5">
        <h2 class="mb-4 text-sm font-black uppercase tracking-widest text-[#2b2b2b]">Nova blokada</h2>
        <form method="POST" action="?/addBlock" class="space-y-4">
          <label class="block"><span class="field-label">Od</span><input name="date_from" type="date" class="field" required /></label>
          <label class="block"><span class="field-label">Do</span><input name="date_to" type="date" class="field" required /></label>
          <label class="block"><span class="field-label">Razlog</span><input name="reason" class="field" placeholder="Servis, privatni najam..." /></label>
          <button class="btn btn-dark w-full">Blokiraj termin</button>
        </form>
      </section>

      <section class="overflow-hidden rounded-2xl border border-[#e7e8eb] bg-white">
        <div class="border-b border-[#ededf0] p-5">
          <h2 class="text-sm font-black uppercase tracking-widest text-[#2b2b2b]">Blokirani termini</h2>
        </div>
        {#each data.blockedDates as block}
          <div class="border-b border-[#f0f1f3] p-5">
            <p class="font-bold text-[#2b2b2b]">{block.date_from} - {block.date_to}</p>
            <p class="mt-1 text-xs text-[#8b9099]">{block.reason ?? 'Bez napomene'}</p>
            <form method="POST" action="?/deleteBlock" class="mt-3" onsubmit={(event) => { if (!confirm('Ukloniti blokadu?')) event.preventDefault(); }}>
              <input type="hidden" name="id" value={block.id} />
              <button class="rounded-md border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">Ukloni</button>
            </form>
          </div>
        {/each}
        {#if data.blockedDates.length === 0}
          <p class="p-5 text-sm text-[#7a7f86]">Nema blokiranih termina.</p>
        {/if}
      </section>
    </aside>
  </div>
</div>
