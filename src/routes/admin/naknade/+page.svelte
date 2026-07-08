<script lang="ts">
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
</script>

<svelte:head><title>Naknade — Admin — Petroni</title></svelte:head>

<div>
  <div class="mb-8">
    <p class="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7600]">Konfiguracija</p>
    <h1 class="mt-2 text-3xl font-black uppercase tracking-tight text-[#2b2b2b]">Naknade i lokacije</h1>
    <p class="mt-2 max-w-3xl text-sm text-[#7a7f86]">Ove vrijednosti koristi server-side obračun rezervacije. CorvusPay i tajni ključevi nisu ovdje.</p>
  </div>

  {#if form?.message}
    <div class="mb-6 rounded-xl bg-[#fff7e0] p-4 text-sm text-[#6f5600]">{form.message}</div>
  {/if}

  <section class="rounded-2xl border border-[#e7e8eb] bg-white">
    <div class="border-b border-[#ededf0] px-5 py-4">
      <h2 class="text-sm font-black uppercase tracking-widest text-[#2b2b2b]">Naknade</h2>
    </div>
    <div class="divide-y divide-[#f0f1f3]">
      {#each data.fees as fee}
        <div class="grid gap-3 p-5 xl:grid-cols-[120px_1fr_1.3fr_120px_150px_110px]">
          <form id="fee-{fee.id}" method="POST" action="?/saveFee"></form>
          <input form="fee-{fee.id}" type="hidden" name="id" value={fee.id} />
          <div>
            <span class="field-label">Ključ</span>
            <p class="font-mono text-xs text-[#5b6168]">{fee.key}</p>
          </div>
          <label><span class="field-label">Naziv</span><input form="fee-{fee.id}" name="name_hr" class="field" value={fee.name_hr} /></label>
          <label><span class="field-label">Opis</span><input form="fee-{fee.id}" name="description_hr" class="field" value={fee.description_hr ?? ''} /></label>
          <label><span class="field-label">Iznos</span><input form="fee-{fee.id}" name="amount" type="number" step="0.01" class="field" value={fee.amount} /></label>
          <label>
            <span class="field-label">Tip</span>
            <select form="fee-{fee.id}" name="fee_type" class="field" value={fee.fee_type}>
              <option value="per_event">Po događaju</option>
              <option value="per_day">Po danu</option>
              <option value="per_km">Po km</option>
              <option value="percent">Postotak</option>
            </select>
          </label>
          <div class="flex items-end gap-3">
            <label class="mb-2 flex items-center gap-2 text-xs font-bold text-[#5b6168]">
              <input form="fee-{fee.id}" type="checkbox" name="is_active" checked={fee.is_active} class="h-4 w-4 accent-[#F5C518]" />
              Aktivno
            </label>
            <button form="fee-{fee.id}" class="rounded-md bg-[#F5C518] px-3 py-2 text-xs font-bold text-black">Spremi</button>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section class="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
    <div class="rounded-2xl border border-[#e7e8eb] bg-white">
      <div class="border-b border-[#ededf0] px-5 py-4">
        <h2 class="text-sm font-black uppercase tracking-widest text-[#2b2b2b]">Lokacije preuzimanja/povrata</h2>
      </div>
      <div class="divide-y divide-[#f0f1f3]">
        {#each data.locations as location}
          <div class="grid gap-3 p-5 xl:grid-cols-[1.2fr_110px_150px_150px_90px_auto]">
            <form id="location-{location.id}" method="POST" action="?/saveLocation"></form>
            <input form="location-{location.id}" type="hidden" name="id" value={location.id} />
            <label><span class="field-label">Naziv</span><input form="location-{location.id}" name="name" class="field" value={location.name} /></label>
            <label><span class="field-label">Naknada</span><input form="location-{location.id}" name="location_fee" type="number" step="0.01" class="field" value={location.location_fee} /></label>
            <label><span class="field-label">Preuzimanje</span><input form="location-{location.id}" name="pickup_window" class="field" value={location.pickup_window ?? ''} placeholder="13:00-15:00" /></label>
            <label><span class="field-label">Povrat</span><input form="location-{location.id}" name="return_window" class="field" value={location.return_window ?? ''} placeholder="08:00-10:00" /></label>
            <label><span class="field-label">Sort</span><input form="location-{location.id}" name="sort_order" type="number" class="field" value={location.sort_order} /></label>
            <div class="flex items-end gap-2">
              <button form="location-{location.id}" class="rounded-md bg-[#F5C518] px-3 py-2 text-xs font-bold text-black">Spremi</button>
              <form method="POST" action="?/deleteLocation" onsubmit={(event) => { if (!confirm('Obrisati lokaciju?')) event.preventDefault(); }}>
                <input type="hidden" name="id" value={location.id} />
                <button class="rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">Briši</button>
              </form>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <form method="POST" action="?/saveLocation" class="rounded-2xl border border-[#e7e8eb] bg-white p-5">
      <h2 class="mb-4 text-sm font-black uppercase tracking-widest text-[#2b2b2b]">Nova lokacija</h2>
      <div class="space-y-4">
        <label><span class="field-label">Naziv</span><input name="name" class="field" required /></label>
        <label><span class="field-label">Naknada</span><input name="location_fee" type="number" step="0.01" value="0" class="field" /></label>
        <label><span class="field-label">Preuzimanje</span><input name="pickup_window" class="field" placeholder="13:00-15:00" /></label>
        <label><span class="field-label">Povrat</span><input name="return_window" class="field" placeholder="08:00-10:00" /></label>
        <label><span class="field-label">Sortiranje</span><input name="sort_order" type="number" value="0" class="field" /></label>
        <button class="btn btn-dark w-full">Dodaj lokaciju</button>
      </div>
    </form>
  </section>
</div>
