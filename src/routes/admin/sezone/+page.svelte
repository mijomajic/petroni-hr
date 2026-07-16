<script lang="ts">
  import type { PageProps } from './$types';
  let { data, form }: PageProps = $props();
  const priceMap = $derived(new Map(data.prices.map((price) => [`${price.season_id}:${price.vehicle_id}`, price.price_per_day])));
</script>

<svelte:head><title>Sezone i cijene — Admin — Petroni</title></svelte:head>

<div class="max-w-[1500px]">
  <header class="mb-8">
    <p class="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7600]">Najam</p>
    <h1 class="mt-2 text-3xl font-black tracking-tight text-[#2b2b2b]">Sezone i cijene</h1>
    <p class="mt-2 max-w-3xl text-sm leading-6 text-[#7a7f86]">Uredite razdoblja i minimalan broj noćenja. Cijene po vozilu nalaze se u zasebnoj tablici ispod.</p>
  </header>

  {#if form?.message}<div class="mb-6 rounded-xl border border-[#eadfba] bg-[#fffaf0] p-4 text-sm text-[#6f5600]">{form.message}</div>{/if}

  <section aria-labelledby="seasons-heading">
    <div class="mb-4 flex items-center justify-between"><h2 id="seasons-heading" class="text-lg font-bold text-[#2b2b2b]">Razdoblja najma</h2><span class="text-xs text-[#8b9099]">{data.seasons.length} sezona</span></div>
    <div class="grid gap-5 lg:grid-cols-2">
      {#each data.seasons as season}
        <form method="POST" action="?/saveSeason" class="rounded-2xl border border-[#e2e3e6] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,.03)]">
          <input type="hidden" name="id" value={season.id} />
          <div class="mb-5 flex items-start justify-between gap-4"><div><p class="text-[11px] font-bold uppercase tracking-[0.15em] text-[#9a7600]">Postojeća sezona</p><p class="mt-1 font-semibold text-[#2b2b2b]">{season.name}</p></div><span class="rounded-md bg-[#f5f6f7] px-2.5 py-1 text-xs text-[#70757b]">Min. {season.min_nights} noći</span></div>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="sm:col-span-2"><span class="field-label">Naziv</span><input name="name" class="field" value={season.name} required /></label>
            <label><span class="field-label">Početak</span><input name="date_from" type="date" class="field" value={season.date_from} required /></label>
            <label><span class="field-label">Kraj</span><input name="date_to" type="date" class="field" value={season.date_to} required /></label>
            <label><span class="field-label">Minimalno noćenja</span><input name="min_nights" type="number" min="1" class="field" value={season.min_nights} /></label>
            <label><span class="field-label">Redoslijed</span><input name="sort_order" type="number" class="field" value={season.sort_order} /></label>
          </div>
          <div class="mt-5 flex items-center justify-between border-t border-[#ededf0] pt-4"><button type="submit" class="btn btn-primary px-5 py-2.5 text-black">Spremi sezonu</button><button type="submit" formaction="?/deleteSeason" onclick={(event) => { if (!confirm('Obrisati sezonu i njezine cijene?')) event.preventDefault(); }} class="text-sm font-semibold text-red-600 hover:underline">Obriši</button></div>
        </form>
      {/each}

      <form method="POST" action="?/saveSeason" class="rounded-2xl border border-dashed border-[#d6c77f] bg-[#fffdf5] p-5">
        <div class="mb-5"><p class="text-[11px] font-bold uppercase tracking-[0.15em] text-[#9a7600]">Nova sezona</p><p class="mt-1 text-sm text-[#71767c]">Dodajte novo cjenovno razdoblje.</p></div>
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="sm:col-span-2"><span class="field-label">Naziv</span><input name="name" class="field" required /></label>
          <label><span class="field-label">Početak</span><input name="date_from" type="date" class="field" required /></label>
          <label><span class="field-label">Kraj</span><input name="date_to" type="date" class="field" required /></label>
          <label><span class="field-label">Minimalno noćenja</span><input name="min_nights" type="number" min="1" value="1" class="field" /></label>
          <label><span class="field-label">Redoslijed</span><input name="sort_order" type="number" value="0" class="field" /></label>
        </div>
        <button class="btn btn-dark mt-5 px-5 py-2.5">Dodaj sezonu</button>
      </form>
    </div>
  </section>

  <section class="mt-12" aria-labelledby="prices-heading">
    <div class="mb-4"><h2 id="prices-heading" class="text-lg font-bold text-[#2b2b2b]">Cijene po vozilu</h2><p class="mt-1 text-sm text-[#7a7f86]">Jedna tablica, jedno spremanje za sve kombinacije vozila i sezona.</p></div>
    <form method="POST" action="?/savePrices" class="overflow-hidden rounded-2xl border border-[#e2e3e6] bg-white">
      <div class="overflow-x-auto"><table class="w-full min-w-[900px] text-sm"><thead class="border-b border-[#e7e8eb] bg-[#fafafa]"><tr><th class="sticky left-0 bg-[#fafafa] px-5 py-4 text-left text-xs font-bold uppercase tracking-widest text-[#7a7f86]">Vozilo</th>{#each data.seasons as season}<th class="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#7a7f86]">{season.name}</th>{/each}</tr></thead><tbody>{#each data.vehicles as vehicle}<tr class="border-b border-[#f0f1f3]"><td class="sticky left-0 bg-white px-5 py-4"><p class="font-bold text-[#2b2b2b]">{vehicle.name}</p><p class="text-xs text-[#8b9099]">{vehicle.category ?? '-'}</p></td>{#each data.seasons as season}<td class="px-4 py-3"><input aria-label="{vehicle.name}, {season.name}" name="price:{season.id}:{vehicle.id}" type="number" step="0.01" min="0" class="field w-32" value={priceMap.get(`${season.id}:${vehicle.id}`) ?? ''} /></td>{/each}</tr>{/each}</tbody></table></div>
      <div class="flex justify-end border-t border-[#ededf0] bg-[#fafafa] p-4"><button class="btn btn-primary px-6 py-3 text-black">Spremi sve cijene</button></div>
    </form>
  </section>
</div>
