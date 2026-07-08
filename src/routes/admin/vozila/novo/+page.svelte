<script lang="ts">
  import type { PageProps } from './$types';

  let { form }: PageProps = $props();
</script>

<svelte:head><title>Novo vozilo — Admin — Petroni</title></svelte:head>

<div class="max-w-5xl">
  <div class="mb-8 flex items-center gap-4">
    <a href="/admin/vozila" class="rounded-md border border-[#d9dce1] bg-white px-4 py-2 text-sm font-bold text-[#454a50] hover:bg-[#f6f7f9]">Natrag</a>
    <div>
      <h1 class="text-3xl font-black uppercase tracking-tight text-[#2b2b2b]">Novo vozilo</h1>
      <p class="mt-1 text-sm text-[#7a7f86]">Svi iznosi su administrativne vrijednosti i ostaju uredive u Supabaseu.</p>
    </div>
  </div>

  {#if form?.message}
    <div class="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{form.message}</div>
  {/if}

  <form method="POST" action="?/save" class="rounded-2xl border border-[#e7e8eb] bg-white p-6">
    <div class="grid gap-5 md:grid-cols-2">
      <label class="block"><span class="field-label">Naziv</span><input name="name" class="field" required /></label>
      <label class="block"><span class="field-label">Slug</span><input name="slug" class="field" placeholder="automatski ako je prazno" /></label>
      <label class="block">
        <span class="field-label">Tip</span>
        <select name="type" class="field">
          <option value="rental">Najam</option>
          <option value="sale">Prodaja</option>
          <option value="film">Film</option>
        </select>
      </label>
      <label class="block">
        <span class="field-label">Kategorija</span>
        <select name="category" class="field">
          <option value="ELITE">ELITE</option>
          <option value="COMFORT" selected>COMFORT</option>
          <option value="DUO 4x4">DUO 4x4</option>
          <option value="ECO">ECO</option>
          <option value="KAMP PRIKOLICE">KAMP PRIKOLICE</option>
        </select>
      </label>
      <label class="block"><span class="field-label">Sjedala</span><input name="seats" type="number" min="0" class="field" /></label>
      <label class="block"><span class="field-label">Ležajevi</span><input name="beds" type="number" min="0" class="field" /></label>
      <label class="block"><span class="field-label">Torbe</span><input name="bags" type="number" min="0" class="field" /></label>
      <label class="block"><span class="field-label">Sortiranje</span><input name="sort_order" type="number" class="field" value="0" /></label>
      <label class="block"><span class="field-label">Maks. odraslih</span><input name="max_adults" type="number" min="0" class="field" /></label>
      <label class="block"><span class="field-label">Maks. djece</span><input name="max_children" type="number" min="0" class="field" /></label>
      <label class="block"><span class="field-label">Cijena najma / dan</span><input name="base_price_per_day" type="number" step="0.01" min="0" class="field" /></label>
      <label class="block"><span class="field-label">Prodajna cijena</span><input name="sale_price" type="number" step="0.01" min="0" class="field" /></label>
    </div>

    <div class="mt-5 grid gap-5 md:grid-cols-2">
      <label class="block"><span class="field-label">Opis HR</span><textarea name="description_hr" rows="6" class="field"></textarea></label>
      <label class="block"><span class="field-label">Opis EN</span><textarea name="description_en" rows="6" class="field"></textarea></label>
      <label class="block"><span class="field-label">Slike, jedan URL po retku</span><textarea name="images" rows="7" class="field font-mono text-xs"></textarea></label>
      <label class="block"><span class="field-label">Specifikacije JSON</span><textarea name="specs_json" rows="7" class="field font-mono text-xs">{'{\n  "deposit_eur": 3000\n}'}</textarea></label>
    </div>

    <label class="mt-5 flex items-center gap-3 text-sm font-bold text-[#2b2b2b]">
      <input name="is_available" type="checkbox" checked class="h-4 w-4 accent-[#F5C518]" />
      Dostupno na javnim stranicama i u rezervacijama
    </label>

    <button class="btn btn-primary mt-6 text-black">Spremi vozilo</button>
  </form>
</div>
