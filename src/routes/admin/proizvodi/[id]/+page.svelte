<script lang="ts">
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
  const product = $derived(data.product);
</script>

<svelte:head><title>{product.name_hr} — Admin — Petroni</title></svelte:head>

<div class="max-w-5xl">
  <div class="mb-8 flex items-center gap-4">
    <a href="/admin/proizvodi" class="rounded-md border border-[#d9dce1] bg-white px-4 py-2 text-sm font-bold text-[#454a50] hover:bg-[#f6f7f9]">Natrag</a>
    <div>
      <h1 class="text-3xl font-black uppercase tracking-tight text-[#2b2b2b]">{product.name_hr}</h1>
      <p class="mt-1 font-mono text-xs text-[#8b9099]">{product.slug}</p>
    </div>
  </div>

  {#if form?.message}
    <div class="mb-6 rounded-xl bg-[#fff7e0] p-4 text-sm text-[#6f5600]">{form.message}</div>
  {/if}

  <form method="POST" action="?/save" class="rounded-2xl border border-[#e7e8eb] bg-white p-6">
    <div class="grid gap-5 md:grid-cols-2">
      <label><span class="field-label">Naziv HR</span><input name="name_hr" class="field" value={product.name_hr} required /></label>
      <label><span class="field-label">Naziv EN</span><input name="name_en" class="field" value={product.name_en ?? ''} /></label>
      <label><span class="field-label">Slug</span><input name="slug" class="field" value={product.slug} /></label>
      <label><span class="field-label">SKU</span><input name="sku" class="field" value={product.sku ?? ''} /></label>
      <label><span class="field-label">Cijena</span><input name="price" type="number" step="0.01" min="0" value={product.price} class="field" /></label>
      <label><span class="field-label">Zaliha</span><input name="stock" type="number" min="0" value={product.stock} class="field" /></label>
      <label class="md:col-span-2">
        <span class="field-label">Kategorija</span>
        <select name="category_id" class="field" value={product.category_id ?? ''}>
          <option value="">Bez kategorije</option>
          {#each data.categories as category}
            <option value={category.id}>{category.name_hr}</option>
          {/each}
        </select>
      </label>
      <label><span class="field-label">Opis HR</span><textarea name="description_hr" rows="10" class="field">{product.description_hr ?? ''}</textarea></label>
      <label><span class="field-label">Opis EN</span><textarea name="description_en" rows="10" class="field">{product.description_en ?? ''}</textarea></label>
      <label class="md:col-span-2"><span class="field-label">Slike, jedan URL po retku</span><textarea name="images" rows="7" class="field font-mono text-xs">{product.images_text}</textarea></label>
    </div>
    <label class="mt-5 flex items-center gap-3 text-sm font-bold text-[#2b2b2b]">
      <input name="is_active" type="checkbox" checked={product.is_active} class="h-4 w-4 accent-[#F5C518]" />
      Aktivan u shopu
    </label>
    <button class="btn btn-primary mt-6 text-black">Spremi promjene</button>
  </form>
</div>
