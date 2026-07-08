<script lang="ts">
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
</script>

<svelte:head><title>Novi proizvod — Admin — Petroni</title></svelte:head>

<div class="max-w-5xl">
  <div class="mb-8 flex items-center gap-4">
    <a href="/admin/proizvodi" class="rounded-md border border-[#d9dce1] bg-white px-4 py-2 text-sm font-bold text-[#454a50] hover:bg-[#f6f7f9]">Natrag</a>
    <h1 class="text-3xl font-black uppercase tracking-tight text-[#2b2b2b]">Novi proizvod</h1>
  </div>

  {#if form?.message}
    <div class="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{form.message}</div>
  {/if}

  <form method="POST" action="?/save" class="rounded-2xl border border-[#e7e8eb] bg-white p-6">
    <div class="grid gap-5 md:grid-cols-2">
      <label><span class="field-label">Naziv HR</span><input name="name_hr" class="field" required /></label>
      <label><span class="field-label">Naziv EN</span><input name="name_en" class="field" /></label>
      <label><span class="field-label">Slug</span><input name="slug" class="field" /></label>
      <label><span class="field-label">SKU</span><input name="sku" class="field" /></label>
      <label><span class="field-label">Cijena</span><input name="price" type="number" step="0.01" min="0" value="0" class="field" /></label>
      <label><span class="field-label">Zaliha</span><input name="stock" type="number" min="0" value="0" class="field" /></label>
      <label class="md:col-span-2">
        <span class="field-label">Kategorija</span>
        <select name="category_id" class="field">
          <option value="">Bez kategorije</option>
          {#each data.categories as category}
            <option value={category.id}>{category.name_hr}</option>
          {/each}
        </select>
      </label>
      <label><span class="field-label">Opis HR</span><textarea name="description_hr" rows="8" class="field"></textarea></label>
      <label><span class="field-label">Opis EN</span><textarea name="description_en" rows="8" class="field"></textarea></label>
      <label class="md:col-span-2"><span class="field-label">Slike, jedan URL po retku</span><textarea name="images" rows="6" class="field font-mono text-xs"></textarea></label>
    </div>
    <label class="mt-5 flex items-center gap-3 text-sm font-bold text-[#2b2b2b]">
      <input name="is_active" type="checkbox" checked class="h-4 w-4 accent-[#F5C518]" />
      Aktivan u shopu
    </label>
    <button class="btn btn-primary mt-6 text-black">Spremi proizvod</button>
  </form>
</div>
