<script lang="ts">
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
</script>

<svelte:head><title>Dodatne opcije — Admin — Petroni</title></svelte:head>

<div>
  <div class="mb-8">
    <p class="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7600]">Najam</p>
    <h1 class="mt-2 text-3xl font-black uppercase tracking-tight text-[#2b2b2b]">Dodatne opcije</h1>
    <p class="mt-2 max-w-3xl text-sm text-[#7a7f86]">Uredite opremu, čišćenje, depozite i obavezne stavke koje ulaze u server-side obračun rezervacije.</p>
  </div>

  {#if form?.message}
    <div class="mb-6 rounded-xl bg-[#fff7e0] p-4 text-sm text-[#6f5600]">{form.message}</div>
  {/if}

  <section class="rounded-2xl border border-[#e7e8eb] bg-white">
    <div class="divide-y divide-[#f0f1f3]">
      {#each data.extras as extra}
        <div class="grid gap-3 p-5 xl:grid-cols-[1.3fr_1fr_110px_140px_150px_170px_90px_120px]">
          <form id="extra-{extra.id}" method="POST" action="?/saveExtra"></form>
          <input form="extra-{extra.id}" type="hidden" name="id" value={extra.id} />
          <label><span class="field-label">Naziv HR</span><input form="extra-{extra.id}" name="name_hr" class="field" value={extra.name_hr} /></label>
          <label><span class="field-label">Opis</span><input form="extra-{extra.id}" name="description_hr" class="field" value={extra.description_hr ?? ''} /></label>
          <label><span class="field-label">Cijena</span><input form="extra-{extra.id}" name="price" type="number" step="0.01" class="field" value={extra.price} /></label>
          <label>
            <span class="field-label">Tip cijene</span>
            <select form="extra-{extra.id}" name="price_type" class="field" value={extra.price_type}>
              <option value="per_rental">Po najmu</option>
              <option value="per_day">Po danu</option>
              <option value="refundable">Povratno</option>
            </select>
          </label>
          <label>
            <span class="field-label">Kategorija</span>
            <select form="extra-{extra.id}" name="category" class="field" value={extra.category ?? ''}>
              <option value="">Bez kategorije</option>
              <option value="depozit">Depozit</option>
              <option value="oprema">Oprema</option>
              <option value="ciscenje">Čišćenje</option>
              <option value="posebne_naknade">Posebne naknade</option>
              <option value="ostalo">Ostalo</option>
            </select>
          </label>
          <label>
            <span class="field-label">Automatska primjena</span>
            <select form="extra-{extra.id}" name="auto_apply_rule" class="field" value={extra.auto_apply_rule ?? ''}>
              <option value="">Ručno odabire gost</option>
              <option value="border_crossing">Prelazak granice</option>
              <option value="festival">Festival</option>
            </select>
          </label>
          <label><span class="field-label">Max</span><input form="extra-{extra.id}" name="max_qty" type="number" min="1" class="field" value={extra.max_qty} /></label>
          <div class="flex items-end gap-2">
            <label class="mb-2 flex items-center gap-2 text-xs font-bold text-[#5b6168]">
              <input form="extra-{extra.id}" type="checkbox" name="is_required" checked={extra.is_required} class="h-4 w-4 accent-[#F5C518]" />
              Obavezno
            </label>
            <input form="extra-{extra.id}" type="hidden" name="sort_order" value={extra.sort_order} />
            <input form="extra-{extra.id}" type="hidden" name="name_en" value={extra.name_en ?? ''} />
            <button form="extra-{extra.id}" class="rounded-md bg-[#F5C518] px-3 py-2 text-xs font-bold text-black">Spremi</button>
            <form method="POST" action="?/deleteExtra" onsubmit={(event) => { if (!confirm('Obrisati dodatnu opciju?')) event.preventDefault(); }}>
              <input type="hidden" name="id" value={extra.id} />
              <button class="rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">Briši</button>
            </form>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <form method="POST" action="?/saveExtra" class="mt-8 rounded-2xl border border-[#e7e8eb] bg-white p-5">
    <h2 class="mb-4 text-sm font-black uppercase tracking-widest text-[#2b2b2b]">Nova opcija</h2>
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <label><span class="field-label">Naziv HR</span><input name="name_hr" class="field" required /></label>
      <label><span class="field-label">Naziv EN</span><input name="name_en" class="field" /></label>
      <label><span class="field-label">Cijena</span><input name="price" type="number" step="0.01" value="0" class="field" /></label>
      <label>
        <span class="field-label">Tip cijene</span>
        <select name="price_type" class="field">
          <option value="per_rental">Po najmu</option>
          <option value="per_day">Po danu</option>
          <option value="refundable">Povratno</option>
        </select>
      </label>
      <label>
        <span class="field-label">Kategorija</span>
        <select name="category" class="field">
          <option value="oprema">Oprema</option>
          <option value="depozit">Depozit</option>
          <option value="ciscenje">Čišćenje</option>
          <option value="posebne_naknade">Posebne naknade</option>
          <option value="ostalo">Ostalo</option>
        </select>
      </label>
      <label>
        <span class="field-label">Automatska primjena</span>
        <select name="auto_apply_rule" class="field">
          <option value="">Ručno odabire gost</option>
          <option value="border_crossing">Prelazak granice</option>
          <option value="festival">Festival</option>
        </select>
      </label>
      <label><span class="field-label">Max količina</span><input name="max_qty" type="number" min="1" value="1" class="field" /></label>
      <label><span class="field-label">Sortiranje</span><input name="sort_order" type="number" value="0" class="field" /></label>
      <label class="flex items-end gap-2 pb-3 text-sm font-bold text-[#2b2b2b]">
        <input name="is_required" type="checkbox" class="h-4 w-4 accent-[#F5C518]" />
        Obavezna stavka
      </label>
      <label class="md:col-span-2 xl:col-span-4"><span class="field-label">Opis HR</span><textarea name="description_hr" rows="3" class="field"></textarea></label>
    </div>
    <button class="btn btn-dark mt-5">Dodaj opciju</button>
  </form>
</div>
