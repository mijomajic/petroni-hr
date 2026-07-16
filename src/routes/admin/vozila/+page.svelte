<script lang="ts">
  import { vehicleThumbnail } from '$lib/vehicle-images';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
</script>

<svelte:head><title>Vozila — Admin — Petroni</title></svelte:head>

<div>
  <div class="mb-8 flex items-start justify-between gap-4">
    <div>
      <h1 class="text-3xl font-black uppercase tracking-tight text-[#2b2b2b]">Vozila</h1>
      <p class="mt-2 max-w-2xl text-sm text-[#7a7f86]">Uredite najam, prodajna i filmska vozila. Blokirani termini ovdje izravno utječu na dostupnost u rezervacijama.</p>
    </div>
    <a href="/admin/vozila/novo" class="btn btn-primary text-black">Dodaj vozilo</a>
  </div>

  {#if form?.message}
    <div class="mb-6 rounded-xl bg-[#fff7e0] p-4 text-sm text-[#6f5600]">{form.message}</div>
  {/if}

  <section class="overflow-hidden rounded-2xl border border-[#ededf0] bg-white">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b border-[#e7e8eb]">
          <tr>
            {#each ['Vozilo', 'Tip', 'Kategorija', 'Kapacitet', 'Cijena', 'Status', 'Akcije'] as h}
              <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#7a7f86]">{h}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each data.vehicles as vehicle}
            <tr class="border-b border-[#f0f1f3]">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  {#if vehicle.images?.[0]}
                    <img src={vehicleThumbnail(vehicle.images[0])} alt={vehicle.name} width="480" height="360" loading="lazy" class="h-10 w-14 rounded-md object-cover" />
                  {/if}
                  <div>
                    <p class="font-bold text-[#2b2b2b]">{vehicle.name}</p>
                    <p class="font-mono text-xs text-[#8b9099]">{vehicle.slug}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#7a7f86]">{vehicle.type}</td>
              <td class="px-4 py-3 text-xs font-bold uppercase text-[#7a7f86]">{vehicle.category ?? '-'}</td>
              <td class="px-4 py-3 text-[#5b6168]">{vehicle.seats ?? '-'} sjedala / {vehicle.beds ?? '-'} ležaja</td>
              <td class="px-4 py-3 font-bold text-[#b5890a]">
                {vehicle.type === 'rental' ? `${vehicle.base_price_per_day ?? 0} EUR/dan` : `${vehicle.sale_price ?? 0} EUR`}
              </td>
              <td class="px-4 py-3">
                <form method="POST" action="?/toggle">
                  <input type="hidden" name="id" value={vehicle.id} />
                  <input type="hidden" name="next" value={String(!vehicle.is_available)} />
                  <button class="rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-widest {vehicle.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}">
                    {vehicle.is_available ? 'Dostupno' : 'Nedostupno'}
                  </button>
                </form>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <a href="/admin/vozila/{vehicle.id}" class="rounded-md border border-[#dfe1e4] px-3 py-1.5 text-xs font-bold text-[#454a50] hover:bg-[#f6f7f9]">Uredi</a>
                  <form method="POST" action="?/delete" onsubmit={(event) => { if (!confirm('Obrisati vozilo?')) event.preventDefault(); }}>
                    <input type="hidden" name="id" value={vehicle.id} />
                    <button class="rounded-md border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">Briši</button>
                  </form>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
      {#if data.vehicles.length === 0}
        <p class="p-8 text-center text-sm text-[#7a7f86]">Nema vozila.</p>
      {/if}
    </div>
  </section>

  <section class="mt-10">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-sm font-black uppercase tracking-widest text-[#2b2b2b]">Blokirani termini</h2>
      <p class="text-xs text-[#8b9099]">Prikazuje se sljedećih 40 unosa.</p>
    </div>
    <div class="overflow-hidden rounded-2xl border border-[#ededf0] bg-white">
      {#each data.blockedDates as block}
        <div class="flex items-center justify-between gap-4 border-b border-[#f0f1f3] px-5 py-4">
          <div>
            <p class="font-bold text-[#2b2b2b]">{block.vehicles?.[0]?.name ?? 'Vozilo'}: {block.date_from} - {block.date_to}</p>
            <p class="text-xs text-[#8b9099]">{block.reason ?? 'Bez napomene'}</p>
          </div>
          <form method="POST" action="?/deleteBlock" onsubmit={(event) => { if (!confirm('Ukloniti blokadu?')) event.preventDefault(); }}>
            <input type="hidden" name="id" value={block.id} />
            <button class="rounded-md border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">Ukloni</button>
          </form>
        </div>
      {/each}
      {#if data.blockedDates.length === 0}
        <p class="p-6 text-sm text-[#7a7f86]">Nema blokiranih termina.</p>
      {/if}
    </div>
  </section>
</div>
