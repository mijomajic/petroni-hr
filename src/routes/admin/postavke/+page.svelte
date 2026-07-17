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
      <label><span class="field-label">Besplatna dostava od EUR</span><input name="free_shipping_threshold" type="number" step="0.01" class="field" value={data.settings.free_shipping_threshold} /></label>
      <label><span class="field-label">Minimalna dob vozača</span><input name="min_driver_age" type="number" class="field" value={data.settings.min_driver_age} /></label>
      <label><span class="field-label">Uključeni km po danu</span><input name="km_per_day_included" type="number" class="field" value={data.settings.km_per_day_included} /></label>
      <label><span class="field-label">Druga rata, dana prije preuzimanja</span><input name="split_payment_due_days" type="number" class="field" value={data.settings.split_payment_due_days} /></label>
      <fieldset class="md:col-span-2 rounded-xl border border-[#e7e8eb] p-5">
        <legend class="px-2 text-sm font-black uppercase tracking-wide text-[#2b2b2b]">Shop dostava i pouzeće</legend>
        <div class="grid gap-5 md:grid-cols-2">
          <label><span class="field-label">Overseas cijena EUR</span><input name="overseas_price" type="number" min="0" step="0.01" class="field" value={data.settings.overseas_price} /></label>
          <div class="space-y-2 self-end pb-3"><label class="flex items-center gap-3 text-sm font-bold"><input name="overseas_enabled" type="checkbox" checked={data.settings.overseas_enabled} class="h-4 w-4 accent-[#F5C518]" /> Overseas dostupan</label><label class="flex items-center gap-3 text-sm"><input name="overseas_allows_cod" type="checkbox" checked={data.settings.overseas_allows_cod} class="h-4 w-4 accent-[#F5C518]" /> Dopušta pouzeće</label></div>
          <label><span class="field-label">BoxNow cijena EUR</span><input name="boxnow_price" type="number" min="0" step="0.01" class="field" value={data.settings.boxnow_price} /></label>
          <div class="space-y-2 self-end pb-3"><label class="flex items-center gap-3 text-sm font-bold"><input name="boxnow_enabled" type="checkbox" checked={data.settings.boxnow_enabled} class="h-4 w-4 accent-[#F5C518]" /> BoxNow dostupan</label><label class="flex items-center gap-3 text-sm"><input name="boxnow_allows_cod" type="checkbox" checked={data.settings.boxnow_allows_cod} class="h-4 w-4 accent-[#F5C518]" /> Dopušta pouzeće</label></div>
          <label><span class="field-label">Naknada za pouzeće EUR</span><input name="cash_on_delivery_surcharge" type="number" min="0" step="0.01" class="field" value={data.settings.cash_on_delivery_surcharge} /></label>
          <div class="space-y-3 self-end pb-3">
            <label class="flex items-center gap-3 text-sm font-bold"><input name="cash_on_delivery_enabled" type="checkbox" checked={data.settings.cash_on_delivery_enabled} class="h-4 w-4 accent-[#F5C518]" /> Plaćanje pouzećem dostupno</label>
            <label class="flex items-center gap-3 text-sm font-bold"><input name="personal_pickup_enabled" type="checkbox" checked={data.settings.personal_pickup_enabled} class="h-4 w-4 accent-[#F5C518]" /> Osobno preuzimanje dostupno</label>
            <label class="flex items-center gap-3 text-sm"><input name="personal_pickup_allows_cod" type="checkbox" checked={data.settings.personal_pickup_allows_cod} class="h-4 w-4 accent-[#F5C518]" /> Pouzeće uz osobno preuzimanje</label>
          </div>
        </div>
        <p class="mt-4 text-xs text-[#7a7f86]">Besplatna dostava koristi prag iz polja iznad. Osobno preuzimanje uvijek ima trošak 0 EUR.</p>
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
