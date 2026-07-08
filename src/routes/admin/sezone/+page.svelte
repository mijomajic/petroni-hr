<script lang="ts">
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
  const priceMap = $derived(
    new Map(data.prices.map((price) => [`${price.season_id}:${price.vehicle_id}`, price.price_per_day]))
  );
</script>

<svelte:head><title>Sezone i cijene — Admin — Petroni</title></svelte:head>

<div>
  <div class="mb-8">
    <p class="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7600]">Najam</p>
    <h1 class="mt-2 text-3xl font-black uppercase tracking-tight text-[#2b2b2b]">Sezone i cijene</h1>
    <p class="mt-2 max-w-3xl text-sm text-[#7a7f86]">Sezonske cijene i minimalan broj noćenja čita kalkulator rezervacije. Promjene vrijede za nove izračune.</p>
  </div>

  {#if form?.message}
    <div class="mb-6 rounded-xl bg-[#fff7e0] p-4 text-sm text-[#6f5600]">{form.message}</div>
  {/if}

  <section class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
    <div class="rounded-2xl border border-[#e7e8eb] bg-white">
      <div class="border-b border-[#ededf0] px-5 py-4">
        <h2 class="text-sm font-black uppercase tracking-widest text-[#2b2b2b]">Sezone</h2>
      </div>
      <div class="divide-y divide-[#f0f1f3]">
        {#each data.seasons as season}
          <div class="grid gap-3 p-5 xl:grid-cols-[1.3fr_150px_150px_120px_90px_auto]">
            <form id="season-{season.id}" method="POST" action="?/saveSeason"></form>
            <input form="season-{season.id}" type="hidden" name="id" value={season.id} />
            <label class="block"><span class="field-label">Naziv</span><input form="season-{season.id}" name="name" class="field" value={season.name} /></label>
            <label class="block"><span class="field-label">Od</span><input form="season-{season.id}" name="date_from" type="date" class="field" value={season.date_from} /></label>
            <label class="block"><span class="field-label">Do</span><input form="season-{season.id}" name="date_to" type="date" class="field" value={season.date_to} /></label>
            <label class="block"><span class="field-label">Min.</span><input form="season-{season.id}" name="min_nights" type="number" min="1" class="field" value={season.min_nights} /></label>
            <label class="block"><span class="field-label">Sort</span><input form="season-{season.id}" name="sort_order" type="number" class="field" value={season.sort_order} /></label>
            <div class="flex items-end gap-2">
              <button form="season-{season.id}" class="rounded-md bg-[#F5C518] px-3 py-2 text-xs font-bold text-black">Spremi</button>
              <form method="POST" action="?/deleteSeason" onsubmit={(event) => { if (!confirm('Obrisati sezonu i njezine cijene?')) event.preventDefault(); }}>
                <input type="hidden" name="id" value={season.id} />
                <button class="rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">Briši</button>
              </form>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <form method="POST" action="?/saveSeason" class="rounded-2xl border border-[#e7e8eb] bg-white p-5">
      <h2 class="mb-4 text-sm font-black uppercase tracking-widest text-[#2b2b2b]">Nova sezona</h2>
      <div class="space-y-4">
        <label class="block"><span class="field-label">Naziv</span><input name="name" class="field" required /></label>
        <label class="block"><span class="field-label">Od</span><input name="date_from" type="date" class="field" required /></label>
        <label class="block"><span class="field-label">Do</span><input name="date_to" type="date" class="field" required /></label>
        <label class="block"><span class="field-label">Minimalno noćenja</span><input name="min_nights" type="number" min="1" value="1" class="field" /></label>
        <label class="block"><span class="field-label">Sortiranje</span><input name="sort_order" type="number" value="0" class="field" /></label>
        <button class="btn btn-dark w-full">Dodaj sezonu</button>
      </div>
    </form>
  </section>

  <section class="mt-10">
    <div class="mb-4">
      <h2 class="text-sm font-black uppercase tracking-widest text-[#2b2b2b]">Cijene po vozilu</h2>
      <p class="mt-1 text-xs text-[#8b9099]">Unesite cijenu po noćenju/danu za svaku kombinaciju sezone i rental vozila.</p>
    </div>
    <form method="POST" action="?/savePrices" class="overflow-hidden rounded-2xl border border-[#e7e8eb] bg-white">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[900px] text-sm">
          <thead class="border-b border-[#e7e8eb]">
            <tr>
              <th class="sticky left-0 bg-white px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#7a7f86]">Vozilo</th>
              {#each data.seasons as season}
                <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#7a7f86]">{season.name}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each data.vehicles as vehicle}
              <tr class="border-b border-[#f0f1f3]">
                <td class="sticky left-0 bg-white px-4 py-3">
                  <p class="font-bold text-[#2b2b2b]">{vehicle.name}</p>
                  <p class="text-xs text-[#8b9099]">{vehicle.category ?? '-'}</p>
                </td>
                {#each data.seasons as season}
                  <td class="px-4 py-3">
                    <input
                      name="price:{season.id}:{vehicle.id}"
                      type="number"
                      step="0.01"
                      min="0"
                      class="field w-32"
                      value={priceMap.get(`${season.id}:${vehicle.id}`) ?? ''}
                    />
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div class="border-t border-[#ededf0] p-4">
        <button class="btn btn-primary text-black">Spremi sve cijene</button>
      </div>
    </form>
  </section>
</div>
