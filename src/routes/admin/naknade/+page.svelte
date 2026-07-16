<script lang="ts">import type { PageProps } from './$types'; let { data, form }: PageProps = $props();</script>
<svelte:head><title>Naknade — Admin — Petroni</title></svelte:head>

<div class="max-w-[1500px]">
  <header class="mb-8"><p class="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7600]">Konfiguracija</p><h1 class="mt-2 text-3xl font-black tracking-tight text-[#2b2b2b]">Naknade i lokacije</h1><p class="mt-2 max-w-3xl text-sm leading-6 text-[#7a7f86]">Naknade i radna vremena koja koristi server-side obračun rezervacije.</p></header>
  {#if form?.message}<div class="mb-6 rounded-xl border border-[#eadfba] bg-[#fffaf0] p-4 text-sm text-[#6f5600]">{form.message}</div>{/if}

  <section aria-labelledby="fees-heading"><div class="mb-4 flex items-center justify-between"><h2 id="fees-heading" class="text-lg font-bold text-[#2b2b2b]">Naknade</h2><span class="text-xs text-[#8b9099]">{data.fees.length} stavki</span></div>
    <div class="grid gap-5 lg:grid-cols-2">
      {#each data.fees as fee}
        <form method="POST" action="?/saveFee" class="rounded-2xl border border-[#e2e3e6] bg-white p-5">
          <input type="hidden" name="id" value={fee.id} />
          <div class="mb-5 flex items-start justify-between gap-4"><div><p class="font-mono text-[11px] uppercase tracking-wide text-[#8b9099]">{fee.key}</p><p class="mt-1 font-semibold text-[#2b2b2b]">{fee.name_hr}</p></div><span class="rounded-md bg-[#fff7d6] px-3 py-1.5 text-sm font-bold tabular-nums text-[#806300]">{Number(fee.amount).toFixed(2)} €</span></div>
          <div class="grid gap-4 sm:grid-cols-2"><label><span class="field-label">Naziv</span><input name="name_hr" class="field" value={fee.name_hr} required /></label><label><span class="field-label">Iznos</span><input name="amount" type="number" step="0.01" class="field" value={fee.amount} /></label><label class="sm:col-span-2"><span class="field-label">Opis</span><input name="description_hr" class="field" value={fee.description_hr ?? ''} /></label><label><span class="field-label">Tip obračuna</span><select name="fee_type" class="field" value={fee.fee_type}><option value="per_event">Po događaju</option><option value="per_day">Po danu</option><option value="per_km">Po km</option><option value="percent">Postotak</option></select></label><label class="flex items-end gap-2 pb-3 text-sm font-semibold text-[#454a50]"><input type="checkbox" name="is_active" checked={fee.is_active} class="h-4 w-4 accent-[#F5C518]" /> Aktivna naknada</label></div>
          <div class="mt-5 flex justify-end border-t border-[#ededf0] pt-4"><button class="btn btn-primary px-5 py-2.5 text-black">Spremi naknadu</button></div>
        </form>
      {/each}
    </div>
  </section>

  <section class="mt-12" aria-labelledby="locations-heading"><div class="mb-4"><h2 id="locations-heading" class="text-lg font-bold text-[#2b2b2b]">Lokacije preuzimanja i povrata</h2><p class="mt-1 text-sm text-[#7a7f86]">Naknada lokacije i vremenski prozori bez doplate.</p></div>
    <div class="grid gap-5 lg:grid-cols-2">
      {#each data.locations as location}
        <form method="POST" action="?/saveLocation" class="rounded-2xl border border-[#e2e3e6] bg-white p-5">
          <input type="hidden" name="id" value={location.id} />
          <div class="mb-5 flex items-center justify-between gap-3"><p class="font-semibold text-[#2b2b2b]">{location.name}</p><span class="text-sm font-bold text-[#9a7600]">{Number(location.location_fee) ? `${Number(location.location_fee).toFixed(2)} €` : 'Bez naknade'}</span></div>
          <div class="grid gap-4 sm:grid-cols-2"><label class="sm:col-span-2"><span class="field-label">Naziv</span><input name="name" class="field" value={location.name} required /></label><label><span class="field-label">Naknada</span><input name="location_fee" type="number" step="0.01" class="field" value={location.location_fee} /></label><label><span class="field-label">Redoslijed</span><input name="sort_order" type="number" class="field" value={location.sort_order} /></label><label><span class="field-label">Preuzimanje bez doplate</span><input name="pickup_window" class="field" value={location.pickup_window ?? ''} placeholder="13:00-15:00" /></label><label><span class="field-label">Povrat bez doplate</span><input name="return_window" class="field" value={location.return_window ?? ''} placeholder="08:00-10:00" /></label></div>
          <div class="mt-5 flex items-center justify-between border-t border-[#ededf0] pt-4"><button class="btn btn-primary px-5 py-2.5 text-black">Spremi lokaciju</button><button type="submit" formaction="?/deleteLocation" onclick={(event) => { if (!confirm('Obrisati lokaciju?')) event.preventDefault(); }} class="text-sm font-semibold text-red-600 hover:underline">Obriši</button></div>
        </form>
      {/each}
      <form method="POST" action="?/saveLocation" class="rounded-2xl border border-dashed border-[#d6c77f] bg-[#fffdf5] p-5"><div class="mb-5"><p class="text-[11px] font-bold uppercase tracking-[.15em] text-[#9a7600]">Nova lokacija</p></div><div class="grid gap-4 sm:grid-cols-2"><label class="sm:col-span-2"><span class="field-label">Naziv</span><input name="name" class="field" required /></label><label><span class="field-label">Naknada</span><input name="location_fee" type="number" step="0.01" value="0" class="field" /></label><label><span class="field-label">Redoslijed</span><input name="sort_order" type="number" value="0" class="field" /></label><label><span class="field-label">Preuzimanje</span><input name="pickup_window" class="field" placeholder="13:00-15:00" /></label><label><span class="field-label">Povrat</span><input name="return_window" class="field" placeholder="08:00-10:00" /></label></div><button class="btn btn-dark mt-5 px-5 py-2.5">Dodaj lokaciju</button></form>
    </div>
  </section>
</div>
