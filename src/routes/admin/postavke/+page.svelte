<script lang="ts">
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
</script>

<svelte:head><title>Postavke — Admin — Petroni</title></svelte:head>

<div class="max-w-5xl">
  <div class="mb-8">
    <p class="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7600]">Konfiguracija</p>
    <h1 class="mt-2 text-3xl font-black uppercase tracking-tight text-[#2b2b2b]">Postavke</h1>
    <p class="mt-2 max-w-3xl text-sm text-[#7a7f86]">Uredive poslovne vrijednosti. CorvusPay ključevi, Supabase ključevi i Resend API ključ ostaju samo u environment varijablama.</p>
  </div>

  {#if form?.message}
    <div class="mb-6 rounded-xl bg-[#fff7e0] p-4 text-sm text-[#6f5600]">{form.message}</div>
  {/if}

  <form method="POST" action="?/save" class="rounded-2xl border border-[#e7e8eb] bg-white p-6">
    <div class="grid gap-5 md:grid-cols-2">
      <label><span class="field-label">Admin email</span><input name="admin_email" type="email" class="field" value={data.settings.admin_email} /></label>
      <label><span class="field-label">Email pošiljatelj</span><input name="email_from" class="field" value={data.settings.email_from} /></label>
      <label><span class="field-label">Besplatna Overseas dostava od EUR (0 = isključeno)</span><input name="free_shipping_threshold" type="number" min="0" step="0.01" class="field" value={data.settings.free_shipping_threshold} /></label>
      <label><span class="field-label">Minimalna dob vozača</span><input name="min_driver_age" type="number" class="field" value={data.settings.min_driver_age} /></label>
      <label><span class="field-label">Uključeni km po danu</span><input name="km_per_day_included" type="number" class="field" value={data.settings.km_per_day_included} /></label>
      <label><span class="field-label">Druga rata, dana prije preuzimanja</span><input name="split_payment_due_days" type="number" min="1" class="field" value={data.settings.split_payment_due_days} /></label>
      <label><span class="field-label">Minimalno dana unaprijed za 50/50</span><input name="split_payment_min_advance_days" type="number" min="1" class="field" value={data.settings.split_payment_min_advance_days} /></label>
      <label><span class="field-label">Najraniji termin rezervacije</span><input name="booking_time_selection_start" type="time" step="900" class="field" value={data.settings.booking_time_selection_start} /></label>
      <label><span class="field-label">Najkasniji termin rezervacije</span><input name="booking_time_selection_end" type="time" step="900" class="field" value={data.settings.booking_time_selection_end} /></label>
      <fieldset class="md:col-span-2 rounded-xl border border-[#e7e8eb] p-5">
        <legend class="px-2 text-sm font-black uppercase tracking-wide text-[#2b2b2b]">Shop dostava i pouzeće</legend>
        <div class="mb-6 rounded-xl border border-[#eadfba] bg-[#fffdf5] p-5">
          <div class="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 class="font-bold text-[#2b2b2b]">Overseas zone i cjenovni razredi</h2>
              <p class="mt-1 text-xs leading-relaxed text-[#7a7f86]">Zona I vrijedi za sve poštanske brojeve koji nisu navedeni u Zoni II. Besplatna Overseas dostava koristi prag iz polja iznad.</p>
            </div>
            <div class="space-y-2">
              <label class="flex items-center gap-3 text-sm font-bold"><input name="overseas_enabled" type="checkbox" checked={data.settings.overseas_enabled} class="h-4 w-4 accent-[#F5C518]" /> Overseas dostupan</label>
              <label class="flex items-center gap-3 text-sm"><input name="overseas_allows_cod" type="checkbox" checked={data.settings.overseas_allows_cod} class="h-4 w-4 accent-[#F5C518]" /> Dopušta pouzeće</label>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[560px] text-left text-sm">
              <thead><tr class="border-b border-[#e5dcc0] text-xs uppercase tracking-wide text-[#7a6a3c]"><th class="px-3 py-2">Vrijednost košarice</th><th class="px-3 py-2">Zona I EUR</th><th class="px-3 py-2">Zona II EUR</th></tr></thead>
              <tbody>
                {#each data.settings.overseas_tiers as tier, index}
                  <tr class="border-b border-[#eee8d7] last:border-0">
                    <td class="px-3 py-3 font-semibold text-[#4d5055]">{tier.label}</td>
                    <td class="px-3 py-3"><input aria-label="Zona I {tier.label}" name="overseas_zone_1_price_{index}" type="number" min="0" step="0.01" class="field" value={tier.zone_1_price} /></td>
                    <td class="px-3 py-3"><input aria-label="Zona II {tier.label}" name="overseas_zone_2_price_{index}" type="number" min="0" step="0.01" class="field" value={tier.zone_2_price} /></td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <label class="mt-5 block"><span class="field-label">Poštanski brojevi Zone II — jedan u retku</span><textarea name="overseas_zone_2_postal_codes" rows="8" class="field font-mono text-xs">{data.settings.overseas_zone_2_postal_codes}</textarea></label>
        </div>
        <div class="grid gap-5 md:grid-cols-2">
          <label><span class="field-label">BoxNow cijena EUR</span><input name="boxnow_price" type="number" min="0" step="0.01" class="field" value={data.settings.boxnow_price} /></label>
          <div class="space-y-2 self-end pb-3"><label class="flex items-center gap-3 text-sm font-bold"><input name="boxnow_enabled" type="checkbox" checked={data.settings.boxnow_enabled} class="h-4 w-4 accent-[#F5C518]" /> BoxNow dostupan</label><label class="flex items-center gap-3 text-sm"><input name="boxnow_allows_cod" type="checkbox" checked={data.settings.boxnow_allows_cod} class="h-4 w-4 accent-[#F5C518]" /> Dopušta pouzeće</label></div>
          <label><span class="field-label">Naknada za pouzeće EUR</span><input name="cash_on_delivery_surcharge" type="number" min="0" step="0.01" class="field" value={data.settings.cash_on_delivery_surcharge} /></label>
          <div class="space-y-3 self-end pb-3">
            <label class="flex items-center gap-3 text-sm font-bold"><input name="cash_on_delivery_enabled" type="checkbox" checked={data.settings.cash_on_delivery_enabled} class="h-4 w-4 accent-[#F5C518]" /> Plaćanje pouzećem dostupno</label>
            <label class="flex items-center gap-3 text-sm font-bold"><input name="personal_pickup_enabled" type="checkbox" checked={data.settings.personal_pickup_enabled} class="h-4 w-4 accent-[#F5C518]" /> Osobno preuzimanje dostupno</label>
            <label class="flex items-center gap-3 text-sm"><input name="personal_pickup_allows_cod" type="checkbox" checked={data.settings.personal_pickup_allows_cod} class="h-4 w-4 accent-[#F5C518]" /> Pouzeće uz osobno preuzimanje</label>
          </div>
        </div>
        <p class="mt-4 text-xs text-[#7a7f86]">BoxNow ostaje zasebna fiksna cijena. Osobno preuzimanje uvijek ima trošak 0 EUR.</p>
      </fieldset>
      <label class="md:col-span-2">
        <span class="field-label">Tvrtka JSON</span>
        <textarea name="company_json" rows="7" class="field font-mono text-xs">{data.settings.company_json}</textarea>
      </label>
      <label class="md:col-span-2">
        <span class="field-label">IBAN računi JSON</span>
        <textarea name="ibans_json" rows="10" class="field font-mono text-xs">{data.settings.ibans_json}</textarea>
      </label>
    </div>
    <div class="mt-5 rounded-xl border border-[#f0d87a] bg-[#fffaf0] p-4 text-sm text-[#6f5600]">
      Plaćanja koja nemaju produkcijske vjerodajnice moraju ostati vidljivo nedostupna; ovdje se ne unose tajni ključevi.
    </div>
    <button class="btn btn-primary mt-6 text-black">Spremi postavke</button>
  </form>
</div>
