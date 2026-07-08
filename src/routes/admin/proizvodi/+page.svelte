<script lang="ts">
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
  const totalPages = $derived(Math.max(1, Math.ceil(data.total / data.pageSize)));
  function pageHref(page: number) {
    const params = new URLSearchParams();
    if (data.filters.query) params.set('q', data.filters.query);
    if (data.filters.category) params.set('category', data.filters.category);
    if (data.filters.status) params.set('status', data.filters.status);
    params.set('page', String(page));
    return `/admin/proizvodi?${params.toString()}`;
  }
</script>

<svelte:head><title>Proizvodi — Admin — Petroni</title></svelte:head>

<div>
  <div class="mb-8 flex items-start justify-between gap-4">
    <div>
      <h1 class="text-3xl font-black uppercase tracking-tight text-[#2b2b2b]">Proizvodi</h1>
      <p class="mt-2 text-sm text-[#7a7f86]">WooCommerce import je već live; ovdje se uređuju pojedinačni proizvodi i kategorije.</p>
    </div>
    <a href="/admin/proizvodi/novo" class="btn btn-primary text-black">Dodaj proizvod</a>
  </div>

  {#if form?.message}
    <div class="mb-6 rounded-xl bg-[#fff7e0] p-4 text-sm text-[#6f5600]">{form.message}</div>
  {/if}

  <form method="GET" class="mb-6 grid gap-3 rounded-2xl border border-[#e7e8eb] bg-white p-4 lg:grid-cols-[1fr_260px_180px_auto]">
    <input name="q" class="field" placeholder="Pretraži naziv ili SKU" value={data.filters.query} />
    <select name="category" class="field" value={data.filters.category}>
      <option value="">Sve kategorije</option>
      {#each data.categories as category}
        <option value={category.id}>{category.name_hr}</option>
      {/each}
    </select>
    <select name="status" class="field" value={data.filters.status}>
      <option value="">Svi statusi</option>
      <option value="active">Aktivni</option>
      <option value="inactive">Neaktivni</option>
    </select>
    <button class="btn btn-dark">Filtriraj</button>
  </form>

  <section class="overflow-hidden rounded-2xl border border-[#ededf0] bg-white">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b border-[#e7e8eb]">
          <tr>
            {#each ['Proizvod', 'SKU', 'Kategorija', 'Cijena', 'Zaliha', 'Status', 'Akcije'] as h}
              <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#7a7f86]">{h}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each data.products as product}
            <tr class="border-b border-[#f0f1f3]">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  {#if product.images?.[0]}<img src={product.images[0]} alt={product.name_hr} class="h-11 w-14 rounded-md object-cover" />{/if}
                  <div>
                    <p class="font-bold text-[#2b2b2b]">{product.name_hr}</p>
                    <p class="font-mono text-xs text-[#8b9099]">{product.slug}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 font-mono text-xs text-[#7a7f86]">{product.sku ?? '-'}</td>
              <td class="px-4 py-3 text-[#5b6168]">{product.product_categories?.[0]?.name_hr ?? '-'}</td>
              <td class="px-4 py-3 font-bold text-[#b5890a]">{Number(product.price).toFixed(2)} EUR</td>
              <td class="px-4 py-3 text-[#5b6168]">{product.stock}</td>
              <td class="px-4 py-3">
                <form method="POST" action="?/toggle">
                  <input type="hidden" name="id" value={product.id} />
                  <input type="hidden" name="next" value={String(!product.is_active)} />
                  <button class="rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-widest {product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}">
                    {product.is_active ? 'Aktivno' : 'Neaktivno'}
                  </button>
                </form>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <a href="/admin/proizvodi/{product.id}" class="rounded-md border border-[#dfe1e4] px-3 py-1.5 text-xs font-bold text-[#454a50] hover:bg-[#f6f7f9]">Uredi</a>
                  <form method="POST" action="?/deleteProduct" onsubmit={(event) => { if (!confirm('Obrisati proizvod?')) event.preventDefault(); }}>
                    <input type="hidden" name="id" value={product.id} />
                    <button class="rounded-md border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">Briši</button>
                  </form>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="flex items-center justify-between border-t border-[#ededf0] px-5 py-4 text-sm text-[#7a7f86]">
      <span>{data.total} proizvoda, stranica {data.page} / {totalPages}</span>
      <div class="flex items-center gap-2">
        {#if data.page > 1}<a href={pageHref(data.page - 1)} class="rounded-md border border-[#dfe1e4] px-3 py-1.5 font-bold hover:bg-[#f6f7f9]">Prethodna</a>{/if}
        {#if data.page < totalPages}<a href={pageHref(data.page + 1)} class="rounded-md border border-[#dfe1e4] px-3 py-1.5 font-bold hover:bg-[#f6f7f9]">Sljedeća</a>{/if}
      </div>
    </div>
  </section>

  <section class="mt-10 rounded-2xl border border-[#e7e8eb] bg-white p-5">
    <h2 class="mb-4 text-sm font-black uppercase tracking-widest text-[#2b2b2b]">Kategorije</h2>
    <div class="grid gap-4 lg:grid-cols-2">
      {#each data.categories as category}
        <div class="rounded-xl border border-[#ededf0] p-4">
          <form id="category-{category.id}" method="POST" action="?/saveCategory"></form>
          <div class="grid gap-3 md:grid-cols-2">
            <input form="category-{category.id}" type="hidden" name="id" value={category.id} />
            <label><span class="field-label">Naziv</span><input form="category-{category.id}" name="name_hr" class="field" value={category.name_hr} /></label>
            <label><span class="field-label">Slug</span><input form="category-{category.id}" name="slug" class="field" value={category.slug} /></label>
            <label><span class="field-label">Naziv EN</span><input form="category-{category.id}" name="name_en" class="field" value={category.name_en ?? ''} /></label>
            <label><span class="field-label">Sort</span><input form="category-{category.id}" name="sort_order" type="number" class="field" value={category.sort_order} /></label>
            <label class="md:col-span-2">
              <span class="field-label">Nadkategorija</span>
              <select form="category-{category.id}" name="parent_id" class="field" value={category.parent_id ?? ''}>
                <option value="">Bez nadkategorije</option>
                {#each data.categories.filter((item) => item.id !== category.id) as parent}
                  <option value={parent.id}>{parent.name_hr}</option>
                {/each}
              </select>
            </label>
            <div class="md:col-span-2 flex gap-2">
              <button form="category-{category.id}" class="rounded-md bg-[#F5C518] px-3 py-2 text-xs font-bold text-black">Spremi</button>
              <form method="POST" action="?/deleteCategory" onsubmit={(event) => { if (!confirm('Obrisati kategoriju?')) event.preventDefault(); }}>
                <input type="hidden" name="id" value={category.id} />
                <button class="rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">Briši</button>
              </form>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <form method="POST" action="?/saveCategory" class="mt-6 grid gap-3 rounded-xl border border-[#ededf0] bg-[#fafbfc] p-4 md:grid-cols-5">
      <label><span class="field-label">Nova kategorija</span><input name="name_hr" class="field" required /></label>
      <label><span class="field-label">Slug</span><input name="slug" class="field" /></label>
      <label><span class="field-label">Naziv EN</span><input name="name_en" class="field" /></label>
      <label><span class="field-label">Sort</span><input name="sort_order" type="number" value="0" class="field" /></label>
      <label>
        <span class="field-label">Nadkategorija</span>
        <select name="parent_id" class="field">
          <option value="">Bez nadkategorije</option>
          {#each data.categories as parent}
            <option value={parent.id}>{parent.name_hr}</option>
          {/each}
        </select>
      </label>
      <div class="md:col-span-5"><button class="btn btn-dark">Dodaj kategoriju</button></div>
    </form>
  </section>
</div>
